import { useEffect } from 'react'
import Lenis from 'lenis'

let _lenis: Lenis | null = null

/** Lusion-style buttery smooth scroll. */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    _lenis = lenis
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      _lenis = null
    }
  }, [])
}

/** Smoothly scroll to a section by id selector (e.g. "#engine"), offset for the fixed nav. */
export function scrollToId(sel: string) {
  const el = document.querySelector<HTMLElement>(sel)
  if (!el) return
  if (_lenis) _lenis.scrollTo(el, { offset: -72, duration: 1.3 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
