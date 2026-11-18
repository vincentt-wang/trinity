// Venture Relations 週信素材（261118）。產兩樣東西，都放 public/nl/，跟網站一起部署：
//   public/nl/feed.json      週信 worker（vincent.easeai.com.tw）每週讀這份挑文章、組信。只收已發布且 src/nlIssues.ts 有手寫文案的集數。
//   public/nl/epNN-zh.png    數據圖（epStories 的 chart 畫成圖片，信裡不能跑 React），中英各一張，520 寬、2 倍解析度。
//
//   node --experimental-strip-types scripts/nl_build.mjs          產 feed 與缺少的數據圖
//   node --experimental-strip-types scripts/nl_build.mjs --force  數據圖全部重畫
//
// 產完會把所有文案跑一次 check_voice.py 與破折號、佔位符檢查，有一項不過就 exit 1，不寫 feed。
import { writeFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EPISODES } from '../src/episodeData.ts'
import { EP_STORY } from '../src/epStories.ts'
import { NL_ISSUES, NL_NEXT } from '../src/nlIssues.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/nl')
const SITE = 'https://trinity.easeai.com.tw'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const force = process.argv.includes('--force')
mkdirSync(OUT, { recursive: true })

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const strip = (s) => String(s).replace(/<[^>]+>/g, '')

// ---- 數據圖：label 在上、長條在下，手機縮到 350 寬時字還有 13px 左右。數值標在長條右邊，長條區右側留 90px 給數值。
function chartHtml(c, lang) {
  const max = c.max || Math.max(...c.rows.map((r) => r.v))
  const pct = (v) => Math.max(1.2, Math.min(100, (v / max) * 100))
  const F = lang === 'zh' ? "'PingFang TC','Heiti TC',sans-serif" : "-apple-system,'Helvetica Neue',Arial,sans-serif"
  const line = c.line ? `<div class="ln" style="left:${pct(c.line.v)}%"><span>${esc(c.line.label)}</span></div>` : ''
  const rows = c.rows.map((r) => `<div class="r"><div class="l"><span>${esc(r.label)}</span></div><div class="b"><i style="width:${pct(r.v)}%;background:${r.hl ? '#0A1628' : '#C5CFD9'}"></i><em class="${r.hl ? 'hl' : ''}" style="left:calc(${pct(r.v)}% + 10px)">${esc(r.show)}</em></div></div>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}html,body{background:#fff}body{width:520px;padding:26px 24px 22px;font-family:${F};color:#0B1623}
h1{font-size:26px;line-height:1.35;font-weight:700}p.ld{font-size:19px;line-height:1.5;color:#5A6B7C;margin-top:6px}
.gw{position:relative;margin:22px 96px 0 0;padding-top:${c.line ? 28 : 0}px}
.r{margin-bottom:13px}.r:last-child{margin-bottom:0}.l{font-size:21px;line-height:1.3;margin-bottom:5px}.l span{position:relative;z-index:2;background:#fff;padding-right:6px}
.b{position:relative;height:22px}.b i{position:absolute;left:0;top:0;height:22px;border-radius:4px}
.b em{position:absolute;z-index:2;background:#fff;padding:0 4px;margin-left:-4px;top:-3px;font-style:normal;font-size:21px;font-weight:700;color:#5A6B7C;white-space:nowrap}.b em.hl{color:#0A1628}
.ln{position:absolute;z-index:1;top:0;bottom:0;border-left:2px dashed #FF6600}.ln span{position:absolute;top:2px;left:6px;font-size:17px;font-weight:700;color:#C2410C;white-space:nowrap}
</style></head><body><h1>${esc(c.h)}</h1>${c.lead ? `<p class="ld">${esc(strip(c.lead))}</p>` : ''}
<div class="gw">${rows}${line}</div>
<script>document.body.setAttribute('data-h', Math.ceil(document.body.getBoundingClientRect().height))</script></body></html>`
}

function chrome(args) {
  // 每次用獨立的暫存 profile：共用預設 profile 時，連跑兩次第二次會 exit 2
  const prof = join(tmpdir(), 'nl2_chrome_' + process.pid)
  try { return execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--user-data-dir=' + prof, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) }
  catch (e) { return e.stdout || '' }
}
function shoot(html, png) {
  const tmp = join(tmpdir(), 'nl2_chart_' + process.pid + '.html')
  writeFileSync(tmp, html)
  const dom = chrome(['--window-size=520,1600', '--dump-dom', 'file://' + tmp])
  const h = Number((dom.match(/data-h="(\d+)"/) || [])[1] || 0)
  if (!h) throw new Error('量不到圖高：' + png)
  const before = existsSync(png) ? statSync(png).mtimeMs : 0
  chrome([`--window-size=520,${h}`, '--force-device-scale-factor=2', '--screenshot=' + png, 'file://' + tmp])
  if (!existsSync(png) || statSync(png).mtimeMs === before) throw new Error('截圖失敗：' + png)
  return h
}

// ---- 文案檢查（跟 worker 的寄前檢查同一套規則，這裡先擋一次）
const BAD = [/[—–―]/, /\{\{|\}\}|\bundefined\b|\bnull\b|\bNaN\b|TODO|TBD|待補|XXX|lorem/i]
const problems = []
const eps = []
const pending = []
for (const e of EPISODES.filter((x) => x.published)) {
  const nl = NL_ISSUES[e.slug], st = EP_STORY[e.slug]
  if (!nl || !st) { pending.push(e.slug); continue }
  const out = { slug: e.slug, n: e.n, url: `${SITE}/insight/${e.slug}` }
  for (const lang of ['zh', 'en']) {
    const c = nl[lang], s = st[lang], ep = e[lang]
    const png = join(OUT, `${e.slug}-${lang}.png`)
    let h = 0
    if (force || !existsSync(png)) h = shoot(chartHtml(s.chart, lang), png)
    else h = Number((JSON.parse(existsSync(join(OUT, 'feed.json')) ? readFileSync(join(OUT, 'feed.json'), 'utf8') : '{"eps":[]}').eps.find((x) => x.slug === e.slug)?.[lang]?.imgH) || 0)
    if (!h) h = shoot(chartHtml(s.chart, lang), png)
    out[lang] = {
      title: ep.title, subject: c.subject, opener: c.opener, points: c.points,
      img: `${SITE}/nl/${e.slug}-${lang}.png`, imgH: h, imgAlt: strip(s.chart.h), chartNote: c.chartNote,
      poll: { id: s.poll.id, q: s.poll.q, opts: s.poll.opts },
    }
    for (const [k, v] of Object.entries({ subject: c.subject, opener: c.opener, p1: c.points[0], p2: c.points[1], p3: c.points[2], chartNote: c.chartNote })) {
      if (!v || !String(v).trim()) problems.push(`${e.slug} ${lang} ${k} 是空的`)
      for (const re of BAD) if (re.test(v)) problems.push(`${e.slug} ${lang} ${k} 命中 ${re}`)
      if (lang === 'zh' && /[一-鿿][,;:?!][一-鿿]/.test(v)) problems.push(`${e.slug} zh ${k} 中文之間有半形標點`)
    }
  }
  eps.push(out)
}

// check_voice.py：把全部文案寫成一份 HTML 丟進去
const voiceFile = join(tmpdir(), 'nl2_voice_' + process.pid + '.html')
writeFileSync(voiceFile, '<html><body>' + eps.map((x) => ['zh', 'en'].map((l) => `<p>${esc(x[l].subject)}</p><p>${esc(x[l].opener)}</p>${x[l].points.map((p) => `<p>${esc(p)}</p>`).join('')}<p>${esc(x[l].chartNote)}</p>`).join('')).join('') + '</body></html>')
try { execFileSync('python3', [join(homedir(), '.claude/skills/_shared/check_voice.py'), voiceFile], { stdio: 'inherit' }) }
catch { problems.push('check_voice.py 沒過（見上方）') }

if (problems.length) { console.error('不寫 feed，先修：\n  ' + problems.join('\n  ')); process.exit(1) }
const feed = { v: 1, generated: new Date().toISOString(), eps, pending, next: NL_NEXT }
writeFileSync(join(OUT, 'feed.json'), JSON.stringify(feed, null, 1))
console.log(`feed.json：${eps.length} 集可寄（${eps.map((x) => x.slug).join(', ')}）${pending.length ? `；已發布但沒寫週信文案：${pending.join(', ')}` : ''}`)
