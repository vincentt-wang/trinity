import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Production-only CSP: GitHub Pages cannot set response headers, so the policy
 * ships as a meta tag. Injected only at build time — the Vite dev server needs
 * inline/eval for HMR and would break under this policy.
 * Note meta CSP cannot express frame-ancestors; clickjacking protection needs
 * real headers once the site moves to a host that supports them (docs/security.md). */
// 2026-11-15: formsubmit.co is gone (forms post same-origin to /api/intake, served by the
// trinity-check-intake Worker on a route). Cloudflare Web Analytics (beacon.min.js +
// its POST to cloudflareinsights.com) is allowed so Pages analytics stops being empty.
// Keep public/_headers in step with this list; that file is the real header on Pages.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com https://trinity-counter.comicbnb.workers.dev https://trinity-check-intake.comicbnb.workers.dev",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const cspPlugin: Plugin = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
    )
  },
}

// base: GitHub Pages serves under /trinity/; Cloudflare Pages (custom domain) serves at root.
// `npm run deploy` keeps GH Pages; `npm run deploy:cf` builds with DEPLOY_TARGET=cf.
export default defineConfig({
  base: process.env.DEPLOY_TARGET === 'cf' ? '/' : '/trinity/',
  plugins: [react(), tailwindcss(), cspPlugin],
  // local: `cd worker && npx wrangler dev --port 8787` serves /api/*; the dev server proxies to it
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false } } },
})
