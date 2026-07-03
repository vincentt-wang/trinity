/**
 * Trinity analyzed-counter — tiny KV counter for the "startups analyzed" stat.
 * GET  /   -> {"n": <count>}
 * POST /   -> increments by 1, returns {"n": <new count>}
 * Canonical seed lives in KV key "analyzed" (initialised to match src/stats.ts).
 *
 * Abuse controls (the public number must track real submissions):
 *  - POST only from allow-listed Origins (403 otherwise)
 *  - one increment per IP per hour
 *  - global cap of 25 increments per UTC day; over the cap the count freezes
 */
const ORIGINS = ['https://trinity.easeai.com.tw', 'https://trinity-7x1.pages.dev', 'https://vincentt-wang.github.io', 'http://localhost:5173']
const DAILY_CAP = 25
const cors = (o) => ({
  'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
})
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || ''
    const h = cors(origin)
    if (req.method === 'OPTIONS') return new Response(null, { headers: h })
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
