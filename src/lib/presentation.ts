import { useEffect } from 'react'
import { scrollToY } from './useLenis'

/* Keyboard = presentation. Arrow / Page keys advance the page like slides:
 * each pinned section's internal animation states become their own "slide"
 * (celestial planets, engine steps, stack layers, fit stages), and the 60-
 * dimensions section steps through its three lenses before moving on. The
 * wheel/trackpad keeps free smooth scrolling — only the keys act like slides. */

/* DimsSection registers a lens stepper (D → F → V) so a keypress can trigger
 * the lens animation before the deck advances to the next section. */
export type DimsApi = { count: number; get: () => number; set: (i: number) => void }
let dimsApi: DimsApi | null = null
export function registerDims(api: DimsApi | null) { dimsApi = api }

const NAV = 70

/* pinned scroll-tied sections → internal progress breakpoints (0..1 of the track) */
const PINNED: Record<string, { track: string; steps: number[] }> = {
  '#celestial': { track: '.cel-track', steps: [0.16, 0.36, 0.58, 0.9] },
  '#engine': { track: '.scrolly-track', steps: [0.16, 0.5, 0.84] },
  '#stack': { track: '.stack-track', steps: [0.08, 0.25, 0.42, 0.58, 0.75, 0.93] },
  '#fit': { track: '.fit-track', steps: [0.12, 0.37, 0.62, 0.9] },
}
/* full slide order (top-level anchors, in DOM order) */
const ORDER = ['#top', '#celestial', '#dims', '#engine', '#stack', '#fit', '#why', '#ba', '#founder', '#orgs', '#services', '#cta']

type Step = { y: number; dims?: number }
const topOf = (el: Element) => (el as HTMLElement).getBoundingClientRect().top + window.scrollY

function buildSteps(): Step[] {
  const winH = window.innerHeight
  const out: Step[] = []
  for (const sel of ORDER) {
    const el = document.querySelector(sel)
    if (!el) continue
    if (sel === '#top') { out.push({ y: 0 }); continue }
    if (sel === '#dims') {
      const y = topOf(el) - NAV
      const n = dimsApi?.count ?? 3
      for (let i = 0; i < n; i++) out.push({ y, dims: i })
      continue
    }
    const pin = PINNED[sel]
    if (pin) {
      const track = el.querySelector(pin.track) as HTMLElement | null
      const range = track ? Math.max(0, track.offsetHeight - winH) : 0
      const top = topOf(el)
      for (const p of pin.steps) out.push({ y: top + p * range })
    } else {
      out.push({ y: topOf(el) - NAV })
    }
  }
  return out
}

let idx = 0
let manual = false

/* After a menu jump / any programmatic scroll, force the next keypress to
 * resync to the nearest slide instead of resuming from the stale old index. */
export function presentationResync() { manual = true }

function nearestIdx(steps: Step[]): number {
  const y = window.scrollY
  let best = 0, bd = Infinity
  steps.forEach((s, i) => { const d = Math.abs(s.y - y); if (d < bd) { bd = d; best = i } })
  // disambiguate the same-Y dims steps by the current lens
  if (steps[best]?.dims != null && dimsApi) {
    const li = dimsApi.get()
    const cand = steps.findIndex((s) => s.dims === li && Math.abs(s.y - steps[best].y) < 4)
    if (cand >= 0) best = cand
  }
  return best
}

function go(dir: 1 | -1) {
  const steps = buildSteps()
  if (!steps.length) return
  if (manual) { idx = nearestIdx(steps); manual = false }
  idx = Math.max(0, Math.min(steps.length - 1, idx + dir))
  const step = steps[idx]
  if (step.dims != null && dimsApi && dimsApi.get() !== step.dims) dimsApi.set(step.dims)
  // ~1s eased glide between slides (0.5s felt too snappy for a presentation)
  scrollToY(step.y, 1.1)
}

export function usePresentation() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault(); go(1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        e.preventDefault(); go(-1)
      }
    }
    const onManual = () => { manual = true }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onManual, { passive: true })
    window.addEventListener('touchmove', onManual, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onManual)
      window.removeEventListener('touchmove', onManual)
    }
  }, [])
}
