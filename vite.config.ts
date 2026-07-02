import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Production-only CSP: GitHub Pages cannot set response headers, so the policy
 * ships as a meta tag. Injected only at build time — the Vite dev server needs
 * inline/eval for HMR and would break under this policy.
 * Note meta CSP cannot express frame-ancestors; clickjacking protection needs
 * real headers once the site moves to a host that supports them (docs/security.md). */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self' https://formsubmit.co https://trinity-counter.comicbnb.workers.dev",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formsubmit.co",
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
})
