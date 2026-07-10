# Trinity Check — Analyze backend (approach A)

The `/analyze` front-end is part of the Trinity SPA (Cloudflare Pages). This Worker
is the only piece that needs your Cloudflare account: it stores each submission and
emails you, so you run the Deal-Lens engine by hand and send the A4 back.

**Approach A now, B reserved.** Nothing here calls an LLM. When you later want
auto-analysis, set `ANTHROPIC_API_KEY` and un-comment the one line marked
"Approach B seam" in `index.js` — no other change.

## What you must set (once)
1. **R2 bucket** for stored submissions:
   ```
   cd worker
   npx wrangler r2 bucket create trinity-submissions
   ```
2. **Account ID** → put it in `wrangler.toml` `R2_ACCOUNT_ID` (`npx wrangler whoami`).
3. **Resend key** (the notification email; skip and it just won't email):
   - Verify `easeai.com.tw` (or a subdomain) as a Resend sending domain, then:
   ```
   npx wrangler secret put RESEND_API_KEY
   ```
   - `from` is `analyze@easeai.com.tw`, `to` is `NOTIFY_TO` (vincent@easeai.com.tw).
4. **(Optional) deck FILE upload** — only if you want applicants to upload a deck
   file rather than paste a link. Create an R2 S3 API token (Object Read & Write,
   scoped to the bucket), add the bucket CORS below, then:
   ```
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   ```
   R2 → `trinity-submissions` → Settings → CORS:
   ```json
   [{ "AllowedOrigins": ["https://trinity.easeai.com.tw"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
   ```

## Deploy
```
cd worker
npx wrangler deploy
```
The route `trinity.easeai.com.tw/api/analyze/*` binds automatically if `easeai.com.tw`
is a zone on this account. (If Trinity lives on a different subdomain, edit the route
+ `ALLOW_ORIGINS` in `index.js`.)

## Wire the front-end (one change, after the Worker is live)
In `src/Analyze.tsx` the submit currently fires to `formsubmit.co`. Swap that for a
same-origin call to this Worker:
```
POST /api/analyze/init      -> { token }
(optional) POST /api/analyze/presign + PUT the deck file to the returned R2 url
POST /api/analyze/complete  -> { token, lang, answers: {…form fields…}, files: [...] }
```
Keep the formsubmit call as a fallback until the Worker is confirmed live, then remove it.
The done-screen stays honest: sample verdict + "your real one-page read arrives by email".

## Endpoints
- `POST /api/analyze/init` → `{ token }`
- `POST /api/analyze/presign` → `{ url, key }` (needs R2 S3 secrets; else 501)
- `POST /api/analyze/complete` → `{ ok, token, status: "awaiting-human" }`
