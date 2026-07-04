/**
 * Tiny path router so every view has a clean, shareable, indexable URL
 * (/, /analyze, /insight, /deck) instead of a #hash. Base-aware: the dev
 * server serves under /trinity/, Cloudflare Pages serves at /. Old #hash
 * links (#materials etc.) still resolve, so previously shared links keep working.
 */
export type View = 'home' | 'analyze' | 'insight' | 'materials'

const BASE = import.meta.env.BASE_URL || '/' // '/trinity/' in dev, '/' on the live domain
const PATH_OF: Record<View, string> = { home: '', analyze: 'analyze', insight: 'insight', materials: 'deck' }
const VIEW_OF: Record<string, View> = { analyze: 'analyze', insight: 'insight', deck: 'materials' }

const strip = (s: string) => s.replace(/^\/+|\/+$/g, '')

export function viewFromLocation(): View {
  let seg = location.pathname
  if (seg.startsWith(BASE)) seg = seg.slice(BASE.length)
  seg = strip(seg)
  if (VIEW_OF[seg]) return VIEW_OF[seg]
  // backward compatibility: legacy #hash links (#materials / #analyze / #insight)
  const h = strip(location.hash.replace(/^#\/?/, ''))
  if (h === 'materials' || h === 'analyze' || h === 'insight') return h as View
  return 'home'
}

/** Absolute URL for a view (used by the copy-link / share button). */
export function urlFor(view: View): string {
  return location.origin + BASE + PATH_OF[view]
}

/** Navigate to a view via History API (no reload); optional hash for a home-section anchor. */
export function routeTo(view: View, hash = ''): void {
  const url = BASE + PATH_OF[view] + hash
  if (location.pathname + location.hash !== url) history.pushState(null, '', url)
  window.dispatchEvent(new Event('trinity:route'))
}
