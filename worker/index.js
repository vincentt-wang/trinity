/**
 * Trinity Check — Analyze intake Worker
 *
 * Approach A (LIVE now): the /analyze form posts here; the Worker stores the
 * submission (answers.json + any deck file in R2) and emails Vincent, who runs
 * the Deal-Lens D/F/V engine by hand and sends the one-page A4 back. Front-end
 * feels automated; a human signs the verdict.
 *
 * Approach B (RESERVED, not active): the pipeline below already isolates the
 * one step that changes — `analyzeAuto()`. When it's time to auto-run, set the
 * ANTHROPIC_API_KEY secret and un-comment the one line in handleComplete; every
 * other part (tokens, R2, storage, notify) stays identical.
 *
 * Routes (same-origin via trinity.easeai.com.tw/api/*):
 *   POST /api/analyze/init      -> { token }                 create an isolated submission folder
 *   POST /api/analyze/presign   -> { url, key }              presigned R2 PUT for a deck file (optional)
 *   POST /api/analyze/complete  -> { ok, token, status }     store answers.json + notify (+ B seam)
 *
 * Bindings / config (see wrangler.toml + DEPLOY.md):
 *   BUCKET                R2 bucket binding (server-side writes)
 *   R2_ACCOUNT_ID         var
 *   R2_BUCKET             var (bucket name, for the S3 endpoint)
 *   NOTIFY_TO             var (comma-separated emails; e.g. vincent@easeai.com.tw)
 *   R2_ACCESS_KEY_ID      secret (R2 S3 API token) — only needed if you enable deck file upload
 *   R2_SECRET_ACCESS_KEY  secret
 *   RESEND_API_KEY        secret (optional — skips email if absent)
 *   ANTHROPIC_API_KEY     secret (RESERVED for approach B — leave unset for now)
 */
import { AwsClient } from 'aws4fetch';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// The front-end is served from the live domain in prod and Vite in dev.
const ALLOW_ORIGINS = new Set([
  'https://trinity.easeai.com.tw',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), origin);

    try {
      if (request.method === 'POST' && path === '/api/analyze/init')     return cors(await handleInit(), origin);
      if (request.method === 'POST' && path === '/api/analyze/presign')  return cors(await handlePresign(request, env), origin);
      if (request.method === 'POST' && path === '/api/analyze/complete') return cors(await handleComplete(request, env, ctx), origin);
    } catch (err) {
      return cors(json({ error: 'server_error', detail: String((err && err.message) || err) }, 500), origin);
    }
    return cors(json({ error: 'not_found' }, 404), origin);
  },
};

/* ---------- handlers ---------- */

async function handleInit() {
  return json({ token: crypto.randomUUID() });
}

// Optional: only used if the form uploads a deck FILE (vs a deck link).
async function handlePresign(request, env) {
  const { token, filename, contentType } = await request.json();
  if (!UUID_RE.test(token || '')) return json({ error: 'bad_token' }, 400);
  if (!env.R2_ACCESS_KEY_ID) return json({ error: 'file_upload_disabled' }, 501);

  const safe = sanitize(filename || 'deck');
  const key = `analyze/${token}/deck/${safe}`;
  const aws = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });
  const endpoint = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`);
  endpoint.searchParams.set('X-Amz-Expires', '900');
  const signed = await aws.sign(endpoint.toString(), { method: 'PUT', aws: { signQuery: true } });
  return json({ url: signed.url, key });
}

async function handleComplete(request, env, ctx) {
  const body = await request.json();
  const { token, answers, files, lang } = body;
  if (!UUID_RE.test(token || '')) return json({ error: 'bad_token' }, 400);

  const record = {
    token,
    submittedAt: new Date().toISOString(),
    lang: lang || 'zh',
    answers: answers || {},
    files: Array.isArray(files) ? files : [],
    // A: queued for a human read. B will set this to 'auto-analyzed'.
    status: 'awaiting-human',
  };

  // Store the submission (audit trail + what the human/engine reads).
  if (env.BUCKET) {
    await env.BUCKET.put(`analyze/${token}/answers.json`, JSON.stringify(record, null, 2), {
      httpMetadata: { contentType: 'application/json' },
    });
  }

  // ── Approach B seam (RESERVED — do not enable until the engine is validated) ──
  // When ready to auto-run: set ANTHROPIC_API_KEY and un-comment the next line.
  // The Worker still stores + notifies exactly as below; analyzeAuto() only ADDS
  // an auto-generated result.json and (optionally) an auto-email. Nothing else changes.
  // if (env.ANTHROPIC_API_KEY) ctx.waitUntil(analyzeAuto(env, record).catch(() => {}));

  // A: notify Vincent so a real hand-made read can be sent back.
  if (env.RESEND_API_KEY && env.NOTIFY_TO) {
    ctx.waitUntil(notify(env, record).catch(() => {}));
  }
  return json({ ok: true, token, status: record.status });
}

/* ---------- Approach B (RESERVED, not wired) ----------
 * Auto-run the Deal-Lens engine. Kept as a stub so the seam is explicit:
 * the day this goes live, only this function and one commented line above change.
 *
 * async function analyzeAuto(env, rec) {
 *   const prompt = buildDealLensPrompt(rec.answers)   // port from ~/.claude/skills/deal-lens
 *   const res = await fetch('https://api.anthropic.com/v1/messages', {
 *     method: 'POST',
 *     headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
 *     body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
 *   })
 *   const out = await res.json()
 *   await env.BUCKET.put(`analyze/${rec.token}/result.json`, JSON.stringify(out), { httpMetadata: { contentType: 'application/json' } })
 *   // optional: auto-email the applicant a provisional read, flagged "AI draft, human review to follow"
 * }
 */

/* ---------- email notification (Resend) ---------- */

async function notify(env, rec) {
  const a = rec.answers || {};
  const row = (k, v) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#52607a;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;color:#0d1526">${esc(v)}</td></tr>` : '');
  const fileLines = (rec.files || []).map(f => `${esc(f.filename)} (${Math.round((f.size || 0) / 1024)} KB)`).join('<br>') || '—';

  const html = `<div style="font-family:Arial,'Noto Sans TC',sans-serif;max-width:640px">
    <h2 style="color:#0284c7;margin:0 0 4px">Trinity Check — new idea to analyze</h2>
    <p style="color:#52607a;margin:0 0 16px">Token <code>${esc(rec.token)}</code> · ${esc(rec.submittedAt)} · lang ${esc(rec.lang)}</p>
    <table style="border-collapse:collapse;font-size:14px">
      ${row('Company', a.company)}${row('Name', a.name)}
      ${row('Email', a.email)}${row('Website / deck', a.website || a.deck)}
      ${row('One-liner', a.oneLine)}
      ${row('Pain', a.pain)}${row('Solution', a.solution)}${row('Target customer', a.customer)}
      ${row('Proof of demand', a.evidence)}${row('Why this team', a.team)}${row('Demo', a.demo)}
      ${row('Revenue model', a.money)}${row('Why now', a.whyNow)}
      ${row('Key numbers', a.metrics)}
      ${row('Business model', a.model)}${row('Product stage', a.stage)}${row('Target markets', a.markets)}${row('Funding round', a.funding)}
      ${row('Consent track', a.consentTrack)}
      ${row('Deck file', fileLines !== '—' ? fileLines : '')}
    </table>
    <p style="color:#98a1b6;font-size:12px;margin-top:16px">R2: analyze/${esc(rec.token)}/ · next: run deal-lens skill, email the one-page A4 back.</p>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Trinity Check <analyze@easeai.com.tw>',
      to: env.NOTIFY_TO.split(',').map(s => s.trim()).filter(Boolean),
      subject: `Trinity Check — ${a.company || a.name || 'new submission'}`,
      html,
    }),
  });
  if (!res.ok) throw new Error('resend ' + res.status);
}

/* ---------- helpers ---------- */

function sanitize(name) {
  const base = String(name).split(/[\\/]/).pop().slice(0, 120);
  return base.replace(/[^A-Za-z0-9._一-鿿-]/g, '_').replace(/^\.+/, '') || 'deck';
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
function cors(res, origin) {
  const allow = ALLOW_ORIGINS.has(origin) ? origin : 'https://trinity.easeai.com.tw';
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', allow);
  h.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  h.set('Access-Control-Max-Age', '86400');
  return new Response(res.body, { status: res.status, headers: h });
}
