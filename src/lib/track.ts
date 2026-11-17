/**
 * Source tracking (261117). ?s=<tag> on any landing URL is kept in sessionStorage
 * for the visit; page views and CTA clicks go to the counter worker's POST /e
 * via sendBeacon (text/plain, no preflight). The form submit carries s too.
 */
const EVENT_URL = 'https://trinity-counter.comicbnb.workers.dev/e'
const KEY = 'trinity-src'

export function captureSource(): string {
  try {
    const q = new URLSearchParams(location.search).get('s')
    if (q) sessionStorage.setItem(KEY, q.slice(0, 60))
    return sessionStorage.getItem(KEY) || ''
  } catch { return '' }
}

export function setSource(s: string) {
  try { sessionStorage.setItem(KEY, s.slice(0, 60)) } catch { /* ignore */ }
}

export function source(): string {
  try { return sessionStorage.getItem(KEY) || '' } catch { return '' }
}

function send(k: 'view' | 'cta', p: string) {
  try {
    const body = JSON.stringify({ k, p: p.slice(0, 80), s: source() })
    if (navigator.sendBeacon) navigator.sendBeacon(EVENT_URL, body)
    else fetch(EVENT_URL, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch { /* ignore */ }
}

export const trackView = (p = location.pathname) => send('view', p)
export const trackCta = (name: string) => send('cta', name)

/** Global click listener: any element with data-cta="<name>" counts as a CTA click. */
export function installCtaTracking() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest?.('[data-cta]') as HTMLElement | null
    if (el) trackCta(el.dataset.cta || 'cta')
  }, { capture: true })
}
