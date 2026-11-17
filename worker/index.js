/**
 * Trinity Check intake Worker (2026-11-15 rewrite)
 *
 * One endpoint takes every form on trinity.easeai.com.tw:
 *   POST /api/intake            { kind, lang, answers, hp }
 *                               -> { ok:true, id, mail:{ confirm, notify } }
 *                               -> { ok:false, error } (4xx/5xx)
 *   GET  /api/intake/list?token=…   every stored record, newest first (INTAKE_TOKEN secret)
 *   GET  /api/health            { ok:true, store, mail }
 *
 * kind = 'analyze'  (the 19-question form; answers.plan = free | report | report-meet)
 *      = 'waitlist' (the principle-deck list; answers.email only)
 *      = 'course'   (course-materials waitlist from the footer; name, email, topics, note)
 *
 * What happens on every submission, in this order:
 *   1. validate + rate-limit, assign an id like  R-261115-7K3Q  (letter = plan/kind)
 *   2. store the full record in KV  (key in:<id>)   <- the durable copy, written BEFORE any email
 *      (also to R2 when a BUCKET binding exists; R2 is not enabled on this account yet)
 *   3. confirmation email to the submitter (bilingual, chosen language first, full answers inside)
 *   4. notification email to Vincent (NOTIFY_TO), reply_to = submitter
 *   5. respond. ok:true means "stored"; the mail statuses ride along so the page can be honest
 *      about whether the confirmation actually went out.
 *
 * Bindings / config (wrangler.toml):
 *   STORE           KV namespace (same one trinity-counter uses; wl:<email> keys stay compatible)
 *   BUCKET          optional R2 bucket
 *   NOTIFY_TO       Vincent's inbox
 *   PUBLIC_EMAIL    the address shown to users as the fallback
 *   MAIL_FROM       verified Resend sender (vs.easeai.com.tw is the verified domain)
 *   SITE_URL        https://trinity.easeai.com.tw
 *   RESEND_API_KEY  secret. Missing -> stored, mail status 'skipped_nokey'
 *   INTAKE_TOKEN    secret, optional. Enables GET /api/intake/list
 *   MAIL_SINK_URL   dev only (.dev.vars). When set, emails are POSTed there as JSON instead of Resend.
 */

const ALLOW_ORIGINS = new Set([
  'https://trinity.easeai.com.tw',
  'https://trinity-7x1.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const RATE_PER_HOUR = 40 // per IP per hour: covers a workshop room on one Wi-Fi, stops a script. RATE_LIMIT var overrides (dev).
const MAIL_TIMEOUT_MS = 8000
const PERSONAL_SITE = 'https://vincent.easeai.com.tw'
// 261117: pitch deck upload rides in the JSON as base64 and goes out ONLY as a Resend attachment
// to NOTIFY_TO. KV keeps the fields and the file name, never the file itself. R2 is not enabled.
const DECK_MAX = 15 * 1024 * 1024
const DECK_EXT = /\.(pdf|ppt|pptx|key)$/i
const HTTPS_RE = /^https:\/\/[^\s.]+\.[^\s]+$/i

// Field order = order in both emails. [key, zh label, en label, max chars]
const ANALYZE_FIELDS = [
  ['company', '公司或專案名稱', 'Company or project', 200],
  ['name', '姓名與職稱', 'Name and role', 200],
  ['email', 'Email', 'Email', 200],
  ['website', '網站', 'Website', 500],
  ['oneLine', '一句話說你在做什麼', 'In one line', 600],
  ['pain', '你解決的痛點', 'The pain you solve', 4000],
  ['customer', '你最先拿下的客群', 'The customer you win first', 4000],
  ['evidence', '需求的證據', 'Proof of demand', 4000],
  ['solution', '你的解方', 'Your solution', 4000],
  ['team', '為什麼是你們', 'Why your team', 4000],
  ['demo', 'Demo 連結', 'Demo link', 500],
  ['money', '錢怎麼進來', 'How the money works', 4000],
  ['metrics', '關鍵數字', 'Key numbers', 1000],
  ['whyNow', '為什麼是現在', 'Why now', 4000],
  ['model', '商業模式', 'Business model', 100],
  ['stage', '產品階段', 'Product stage', 100],
  ['markets', '目標市場', 'Target markets', 300],
  ['funding', '募資輪次', 'Funding round', 100],
  ['deck', 'Pitch deck 連結', 'Pitch deck link', 500],
  ['deckFile', '簡報檔（附件）', 'Pitch deck file', 200],
  ['plan', '你申請的服務', 'What you asked for', 40],
  ['reportLang', '報告語言', 'Report language', 10],
  ['consentTrack', '資料走向', 'Who sees it', 40],
]
const PLANS = {
  free: { letter: 'A', zh: '免費初步判讀', en: 'Free first read', price: '' },
  report: { letter: 'R', zh: '完整評案報告', en: 'Full report', price: 'US$100' },
  'report-meet': { letter: 'M', zh: '完整評案報告＋Google Meet 60 分鐘', en: 'Full report + 60-minute Google Meet', price: 'US$200' },
}
const TRACKS = {
  confidential: { zh: '僅私密分析（不給任何第三方）', en: 'Confidential only (never shared)' },
  ecosystem: { zh: '分析＋生態系曝光（契合時可引薦）', en: 'Analysis + ecosystem visibility (introduction possible where it fits)' },
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
    const origin = request.headers.get('Origin') || ''
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), origin)
    try {
      if (path === '/api/health') return cors(json({ ok: true, store: Boolean(env.STORE), r2: Boolean(env.BUCKET), mail: env.RESEND_API_KEY ? 'resend' : (env.MAIL_SINK_URL ? 'sink' : 'none') }), origin)
      if (path === '/api/intake' && request.method === 'POST') {
        if (origin && !ALLOW_ORIGINS.has(origin)) return cors(json({ ok: false, error: 'origin' }, 403), origin)
        return cors(await intake(request, env, ctx), origin)
      }
      if (path === '/api/intake/list' && request.method === 'GET') return cors(await list(url, env), origin)
    } catch (err) {
      return cors(json({ ok: false, error: 'server_error', detail: String((err && err.message) || err) }, 500), origin)
    }
    return cors(json({ ok: false, error: 'not_found' }, 404), origin)
  },
}

/* ---------- intake ---------- */

async function intake(request, env) {
  if (!env.STORE) return json({ ok: false, error: 'no_store' }, 500)
  let body
  try { body = await request.json() } catch { return json({ ok: false, error: 'bad_json' }, 400) }
  if (body.hp) return json({ ok: true, id: fakeId(), mail: { confirm: 'skipped', notify: 'skipped' } }) // honeypot: bots see success, nothing stored
  const kind = body.kind === 'waitlist' ? 'waitlist' : body.kind === 'analyze' ? 'analyze' : body.kind === 'course' ? 'course' : null
  if (!kind) return json({ ok: false, error: 'bad_kind' }, 400)
  const lang = body.lang === 'zh' ? 'zh' : 'en'
  const raw = body.answers && typeof body.answers === 'object' ? body.answers : {}

  // rate limit: per IP per hour, generous enough for a classroom, tight enough for a script
  const ip = request.headers.get('cf-connecting-ip') || 'local'
  const rlKey = 'rl:' + ip
  const hits = parseInt((await env.STORE.get(rlKey)) || '0', 10)
  if (hits >= (Number(env.RATE_LIMIT) || RATE_PER_HOUR)) return json({ ok: false, error: 'busy' }, 429)
  await env.STORE.put(rlKey, String(hits + 1), { expirationTtl: 3600 })

  let answers, letter, deck = null
  if (kind === 'analyze') {
    answers = {}
    for (const [k, , , max] of ANALYZE_FIELDS) answers[k] = clean(raw[k], max)
    // required deck file (base64) + https website, checked here as well as in the form
    const df = body.deckFile && typeof body.deckFile === 'object' ? body.deckFile : null
    const fname = clean(df && df.name, 200)
    const b64 = df && typeof df.b64 === 'string' ? df.b64.replace(/\s/g, '') : ''
    if (!fname || !DECK_EXT.test(fname) || !b64 || !/^[A-Za-z0-9+/]+=*$/.test(b64)) return json({ ok: false, error: 'deck_missing' }, 400)
    const bytes = Math.floor(b64.length * 3 / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
    if (bytes > DECK_MAX) return json({ ok: false, error: 'deck_too_big' }, 413)
    if (!HTTPS_RE.test(answers.website)) return json({ ok: false, error: 'website' }, 400)
    answers.deckFile = `${fname} (${(bytes / 1048576).toFixed(1)} MB)`
    deck = { filename: fname, content: b64 }
    if (!PLANS[answers.plan]) answers.plan = 'free'
    if (answers.plan === 'free') answers.reportLang = ''
    else if (answers.reportLang !== 'zh' && answers.reportLang !== 'en') answers.reportLang = lang
    if (answers.consentTrack !== 'ecosystem') answers.consentTrack = 'confidential'
    if (!answers.company || !answers.name || !EMAIL_RE.test(answers.email) || !answers.oneLine) {
      return json({ ok: false, error: 'missing' }, 400)
    }
    letter = PLANS[answers.plan].letter
  } else if (kind === 'course') {
    // 261117 PM: course-materials waitlist from the footer. name + email + topics required, note optional.
    answers = { name: clean(raw.name, 120), email: clean(raw.email, 200).toLowerCase(), topics: clean(raw.topics, 400), note: clean(raw.note, 600) }
    if (!answers.name || !answers.topics) return json({ ok: false, error: 'missing' }, 400)
    if (!EMAIL_RE.test(answers.email)) return json({ ok: false, error: 'email' }, 400)
    letter = 'C'
  } else {
    const email = clean(raw.email, 200).toLowerCase()
    if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'email' }, 400)
    answers = { email }
    letter = 'W'
  }

  const ts = new Date().toISOString()
  const id = makeId(letter, ts)
  const record = { id, kind, lang, ts, answers, src: clean(body.s, 60), mail: { confirm: 'pending', notify: 'pending' }, ua: clean(request.headers.get('User-Agent'), 200) }

  // 1) durable copy first
  await env.STORE.put('in:' + id, JSON.stringify(record))
  if (kind === 'waitlist') {
    const existed = await env.STORE.get('wl:' + answers.email)
    await env.STORE.put('wl:' + answers.email, JSON.stringify({ email: answers.email, ts, lang, source: 'trinity /deck', id }))
    record.waitlistNew = !existed
  }
  if (env.BUCKET) {
    try { await env.BUCKET.put(`intake/${kind}/${id}.json`, JSON.stringify(record, null, 2), { httpMetadata: { contentType: 'application/json' } }) } catch { /* R2 is a bonus copy */ }
  }

  // 2) confirmation to the submitter, then 3) notification to Vincent (carries the confirmation status)
  const to = answers.email
  const c1 = await sendMail(env, kind === 'analyze' ? confirmAnalyze(env, record) : kind === 'course' ? confirmCourse(env, record) : confirmWaitlist(env, record), to, env.PUBLIC_EMAIL)
  record.mail.confirm = c1.status
  const n1 = await sendMail(env, notifyVincent(env, record), env.NOTIFY_TO, to, deck ? [deck] : undefined)
  record.mail.notify = n1.status
  record.mailIds = { confirm: c1.id, notify: n1.id }
  await env.STORE.put('in:' + id, JSON.stringify(record))

  return json({ ok: true, id, mail: record.mail, mailIds: record.mailIds })
}

async function list(url, env) {
  const token = url.searchParams.get('token') || ''
  if (!env.INTAKE_TOKEN || token !== env.INTAKE_TOKEN) return json({ ok: false, error: 'unauthorized' }, 401)
  const out = []
  let cursor
  do {
    const page = await env.STORE.list({ prefix: 'in:', cursor })
    for (const k of page.keys) { const v = await env.STORE.get(k.name); if (v) out.push(JSON.parse(v)) }
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)
  out.sort((a, b) => (a.ts < b.ts ? 1 : -1))
  return json({ ok: true, count: out.length, list: out })
}

/* ---------- mail transport ---------- */

/** Returns { status, id }, never throws. status: 'sent' | 'failed <why>' | 'skipped_nokey'; id = Resend message id. */
async function sendMail(env, msg, to, replyTo, attachments) {
  const r = await sendMailRaw(env, msg, to, replyTo, attachments)
  return typeof r === 'string' ? { status: r, id: '' } : r
}
async function sendMailRaw(env, msg, to, replyTo, attachments) {
  if (!to) return 'skipped_noaddr'
  const payload = { from: env.MAIL_FROM, to: [to], reply_to: replyTo || undefined, subject: msg.subject, html: msg.html, text: msg.text, attachments: attachments || undefined }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), MAIL_TIMEOUT_MS)
  try {
    if (env.MAIL_SINK_URL) {
      const r = await fetch(env.MAIL_SINK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal })
      return r.ok ? 'sent' : 'failed sink ' + r.status
    }
    if (!env.RESEND_API_KEY) return 'skipped_nokey'
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok) return { status: 'sent', id: String(j.id || '') }
    return 'failed ' + r.status + ' ' + (j.message || j.name || '')
  } catch (e) {
    return 'failed ' + (e && e.name === 'AbortError' ? 'timeout' : String((e && e.message) || e)).slice(0, 80)
  } finally { clearTimeout(timer) }
}

/* ---------- email bodies ---------- */

const F = "font-family:-apple-system,BlinkMacSystemFont,'PingFang TC','Noto Sans TC','Microsoft JhengHei',Arial,sans-serif;"
const planLabel = (plan, l) => PLANS[plan] ? PLANS[plan][l] + (PLANS[plan].price ? ` · ${PLANS[plan].price}` : '') : ''
const trackLabel = (t, l) => (TRACKS[t] || TRACKS.confidential)[l]
const taipei = (iso) => new Date(new Date(iso).getTime() + 8 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + '（台北時間 / Taipei）'

/** The full answer table, one language of labels. Empty answers are skipped. */
function answersTable(answers, l) {
  const rows = []
  for (const [k, zh, en] of ANALYZE_FIELDS) {
    let v = answers[k]
    if (!v) continue
    if (k === 'plan') v = planLabel(v, l)
    else if (k === 'consentTrack') v = trackLabel(v, l)
    else if (k === 'reportLang') v = v === 'zh' ? '中文' : 'English'
    rows.push(`<tr><td style="${F}font-size:14px;color:#8a97a5;padding:8px 14px 8px 0;vertical-align:top;white-space:nowrap;border-top:1px solid #eef1f4">${esc(l === 'zh' ? zh : en)}</td><td style="${F}font-size:15px;line-height:1.6;color:#0b1623;padding:8px 0;border-top:1px solid #eef1f4">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>`
}
function answersText(answers, l) {
  const lines = []
  for (const [k, zh, en] of ANALYZE_FIELDS) {
    let v = answers[k]
    if (!v) continue
    if (k === 'plan') v = planLabel(v, l)
    else if (k === 'consentTrack') v = trackLabel(v, l)
    else if (k === 'reportLang') v = v === 'zh' ? '中文' : 'English'
    lines.push(`${l === 'zh' ? zh : en}: ${v}`)
  }
  return lines.join('\n')
}

function shell(title, inner) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border:1px solid #e6e8f0;border-radius:16px">
<tr><td style="padding:28px 28px 8px;${F}font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;font-weight:700">Trinity Check</td></tr>
<tr><td style="padding:0 28px 6px;${F}font-size:22px;font-weight:700;color:#0b1623;line-height:1.3">${title}</td></tr>
${inner}
<tr><td style="padding:22px 28px 28px;${F}font-size:12.5px;line-height:1.7;color:#8a97a5;border-top:1px solid #eef1f4">
Trinity Check · <a href="https://trinity.easeai.com.tw" style="color:#8a97a5">trinity.easeai.com.tw</a> · Vincent Wang · <a href="${PERSONAL_SITE}" style="color:#8a97a5">vincent.easeai.com.tw</a><br>
這是一份獨立意見，僅供參考，不構成投資、法律或財務建議，並與任何基金的投資決定分開。<br>
An independent opinion for information only, not investment, legal or financial advice, and kept separate from any fund's investment decisions.
</td></tr></table></td></tr></table>`
}
const block = (html) => `<tr><td style="padding:10px 28px;${F}font-size:15.5px;line-height:1.75;color:#0b1623">${html}</td></tr>`
const h3 = (t) => `<div style="${F}font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8a97a5;margin:14px 0 6px">${t}</div>`
const idBadge = (id) => `<span style="display:inline-block;${F}font-size:15px;font-weight:700;color:#0b1623;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:4px 10px;letter-spacing:.04em">${esc(id)}</span>`

/** What happens next, per plan. Returns [zhSteps[], enSteps[]]. */
function nextSteps(plan, publicEmail) {
  if (plan === 'free') return [
    ['Vincent 會親自讀你填的內容，不是機器自動回覆。', '24 小時內回信給你一份初步判讀：三個透鏡各一句話，加上最該先驗的那一個假設。', `想補資料或更正，直接回這封信，或寫到 ${publicEmail}，記得帶上編號。`],
    ['Vincent reads what you wrote himself. This is not an automated verdict.', 'Within 24 hours you get a first read by email: one line per lens, plus the single assumption to test first.', `To add or correct anything, reply to this email or write to ${publicEmail} and quote the id.`],
  ]
  const meet = plan === 'report-meet'
  return [
    ['Vincent 會親自讀你填的內容，24 小時內回信：確認範圍、報價與付款方式。', `現在不需要付款，也還沒有任何費用產生。報告 US$100${meet ? '，Google Meet 60 分鐘 US$100，合計 US$200' : ''}，付款方式在回信裡。`, `付款後開始分析，報告以 email 寄出（${meet ? '一頁 A4，中文或英文；Meet 在報告寄出後安排，回信時一起約時間' : '一頁 A4，中文或英文'}），回信時會告訴你預計完成日。`, `想補資料或更正，直接回這封信，或寫到 ${publicEmail}，記得帶上編號。`],
    ['Vincent reads your answers himself and replies within 24 hours to confirm scope, price and how to pay.', `Nothing is due now and nothing has been charged. The report is US$100${meet ? ', the 60-minute Google Meet is US$100, US$200 in total' : ''}; payment details come in the reply.`, `Analysis starts after payment and the report arrives by email (one A4 page, Chinese or English${meet ? '; the Meet is scheduled after the report is sent, we pick a time in that reply' : ''}). The reply tells you the expected delivery date.`, `To add or correct anything, reply to this email or write to ${publicEmail} and quote the id.`],
  ]
}
const ol = (items) => `<ol style="margin:4px 0 0;padding-left:22px">${items.map((s) => `<li style="margin:4px 0">${s}</li>`).join('')}</ol>`

function confirmAnalyze(env, rec) {
  const a = rec.answers
  const [zhSteps, enSteps] = nextSteps(a.plan, env.PUBLIC_EMAIL)
  const zh = `
${h3('收到了什麼')}
<b>${esc(a.company)}</b>：${esc(a.oneLine)}<br>
申請的服務：${esc(planLabel(a.plan, 'zh'))}${a.reportLang ? `（報告語言：${a.reportLang === 'zh' ? '中文' : 'English'}）` : ''}<br>
資料走向：${esc(trackLabel(a.consentTrack, 'zh'))}
${h3('接下來')}
${ol(zhSteps.map(esc))}
<p style="margin:12px 0 0;color:#5a6b7c;font-size:14px">你的資料只用來準備判讀，不販售，保存最長 12 個月，隨時可來信要求刪除。</p>`
  const en = `
${h3('What we received')}
<b>${esc(a.company)}</b>: ${esc(a.oneLine)}<br>
Requested: ${esc(planLabel(a.plan, 'en'))}${a.reportLang ? ` (report in ${a.reportLang === 'zh' ? 'Chinese' : 'English'})` : ''}<br>
Who sees it: ${esc(trackLabel(a.consentTrack, 'en'))}
${h3('What happens next')}
${ol(enSteps.map(esc))}
<p style="margin:12px 0 0;color:#5a6b7c;font-size:14px">Your data is used only to prepare your read, never sold, kept for at most 12 months, and deleted on request.</p>`
  const first = rec.lang === 'zh' ? zh : en
  const second = rec.lang === 'zh' ? en : zh
  const title = rec.lang === 'zh'
    ? `收到了，你的編號是 ${idBadge(rec.id)}`
    : `Received. Your id is ${idBadge(rec.id)}`
  const inner = block(first) + `<tr><td style="padding:6px 28px"><hr style="border:0;border-top:1px solid #eef1f4;margin:0"></td></tr>` + block(second)
    + block(`${h3(rec.lang === 'zh' ? '你送出的全部內容 / Everything you sent' : 'Everything you sent / 你送出的全部內容')}${answersTable(a, rec.lang)}`)
  const subject = rec.lang === 'zh'
    ? `收到你的案子 ${rec.id}｜${a.company}｜Trinity Check`
    : `We received your submission ${rec.id} | ${a.company} | Trinity Check`
  const text = (rec.lang === 'zh'
    ? `收到了，編號 ${rec.id}\n\n收到了什麼\n${a.company}：${a.oneLine}\n申請的服務：${planLabel(a.plan, 'zh')}\n資料走向：${trackLabel(a.consentTrack, 'zh')}\n\n接下來\n${zhSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\nReceived. Your id is ${rec.id}\n\nWhat happens next\n${enSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : `Received. Your id is ${rec.id}\n\nWhat we received\n${a.company}: ${a.oneLine}\nRequested: ${planLabel(a.plan, 'en')}\nWho sees it: ${trackLabel(a.consentTrack, 'en')}\n\nWhat happens next\n${enSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\n收到了，編號 ${rec.id}\n\n接下來\n${zhSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)
    + `\n\n---\n${rec.lang === 'zh' ? '你送出的全部內容' : 'Everything you sent'}\n${answersText(a, rec.lang)}\n\nTrinity Check · https://trinity.easeai.com.tw · Vincent Wang · ${PERSONAL_SITE}`
  return { subject, html: shell(title, inner), text }
}

function confirmWaitlist(env, rec) {
  const zh = `
${h3('收到了什麼')}
你的 email：<b>${esc(rec.answers.email)}</b>，已加入創業原則卡的等候名單。
${h3('接下來')}
${ol([
  '目前不收費。等候名單不是訂單，也不會自動變成訂單。',
  '滿 10 人才開始製作這副卡。',
  '開始製作前，Vincent 會先寄一封信給你：價格、內含物、寄送方式，由你決定要不要買。',
  `想退出名單，直接回這封信，或寫到 ${env.PUBLIC_EMAIL}。`,
].map(esc))}`
  const en = `
${h3('What we received')}
Your email, <b>${esc(rec.answers.email)}</b>, is on the waitlist for the Principle Deck.
${h3('What happens next')}
${ol([
  'Nothing is charged now. The waitlist is not an order and does not turn into one by itself.',
  'The deck goes into production once 10 people are on the list.',
  'Before production starts, Vincent emails you the price, what is in the box and shipping, and you decide whether to buy.',
  `To leave the list, reply to this email or write to ${env.PUBLIC_EMAIL}.`,
].map(esc))}`
  const first = rec.lang === 'zh' ? zh : en
  const second = rec.lang === 'zh' ? en : zh
  const title = rec.lang === 'zh' ? `已加入等候名單 ${idBadge(rec.id)}` : `You are on the list ${idBadge(rec.id)}`
  const subject = rec.lang === 'zh' ? `已加入原則卡等候名單 ${rec.id}｜Trinity Check` : `You are on the Principle Deck waitlist ${rec.id} | Trinity Check`
  const text = `${rec.lang === 'zh' ? '已加入等候名單' : 'You are on the list'} ${rec.id}\n${rec.answers.email}\n\n目前不收費；滿 10 人才開始製作；開始製作前會先寄信給你，由你決定要不要買。退出名單請回信或寫到 ${env.PUBLIC_EMAIL}。\n\nNothing is charged now; production starts at 10 people; you get an email with price and contents before that and decide then. To leave the list, reply or write to ${env.PUBLIC_EMAIL}.`
  return { subject, html: shell(title, block(first) + `<tr><td style="padding:6px 28px"><hr style="border:0;border-top:1px solid #eef1f4;margin:0"></td></tr>` + block(second)), text }
}

function confirmCourse(env, rec) {
  const a = rec.answers
  const zh = `
${h3('收到了什麼')}
${esc(a.name)}，你已加入教材的等候名單。<br>
想要的主題：<b>${esc(a.topics)}</b>${a.note ? `<br>你留的話：${esc(a.note)}` : ''}
${h3('接下來')}
${ol([
  '目前不收費，等候名單不是訂單。',
  '教材準備好時，Vincent 會先寫信告訴你內容與價格，由你決定要不要買。',
  `想補充或退出名單，直接回這封信，或寫到 ${env.PUBLIC_EMAIL}。`,
].map(esc))}`
  const en = `
${h3('What we received')}
Thanks, ${esc(a.name)}. You are on the waitlist for the course materials.<br>
Topics: <b>${esc(a.topics)}</b>${a.note ? `<br>Your note: ${esc(a.note)}` : ''}
${h3('What happens next')}
${ol([
  'Nothing is charged. The waitlist is not an order.',
  'When the materials are ready, Vincent will email you what is inside and the price first. You decide then.',
  `To add something or leave the list, reply to this email or write to ${env.PUBLIC_EMAIL}.`,
].map(esc))}`
  const first = rec.lang === 'zh' ? zh : en
  const second = rec.lang === 'zh' ? en : zh
  const title = rec.lang === 'zh' ? `已加入教材等候名單 ${idBadge(rec.id)}` : `You are on the course list ${idBadge(rec.id)}`
  const subject = rec.lang === 'zh' ? `已加入教材等候名單 ${rec.id}｜Trinity` : `You are on the course materials waitlist ${rec.id} | Trinity`
  const text = `${rec.lang === 'zh' ? '已加入教材等候名單' : 'You are on the course materials waitlist'} ${rec.id}\n${a.name} · ${a.email}\n${a.topics}${a.note ? '\n' + a.note : ''}\n\n目前不收費；教材準備好時會先寫信告訴你內容與價格，由你決定。\nNothing is charged; when the materials are ready you get an email with contents and price first, and decide then.`
  return { subject, html: shell(title, block(first) + `<tr><td style="padding:6px 28px"><hr style="border:0;border-top:1px solid #eef1f4;margin:0"></td></tr>` + block(second)), text }
}

function notifyVincent(env, rec) {
  if (rec.kind === 'course') return notifyCourse(env, rec)
  const a = rec.answers
  const isA = rec.kind === 'analyze'
  const who = isA ? `${a.name}（${a.company}）` : a.email
  const chips = (isA ? [planLabel(a.plan, 'zh'), trackLabel(a.consentTrack, 'zh'), a.reportLang ? `報告：${a.reportLang === 'zh' ? '中文' : 'English'}` : '', `填表語言 ${rec.lang}`] : ['原則卡等候名單', rec.waitlistNew ? '新 email' : '重複登記', `語言 ${rec.lang}`])
    .filter(Boolean)
    .map((t) => `<span style="display:inline-block;${F}font-size:13px;font-weight:600;color:#1d4ed8;background:#eef2ff;border:1px solid #c7d2fe;border-radius:999px;padding:3px 10px;margin:0 6px 6px 0">${esc(t)}</span>`).join('')
  const inner = block(`
<div style="color:#8a97a5;font-size:13.5px">送出時間 ${esc(taipei(rec.ts))} · 編號 ${idBadge(rec.id)}</div>
<div style="color:#5a6b7c;font-size:13.5px;margin-top:4px">來源 s：<b>${esc(rec.src || '（無）')}</b>${isA && a.website ? ` · 網站：<a href="${esc(a.website)}">${esc(a.website)}</a>` : ''}${isA && a.deckFile ? ` · 簡報附件：${esc(a.deckFile)}` : ''}</div>
<div style="margin:8px 0 4px">${chips}</div>
${isA ? `<p style="margin:8px 0 0"><b>${esc(a.company)}</b>：${esc(a.oneLine)}</p>` : ''}
<p style="margin:12px 0 0"><a href="mailto:${esc(a.email)}?subject=${encodeURIComponent('Re: ' + (isA ? `Trinity Check ${rec.id} · ${a.company}` : `Trinity 原則卡 ${rec.id}`))}" style="display:inline-block;${F}font-size:15px;font-weight:700;color:#fff;background:#0b1623;text-decoration:none;padding:10px 18px;border-radius:8px">回信給 ${esc(isA ? a.name : a.email)}</a>
<span style="${F}font-size:13.5px;color:#8a97a5;margin-left:10px">直接按回覆也會寄給對方（reply-to 已設）</span></p>
${h3('對方收到的確認信')}
<span style="${F}font-size:14px;color:${rec.mail.confirm === 'sent' ? '#0e7a55' : '#b45309'}">${esc(rec.mail.confirm)}${rec.mail.confirm === 'sent' ? '' : '　← 對方沒拿到確認信，回信時請一併告知編號'}</span>
${isA ? `${h3('完整內容（中文欄名）')}${answersTable(a, 'zh')}` : ''}
${h3('存放位置')}
<span style="${F}font-size:13.5px;color:#8a97a5">KV ${esc(env.STORE ? 'in:' + rec.id : '（無）')}${env.BUCKET ? ` · R2 intake/${rec.kind}/${rec.id}.json` : ''}${isA ? ' · 下一步：跑 deal-lens，寫成人話，回信' : ''}</span>`)
  const subject = isA
    ? `Trinity ${rec.id}｜${a.company}｜${PLANS[a.plan].zh}${PLANS[a.plan].price ? ' ' + PLANS[a.plan].price : ''}`
    : `Trinity ${rec.id}｜原則卡等候名單｜${a.email}`
  const text = `${subject}\n送出時間 ${taipei(rec.ts)}\n來源 s：${rec.src || '（無）'}\n${isA ? answersText(a, 'zh') : a.email}\n確認信：${rec.mail.confirm}\nKV in:${rec.id}`
  return { subject, html: shell(isA ? `新案子：${esc(who)}` : `原則卡名單 +1：${esc(who)}`, inner), text }
}

function notifyCourse(env, rec) {
  const a = rec.answers
  const inner = block(`
<div style="color:#8a97a5;font-size:13.5px">送出時間 ${esc(taipei(rec.ts))} · 編號 ${idBadge(rec.id)}</div>
<div style="color:#5a6b7c;font-size:13.5px;margin-top:4px">來源 s：<b>${esc(rec.src || '（無）')}</b> · 填表語言 ${esc(rec.lang)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
${[['名字', a.name], ['Email', a.email], ['想要的主題', a.topics], ['一句話', a.note || '（沒填）']].map(([k, v]) => `<tr><td style="${F}font-size:14px;color:#8a97a5;padding:8px 14px 8px 0;vertical-align:top;white-space:nowrap;border-top:1px solid #eef1f4">${esc(k)}</td><td style="${F}font-size:15px;line-height:1.6;color:#0b1623;padding:8px 0;border-top:1px solid #eef1f4">${esc(v)}</td></tr>`).join('')}
</table>
<p style="margin:14px 0 0"><a href="mailto:${esc(a.email)}?subject=${encodeURIComponent('Re: Trinity 教材 ' + rec.id)}" style="display:inline-block;${F}font-size:15px;font-weight:700;color:#fff;background:#0b1623;text-decoration:none;padding:10px 18px;border-radius:8px">回信給 ${esc(a.name)}</a></p>
${h3('對方收到的確認信')}
<span style="${F}font-size:14px;color:${rec.mail.confirm === 'sent' ? '#0e7a55' : '#b45309'}">${esc(rec.mail.confirm)}</span>
${h3('存放位置')}
<span style="${F}font-size:13.5px;color:#8a97a5">KV in:${esc(rec.id)}</span>`)
  const subject = `Trinity ${rec.id}｜教材等候名單｜${a.name}｜${a.topics}`
  const text = `${subject}\n送出時間 ${taipei(rec.ts)}\n來源 s：${rec.src || '（無）'}\n名字：${a.name}\nEmail：${a.email}\n主題：${a.topics}\n一句話：${a.note || '（沒填）'}\n確認信：${rec.mail.confirm}\nKV in:${rec.id}`
  return { subject, html: shell(`教材名單 +1：${esc(a.name)}`, inner), text }
}

/* ---------- helpers ---------- */

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no 0/O/1/I
function makeId(letter, iso) {
  const d = iso.slice(2, 10).replace(/-/g, '')
  const buf = new Uint8Array(4); crypto.getRandomValues(buf)
  return `${letter}-${d}-${[...buf].map((b) => ALPHABET[b % 32]).join('')}`
}
function fakeId() { return makeId('A', new Date().toISOString()) }
function clean(v, n) {
  if (Array.isArray(v)) v = v.filter(Boolean).join(', ')
  if (typeof v !== 'string') return ''
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n)
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store' } })
}
function cors(res, origin) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', ALLOW_ORIGINS.has(origin) ? origin : 'https://trinity.easeai.com.tw')
  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  h.set('Access-Control-Max-Age', '86400')
  return new Response(res.body, { status: res.status, headers: h })
}
