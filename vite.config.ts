import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { EPISODES } from './src/episodeData.ts'
import { EP_LONG, EP_SEC } from './src/epArticles.ts'
import { EP_STORY } from './src/epStories.ts'

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
  "connect-src 'self' https://cloudflareinsights.com https://trinity-counter.comicbnb.workers.dev https://trinity-check-intake.comicbnb.workers.dev https://vincent.easeai.com.tw",
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

/* Episode pages (261117). Crawlers (Threads, LinkedIn, Google) do not run JS, so each
 * /insight/epNN gets its own static HTML with the right title, description and og tags.
 * Cloudflare Pages serves dist/insight/ep01.html at /insight/ep01 before the SPA fallback.
 * Unpublished episodes (published: false in src/episodeData.ts) get a noindex page,
 * an X-Robots-Tag header (also on their video and thumbnail, kept for ?preview=vs) and no sitemap entry. */
const SITE = 'https://trinity.easeai.com.tw'
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function setMeta(html: string, attr: 'name' | 'property', key: string, val: string) {
  const re = new RegExp(`<meta ${attr}="${key.replace(/[:.]/g, '\\$&')}" content="[^"]*" />`)
  const tag = `<meta ${attr}="${key}" content="${esc(val)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n  </head>`)
}
function episodePagesPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'episode-pages',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir) },
    closeBundle() {
      const base = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      fs.mkdirSync(path.join(outDir, 'insight'), { recursive: true })
      const headers: string[] = []
      const urls: string[] = []
      for (const e of EPISODES) {
        let h = base
        const url = `${SITE}/insight/${e.slug}`
        if (e.published) {
          const title = `${e.en.title} · Trinity Check`
          const desc = EP_STORY[e.slug]?.ogDesc || EP_LONG[e.slug]?.ogDesc || EP_SEC[e.slug]?.ogDesc || e.en.desc
          const img = fs.existsSync(path.join(outDir, 'ep', `${e.slug}-og.jpg`)) ? `${SITE}/ep/${e.slug}-og.jpg` : `${SITE}/ep/${e.slug}.jpg`
          h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
          h = setMeta(h, 'name', 'description', desc)
          h = setMeta(h, 'property', 'og:type', 'article')
          h = setMeta(h, 'property', 'og:title', e.en.title)
          h = setMeta(h, 'property', 'og:description', desc)
          h = setMeta(h, 'property', 'og:url', url)
          h = setMeta(h, 'property', 'og:image', img)
          h = setMeta(h, 'property', 'og:image:alt', e.en.title)
          h = setMeta(h, 'name', 'twitter:title', e.en.title)
          h = setMeta(h, 'name', 'twitter:description', desc)
          h = setMeta(h, 'name', 'twitter:image', img)
          h = h.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><h1>${esc(e.en.title)}</h1><p>${esc(desc)}</p></noscript>`)
          urls.push(url)
        } else {
          h = h.replace(/<title>[^<]*<\/title>/, '<title>Not published yet · Trinity Check</title>')
          h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE}/insight" />`)
          h = setMeta(h, 'name', 'robots', 'noindex,nofollow')
          h = setMeta(h, 'name', 'description', 'This piece is not published yet.')
          h = setMeta(h, 'property', 'og:title', 'Not published yet')
          h = setMeta(h, 'property', 'og:description', 'This piece is not published yet.')
          h = setMeta(h, 'property', 'og:url', `${SITE}/insight`)
          h = setMeta(h, 'name', 'twitter:title', 'Not published yet')
          h = setMeta(h, 'name', 'twitter:description', 'This piece is not published yet.')
          h = h.replace(/<noscript>[\s\S]*?<\/noscript>/, '<noscript><h1>Not published yet</h1></noscript>')
          headers.push(`/insight/${e.slug}\n  X-Robots-Tag: noindex, nofollow`, `/insight/${e.slug}.html\n  X-Robots-Tag: noindex, nofollow`)
          // 261118: keep the video and thumbnail so /insight/epNN?preview=vs can play it; they stay unlisted and noindex.
          headers.push(`/ep/${e.slug}.mp4\n  X-Robots-Tag: noindex, nofollow`, `/ep/${e.slug}.jpg\n  X-Robots-Tag: noindex, nofollow`)
        }
        fs.writeFileSync(path.join(outDir, 'insight', `${e.slug}.html`), h)
      }
      if (headers.length) fs.appendFileSync(path.join(outDir, '_headers'), '\n# unpublished episodes (generated by vite.config.ts)\n' + headers.join('\n') + '\n')
      const sm = path.join(outDir, 'sitemap.xml')
      if (fs.existsSync(sm) && urls.length) {
        const add = urls.map((u) => `  <url><loc>${u}</loc><lastmod>2026-11-17</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')
        fs.writeFileSync(sm, fs.readFileSync(sm, 'utf8').replace('</urlset>', add + '\n</urlset>'))
      }
    },
  }
}

// base: GitHub Pages serves under /trinity/; Cloudflare Pages (custom domain) serves at root.
// `npm run deploy` keeps GH Pages; `npm run deploy:cf` builds with DEPLOY_TARGET=cf.
export default defineConfig({
  base: process.env.DEPLOY_TARGET === 'cf' ? '/' : '/trinity/',
  plugins: [react(), tailwindcss(), cspPlugin, episodePagesPlugin()],
  // local: `cd worker && npx wrangler dev --port 8787` serves /api/*; the dev server proxies to it
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false } } },
})
