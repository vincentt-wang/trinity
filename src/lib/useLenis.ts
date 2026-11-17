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

/**
 * Scroll to a section by id selector (e.g. "#engine"), offset for the fixed nav.
 * immediate=true jumps straight there without scrolling through (and fast-
 * forwarding) every pinned section in between — used by the menu.
 */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** Glide time grows with distance so short hops feel quick and long ones never rush. */
const glide = (dist: number) => Math.min(1.8, Math.max(0.7, 0.55 + Math.abs(dist) / 4000))

export function scrollToId(sel: string, immediate = false) {
  const el = document.querySelector<HTMLElement>(sel)
  if (!el) return
  const dist = el.getBoundingClientRect().top - 64
  if (_lenis) _lenis.scrollTo(el, { offset: -64, immediate, duration: immediate ? 0 : glide(dist), easing: easeInOutCubic })
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

/** Jump to the very top (menu brand click when already home). */
export function scrollToTop(immediate = true) {
  if (_lenis) _lenis.scrollTo(0, { immediate, duration: immediate ? 0 : glide(window.scrollY), easing: easeInOutCubic })
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}

export function getLenis() {
  return _lenis
}

/** Smooth-scroll to an absolute Y (used by keyboard presentation nav). */
export function scrollToY(y: number, duration = 0.85) {
  if (_lenis) _lenis.scrollTo(Math.max(0, y), { duration })
  else window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}
