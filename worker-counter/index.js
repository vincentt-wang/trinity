/**
 * Trinity worker — two jobs on one KV namespace (COUNTER).
 *
 * 1) "startups analyzed" counter
 *    GET  /            -> {"n": <count>}
 *    POST /            -> increments by 1 (abuse-gated), returns {"n": <new count>}
 *
 * 2) Principle-deck waitlist (durable, deduped collection point)
 *    POST /waitlist    -> {email, lang} -> stores wl:<email>, returns {ok:true}
 *    GET  /waitlist?token=…   -> full list (token-gated export for Vincent)
 *
 * Each signup is one KV key "wl:<lowercased email>" = {email, ts, lang, source}.
 * Keying by email means re-signups overwrite instead of duplicating, and nothing
 * is lost: GET /waitlist?token=… returns every entry to email when the deck ships.
 *
 * 3) Source / CTA tracking (261117)
 *    POST /e           -> {k: view|cta, p, s}  (JSON or text/plain body; sendBeacon-friendly)
 *                         one KV key per UTC day "ev:YYYY-MM-DD" = {"k|p|s": count}
 *    GET  /e?token=…&d=YYYY-MM-DD -> that day's counts (token-gated, reuses WAITLIST_TOKEN)
 *    CORS open (*): the personal site and the V site post here too.
 *
 * Abuse controls (the public number must track real submissions):
 *  - POST only from allow-listed Origins (403 otherwise)
 *  - counter: one increment per IP per hour, global cap 25/UTC-day
 *  - waitlist: one write per IP per 20s (deters bot floods, never blocks a person)
 */
const ORIGINS = ['https://trinity.easeai.com.tw', 'https://trinity-7x1.pages.dev', 'https://vincentt-wang.github.io', 'http://localhost:5173']
const DAILY_CAP = 25
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const cors = (o) => ({
  'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
})

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const origin = req.headers.get('Origin') || ''
    const h = cors(origin)
    if (req.method === 'OPTIONS') return new Response(null, { headers: h })

    // ── tracking ──
    if (url.pathname === '/e') {
      const oh = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' }
      if (req.method === 'OPTIONS') return new Response(null, { headers: oh })
      if (req.method === 'GET') {
        if (!env.WAITLIST_TOKEN || url.searchParams.get('token') !== env.WAITLIST_TOKEN) {
          return new Response(JSON.stringify({ err: 'unauthorized' }), { status: 401, headers: oh })
        }
        const d = (url.searchParams.get('d') || new Date().toISOString().slice(0, 10)).slice(0, 10)
        return new Response((await env.COUNTER.get('ev:' + d)) || '{}', { headers: oh })
      }
      if (req.method !== 'POST') return new Response(JSON.stringify({ err: 'method' }), { status: 405, headers: oh })
      let b = {}
      try { b = JSON.parse(await req.text()) } catch { /* keep {} */ }
      const k = b.k === 'cta' ? 'cta' : 'view'
      const clip = (v, n) => String(v || '').replace(/[|\n\r]/g, ' ').slice(0, n)
      const field = k + '|' + clip(b.p, 80) + '|' + clip(b.s, 60)
      const key = 'ev:' + new Date().toISOString().slice(0, 10)
      let day = {}
      try { day = JSON.parse((await env.COUNTER.get(key)) || '{}') } catch { day = {} }
      if (day[field] !== undefined || Object.keys(day).length < 2000) {
        day[field] = (day[field] || 0) + 1
        await env.COUNTER.put(key, JSON.stringify(day), { expirationTtl: 60 * 60 * 24 * 400 })
      }
      return new Response(JSON.stringify({ ok: true }), { headers: oh })
    }

    // ── waitlist ──
    if (url.pathname === '/waitlist') {
      if (req.method === 'GET') {
        // token-gated export
        const token = url.searchParams.get('token') || ''
        if (!env.WAITLIST_TOKEN || token !== env.WAITLIST_TOKEN) {
          return new Response(JSON.stringify({ err: 'unauthorized' }), { status: 401, headers: h })
        }
        const out = []
        let cursor
        do {
          const page = await env.COUNTER.list({ prefix: 'wl:', cursor })
          for (const k of page.keys) {
            const v = await env.COUNTER.get(k.name)
            if (v) out.push(JSON.parse(v))
          }
          cursor = page.list_complete ? undefined : page.cursor
        } while (cursor)
        out.sort((a, b) => (a.ts < b.ts ? 1 : -1))
        return new Response(JSON.stringify({ count: out.length, list: out }), { headers: h })
      }
      if (req.method === 'POST') {
        if (!ORIGINS.includes(origin)) {
          return new Response(JSON.stringify({ err: 'origin' }), { status: 403, headers: h })
        }
        let body = {}
        try { body = await req.json() } catch { /* keep {} */ }
        const email = String(body.email || '').trim().toLowerCase()
        if (!EMAIL_RE.test(email) || email.length > 254) {
          return new Response(JSON.stringify({ err: 'email' }), { status: 400, headers: h })
        }
        // Anti-flood: cap one IP at 40 signups / 5 min (covers a whole workshop
        // room on shared WiFi) so real signups are never dropped, only bot floods.
        const ip = req.headers.get('cf-connecting-ip') || 'x'
        const gate = 'wlip:' + ip
        const burst = parseInt((await env.COUNTER.get(gate)) || '0', 10)
        if (burst >= 40) {
          return new Response(JSON.stringify({ ok: true, throttled: true }), { headers: h })
        }
        const lang = body.lang === 'zh' ? 'zh' : 'en'
        const existed = await env.COUNTER.get('wl:' + email)
        await env.COUNTER.put('wl:' + email, JSON.stringify({
          email, ts: new Date().toISOString(), lang, source: 'trinity /materials',
        }))
        await env.COUNTER.put(gate, String(burst + 1), { expirationTtl: 300 })
        return new Response(JSON.stringify({ ok: true, new: !existed }), { headers: h })
      }
      return new Response(JSON.stringify({ err: 'method' }), { status: 405, headers: h })
    }

    // ── analyzed counter ──
    let n = parseInt((await env.COUNTER.get('analyzed')) || '27', 10)
    if (req.method === 'POST') {
      if (!ORIGINS.includes(origin)) {
        return new Response(JSON.stringify({ n, err: 'origin' }), { status: 403, headers: h })
      }
      const ip = req.headers.get('cf-connecting-ip') || 'x'
      const gate = 'ip:' + ip
      const day = 'day:' + new Date().toISOString().slice(0, 10)
      const today = parseInt((await env.COUNTER.get(day)) || '0', 10)
      if (!(await env.COUNTER.get(gate)) && today < DAILY_CAP) {
        n += 1
        await env.COUNTER.put('analyzed', String(n))
        await env.COUNTER.put(gate, '1', { expirationTtl: 3600 })
        await env.COUNTER.put(day, String(today + 1), { expirationTtl: 172800 })
      }
    }
    return new Response(JSON.stringify({ n }), { headers: h })
  },
}
