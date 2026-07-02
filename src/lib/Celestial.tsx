import { useEffect, useMemo, useRef } from 'react'
import type { MotionValue } from 'framer-motion'

export type CelFocus = 'earth' | 'moon' | 'sun' | 'all'

/**
 * The Trinity brand story as a living orrery with a scroll-driven camera.
 * The Sun (Viability, amber) breathes at the center, Earth (Desirability,
 * blue) orbits it in 64s and the Moon (Feasibility, slate) orbits Earth in
 * 8.5s, over faint orbit paths and a sparse star field.
 *
 * `focus` flies the camera: each rAF frame reads the focused body's live
 * orbital position and eases an exponential (critically damped) lerp of the
 * camera center + zoom toward it, applied as a single <g transform>
 * (translate to viewport center, scale, translate world point back). So the
 * camera keeps tracking the body while it orbits: zoom ~2.6x Earth, ~3x
 * Moon, ~1.8x Sun, 1x for the whole system. The focused body gets its
 * halo/pulse; the others dim. Orbits never stop during flight.
 * All motion is rAF attribute updates + CSS transform/opacity only; with
 * prefers-reduced-motion the scene is static and the camera cuts instantly.
 */

const VC = 280 // viewBox center (0 0 560 560)
const SUN = { x: 280, y: 300 }
const ZOOM: Record<CelFocus, number> = { earth: 2.6, moon: 3, sun: 1.8, all: 1 }
// static resting angles (match the initial transforms below) for reduced motion
const EA0 = -0.9
const MA0 = 0.6
const earthAt = (a: number) => ({ x: SUN.x + 174 * Math.cos(a), y: SUN.y + 174 * Math.sin(a) })

/* ---------- Body renderers ----------
 * Shared between the orrery and the section's body-progress indicator.
 * Each draws a clean radial-gradient disc at local (0,0) with radius r;
 * `idp` keeps gradient ids unique per instance (SVG url(#id) refs resolve
 * document-wide). */

export function EarthBody({ r, idp }: { r: number; idp: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${idp}g`} cx="36%" cy="30%"><stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#2563eb" /></radialGradient>
      </defs>
      <circle cx="0" cy="0" r={r} fill={`url(#${idp}g)`} />
    </g>
  )
}

export function MoonBody({ r, idp }: { r: number; idp: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${idp}g`} cx="36%" cy="30%"><stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#64748b" /></radialGradient>
      </defs>
      <circle cx="0" cy="0" r={r} fill={`url(#${idp}g)`} />
    </g>
  )
}

export function SunBody({ r, idp }: { r: number; idp: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${idp}g`} cx="42%" cy="36%"><stop offset="0" stopColor="#fde68a" /><stop offset=".55" stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" /></radialGradient>
      </defs>
      <circle cx="0" cy="0" r={r} fill={`url(#${idp}g)`} />
    </g>
  )
}

/** Fourth progress mark: the whole system as three tiny overlapping circles. */
export function MiniSystem({ r }: { r: number }) {
  return (
    <g>
      <circle cx={-r * 0.4} cy={r * 0.28} r={r * 0.52} fill="#2563eb" opacity=".92" />
      <circle cx={r * 0.44} cy={r * 0.24} r={r * 0.44} fill="#d97706" opacity=".92" />
      <circle cx="0" cy={-r * 0.4} r={r * 0.36} fill="#64748b" opacity=".95" />
    </g>
  )
}

/** Full-bleed star backdrop: fills its positioned parent edge to edge (no frame). */
export function CelStars() {
  const stars = useMemo(() => {
    let s = 42
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    return Array.from({ length: 84 }, (_, i) => ({
      id: i,
      x: Math.round(rnd() * 1600),
      y: Math.round(rnd() * 900),
      r: +(0.7 + rnd() * 1.3).toFixed(2),
      d: +(rnd() * 6).toFixed(2),
    }))
  }, [])
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g className="cel-stars">
        {stars.map((st) => (
          <circle key={st.id} className="cel-star" cx={st.x} cy={st.y} r={st.r} style={{ animationDelay: `${st.d}s` }} />
        ))}
      </g>
    </svg>
  )
}

export function Celestial({ focus, drive }: { focus: CelFocus; drive?: MotionValue<number> }) {
  const earthG = useRef<SVGGElement>(null)
  const moonG = useRef<SVGGElement>(null)
  const camG = useRef<SVGGElement>(null)
  const focusRef = useRef(focus)
  focusRef.current = focus
  const driveRef = useRef(drive)
  driveRef.current = drive

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // reduced motion: no orbits, camera cuts instantly to the focused body
  useEffect(() => {
    if (!reduced) return
    const e = earthAt(EA0)
    const m = { x: e.x + 46 * Math.cos(MA0), y: e.y + 46 * Math.sin(MA0) }
    const t = focus === 'earth' ? e : focus === 'moon' ? m : focus === 'sun' ? SUN : { x: VC, y: VC }
    const s = ZOOM[focus]
    camG.current?.setAttribute('transform', `translate(${VC} ${VC}) scale(${s}) translate(${-t.x} ${-t.y})`)
  }, [focus, reduced])

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const t0 = performance.now()
    let last = t0
    const cam = { x: VC, y: VC, s: 1 }
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const s = (t - t0) / 1000
      const ea = EA0 + s * (Math.PI * 2 / 64) // Earth: one lap around the Sun in 64s
      const ma = MA0 + s * (Math.PI * 2 / 8.5) // Moon: one lap around Earth in 8.5s
      const e = earthAt(ea)
      const mx = 46 * Math.cos(ma)
      const my = 46 * Math.sin(ma)
      earthG.current?.setAttribute('transform', `translate(${e.x.toFixed(2)} ${e.y.toFixed(2)})`)
      moonG.current?.setAttribute('transform', `translate(${mx.toFixed(2)} ${my.toFixed(2)})`)

      // camera: chase the focused body's live position with a damped lerp
      const f = focusRef.current
      const tgt = f === 'earth' ? e : f === 'moon' ? { x: e.x + mx, y: e.y + my } : f === 'sun' ? SUN : { x: VC, y: VC }
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      const k = 1 - Math.exp(-3.4 * dt)
      // scroll drive: keep pushing in through a body's step (pull back on 'all'),
      // so the planet visibly grows/shrinks with every scrolled pixel
      const lv = driveRef.current?.get() ?? 0.5
      const zoomTgt = ZOOM[f] * (f === 'all' ? 1.18 - 0.28 * lv : 0.76 + 0.52 * lv)
      cam.x += (tgt.x - cam.x) * k
      cam.y += (tgt.y - cam.y) * k
      cam.s += (zoomTgt - cam.s) * k
      camG.current?.setAttribute('transform', `translate(${VC} ${VC}) scale(${cam.s.toFixed(4)}) translate(${(-cam.x).toFixed(2)} ${(-cam.y).toFixed(2)})`)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const cls = (body: CelFocus, base: string) =>
    `cel-body ${base}${focus === body || focus === 'all' ? ' lit' : ''}${focus !== body && focus !== 'all' ? ' dim' : ''}`

  return (
    <svg className={`cel-scene${focus === 'all' ? ' all' : ''}`} viewBox="0 0 560 560" width="100%" height="100%" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="cel-corona" cx="50%" cy="50%"><stop offset="0" stopColor="rgba(245,158,11,.34)" /><stop offset=".7" stopColor="rgba(245,158,11,.08)" /><stop offset="1" stopColor="rgba(245,158,11,0)" /></radialGradient>
      </defs>

      {/* camera rig: everything inside flies with the zoom */}
      <g ref={camG}>
        {/* orbit paths */}
        <circle className="cel-orbitpath" cx={SUN.x} cy={SUN.y} r="174" />

        {/* Sun · Viability */}
        <g className={cls('sun', 's')}>
          <circle cx={SUN.x} cy={SUN.y} r="118" fill="url(#cel-corona)">
            <animate attributeName="r" values="112;126;112" dur="5.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".8;1;.8" dur="5.2s" repeatCount="indefinite" />
          </circle>
          <circle className="cel-pulse" cx={SUN.x} cy={SUN.y} r="62" stroke="#d97706" />
          <circle className="cel-halo" cx={SUN.x} cy={SUN.y} r="72" fill="#d97706" />
          <g transform={`translate(${SUN.x} ${SUN.y})`}><SunBody r={48} idp="celS" /></g>
          <circle cx={SUN.x} cy={SUN.y} r="54" fill="none" stroke="rgba(217,119,6,.35)" strokeWidth="1">
            <animate attributeName="r" values="54;60;54" dur="3.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".6;.15;.6" dur="3.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Earth system (rAF moves this group along the sun orbit) */}
        <g ref={earthG} transform="translate(388 168)">
          <circle className="cel-orbitpath moonpath" cx="0" cy="0" r="46" />
          <g className={cls('earth', 'e')}>
            <circle className="cel-pulse" cx="0" cy="0" r="26" stroke="#2563eb" />
            <circle className="cel-halo" cx="0" cy="0" r="32" fill="#2563eb" />
            <EarthBody r={17} idp="celE" />
          </g>
          {/* Moon (rAF moves this group around Earth, faster) */}
          <g ref={moonG} transform="translate(38 26)">
            <g className={cls('moon', 'm')}>
              <circle className="cel-pulse" cx="0" cy="0" r="14" stroke="#475569" />
              <circle className="cel-halo" cx="0" cy="0" r="19" fill="#475569" />
              <MoonBody r={8.5} idp="celM" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
