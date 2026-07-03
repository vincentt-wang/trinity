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

/* Continuous camera keyframes along the section's overall scroll progress
 * (0..1). The camera center + zoom are interpolated smoothly BETWEEN these,
 * so every scrolled pixel maps to one uninterrupted push-in — no per-step
 * reset, no zoom snap at boundaries. Each key names a live body whose real
 * orbital position is resolved each frame. */
type CamKey = { at: number; b: CelFocus; z: number }
const CAM_KF: CamKey[] = [
  { at: 0.00, b: 'earth', z: 2.15 },
  { at: 0.17, b: 'earth', z: 3.05 },
  { at: 0.36, b: 'moon', z: 3.35 },
  { at: 0.58, b: 'sun', z: 1.95 },
  { at: 0.82, b: 'all', z: 1.02 },
  { at: 1.00, b: 'all', z: 0.92 },
]
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

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

/** Full-bleed galaxy backdrop: a soft milky-way haze (CSS, behind) plus a
 * dense star field weighted toward a diagonal band, so the scene reads as a
 * corner of a galaxy rather than empty white. Tinted stars pick up the three
 * lens colours. Fills its positioned parent edge to edge (no frame). */
export function CelStars() {
  const stars = useMemo(() => {
    let s = 42
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    return Array.from({ length: 168 }, (_, i) => {
      // ~58% of stars cluster along a diagonal milky-way band (top-right to
      // bottom-left); the rest scatter across the whole field.
      let x = rnd() * 1600
      let y = rnd() * 900
      const inBand = rnd() < 0.58
      if (inBand) {
        x = rnd() * 1600
        y = 760 - x * 0.46 + (rnd() - 0.5) * 250
      }
      const tv = rnd()
      const tint = tv < 0.12 ? 'e' : tv > 0.9 ? 's' : tv > 0.82 ? 'm' : ''
      return {
        id: i,
        x: Math.round(x),
        y: Math.round(Math.max(-20, Math.min(920, y))),
        r: +((inBand ? 0.5 : 0.7) + rnd() * (inBand ? 1.1 : 1.6)).toFixed(2),
        d: +(rnd() * 6).toFixed(2),
        big: !inBand && rnd() > 0.86,
        tint,
      }
    })
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
          <circle
            key={st.id}
            className={`cel-star${st.tint ? ' ' + st.tint : ''}${st.big ? ' big' : ''}`}
            cx={st.x}
            cy={st.y}
            r={st.r}
            style={{ animationDelay: `${st.d}s` }}
          />
        ))}
      </g>
    </svg>
  )
}

export function Celestial({ focus, cam: camMv }: { focus: CelFocus; cam?: MotionValue<number> }) {
  const earthG = useRef<SVGGElement>(null)
  const moonG = useRef<SVGGElement>(null)
  const camG = useRef<SVGGElement>(null)
  const focusRef = useRef(focus)
  focusRef.current = focus
  const camMvRef = useRef(camMv)
  camMvRef.current = camMv

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
    const cam = { x: VC, y: VC, s: 2.15 }
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

      // live world position of each possible camera target
      const posOf = (b: CelFocus) =>
        b === 'earth' ? e : b === 'moon' ? { x: e.x + mx, y: e.y + my } : b === 'sun' ? SUN : { x: VC, y: VC }

      // continuous camera target: interpolate between the two keyframes that
      // straddle the current scroll progress — no discrete focus, no reset.
      const p = Math.max(0, Math.min(1, camMvRef.current?.get() ?? 0))
      let i = 0
      while (i < CAM_KF.length - 2 && p > CAM_KF[i + 1].at) i++
      const a = CAM_KF[i], b2 = CAM_KF[i + 1]
      const tt = smoothstep(Math.max(0, Math.min(1, (p - a.at) / (b2.at - a.at))))
      const pa = posOf(a.b), pb = posOf(b2.b)
      const tgt = { x: lerp(pa.x, pb.x, tt), y: lerp(pa.y, pb.y, tt) }
      const zoomTgt = lerp(a.z, b2.z, tt)

      // light critically-damped follow smooths orbital micro-motion while the
      // scroll-tied target keeps the push-in locked to the wheel.
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      const k = 1 - Math.exp(-14 * dt)
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
