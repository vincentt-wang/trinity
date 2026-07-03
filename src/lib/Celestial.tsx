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

// The Milky Way IS the 60 dimensions: 21 Desirability (blue) + 21 Feasibility
// (slate) + 18 Viability (amber), laid out as three colour arcs sweeping along
// a diagonal galactic band. Each is a glowing star; a haze of fainter dust
// fills between them. Together they read as a galaxy whose light is the engine's
// sixty scored dimensions.
const DIM_BAND: { g: 'e' | 'm' | 's'; n: number }[] = [
  { g: 'e', n: 21 }, { g: 'm', n: 21 }, { g: 's', n: 18 },
]

// one drifting, blinking firefly: its own slow float offset (dx/dy), period
// (tw), phase (delay) and faint→peak opacity swing (o0/o1). Style vars drive
// the shared `firefly` keyframe so every dot moves and pulses independently.
type Fly = { id: number; x: number; y: number; r: number; g?: string; style: Record<string, string> }

/** Full-bleed galaxy backdrop: dots of light — the 60 dimensions and finer
 * dust — drifting and blinking like fireflies. Fills its parent edge to edge. */
export function CelStars() {
  const { dims, dust } = useMemo(() => {
    let s = 42
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    // each dot's own slow float offset (dx/dy), period (tw), phase and
    // faint→peak opacity swing (o0/o1) — drives the shared `firefly` keyframe
    const flyStyle = (faint: boolean): Record<string, string> => ({
      '--dx': `${((rnd() - 0.5) * 26).toFixed(1)}px`,
      '--dy': `${((rnd() - 0.5) * 26).toFixed(1)}px`,
      '--tw': `${(4 + rnd() * 6).toFixed(1)}s`,
      '--o0': (faint ? 0.03 + rnd() * 0.06 : 0.1 + rnd() * 0.1).toFixed(3),
      '--o1': (faint ? 0.16 + rnd() * 0.12 : 0.42 + rnd() * 0.24).toFixed(3),
      animationDelay: `-${(rnd() * 10).toFixed(1)}s`,
    })
    // a gently curved band from lower-left to upper-right
    const bandY = (t: number) => 720 - t * 540 + Math.sin(t * Math.PI) * -70
    const total = DIM_BAND.reduce((a, b) => a + b.n, 0)
    const dims: Fly[] = []
    let k = 0
    for (const seg of DIM_BAND) {
      for (let j = 0; j < seg.n; j++) {
        const t = (k + 0.5) / total
        const x = 90 + t * 1440 + (rnd() - 0.5) * 108
        const y = bandY(t) + (rnd() - 0.5) * 190
        dims.push({ id: k, x: Math.round(x), y: Math.round(y), r: +(1.3 + rnd() * 1.3).toFixed(2), g: seg.g, style: flyStyle(false) })
        k++
      }
    }
    const dust: Fly[] = Array.from({ length: 120 }, (_, i) => {
      let x = rnd() * 1600
      let y = rnd() * 900
      if (rnd() < 0.6) { const t = rnd(); x = t * 1600; y = bandY(t) + (rnd() - 0.5) * 260 }
      return { id: i, x: Math.round(x), y: Math.round(Math.max(-20, Math.min(920, y))), r: +(0.5 + rnd() * 0.9).toFixed(2), style: flyStyle(true) }
    })
    return { dims, dust }
  }, [])
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="cel-galaxy-svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g className="cel-dust">
        {dust.map((st) => (
          <circle key={st.id} className="ff cel-star" cx={st.x} cy={st.y} r={st.r} style={st.style} />
        ))}
      </g>
      <g className="cel-dims">
        {dims.map((st) => (
          <circle key={st.id} className={`ff cel-dim ${st.g}`} cx={st.x} cy={st.y} r={st.r} style={st.style} />
        ))}
      </g>
    </svg>
  )
}

// each body wakes from dim to full colour + glow as the scroll reaches it,
// then stays lit; windows end just before that body's camera close-up
const glowAt = (p: number, a: number, b: number) => smoothstep(Math.max(0, Math.min(1, (p - a) / (b - a))))
const bodyGlow = (p: number) => ({
  e: glowAt(p, 0.02, 0.15),
  m: glowAt(p, 0.24, 0.36),
  s: glowAt(p, 0.46, 0.58),
})

export function Celestial({ focus, cam: camMv }: { focus: CelFocus; cam?: MotionValue<number> }) {
  const earthG = useRef<SVGGElement>(null)
  const moonG = useRef<SVGGElement>(null)
  const camG = useRef<SVGGElement>(null)
  const earthLit = useRef<SVGGElement>(null)
  const moonLit = useRef<SVGGElement>(null)
  const sunLit = useRef<SVGGElement>(null)
  const focusRef = useRef(focus)
  focusRef.current = focus
  const camMvRef = useRef(camMv)
  camMvRef.current = camMv

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const setG = (el: SVGGElement | null, g: number) => el && el.style.setProperty('--g', g.toFixed(3))

  // reduced motion: no orbits, camera cuts instantly to the focused body
  useEffect(() => {
    if (!reduced) return
    const e = earthAt(EA0)
    const m = { x: e.x + 46 * Math.cos(MA0), y: e.y + 46 * Math.sin(MA0) }
    const t = focus === 'earth' ? e : focus === 'moon' ? m : focus === 'sun' ? SUN : { x: VC, y: VC }
    const s = ZOOM[focus]
    camG.current?.setAttribute('transform', `translate(${VC} ${VC}) scale(${s}) translate(${-t.x} ${-t.y})`)
    setG(earthLit.current, 1); setG(moonLit.current, 1); setG(sunLit.current, 1)
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

      // camera target + per-body glow
      const mv = camMvRef.current
      let tgt: { x: number; y: number }, zoomTgt: number
      if (!mv) {
        // static (mobile): rest on the whole system, everything lit
        const f = focusRef.current
        tgt = posOf(f); zoomTgt = ZOOM[f]
        setG(earthLit.current, 1); setG(moonLit.current, 1); setG(sunLit.current, 1)
      } else {
        // continuous camera: interpolate between the two keyframes straddling
        // the current scroll progress — no discrete focus, no reset.
        const p = Math.max(0, Math.min(1, mv.get()))
        // progressive reveal: each body lights up as the scroll reaches it
        const g = bodyGlow(p)
        setG(earthLit.current, g.e); setG(moonLit.current, g.m); setG(sunLit.current, g.s)
        let i = 0
        while (i < CAM_KF.length - 2 && p > CAM_KF[i + 1].at) i++
        const a = CAM_KF[i], b2 = CAM_KF[i + 1]
        const tt = smoothstep(Math.max(0, Math.min(1, (p - a.at) / (b2.at - a.at))))
        const pa = posOf(a.b), pb = posOf(b2.b)
        tgt = { x: lerp(pa.x, pb.x, tt), y: lerp(pa.y, pb.y, tt) }
        zoomTgt = lerp(a.z, b2.z, tt)
      }

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

  return (
    <svg className={`cel-scene${focus === 'all' ? ' all' : ''}`} viewBox="0 0 560 560" width="100%" height="100%" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="cel-corona" cx="50%" cy="50%"><stop offset="0" stopColor="rgba(245,158,11,.34)" /><stop offset=".7" stopColor="rgba(245,158,11,.08)" /><stop offset="1" stopColor="rgba(245,158,11,0)" /></radialGradient>
        <radialGradient id="celh-e" cx="50%" cy="50%"><stop offset="0" stopColor="#3b82f6" stopOpacity=".6" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
        <radialGradient id="celh-m" cx="50%" cy="50%"><stop offset="0" stopColor="#94a3b8" stopOpacity=".55" /><stop offset="1" stopColor="#94a3b8" stopOpacity="0" /></radialGradient>
        <radialGradient id="celh-s" cx="50%" cy="50%"><stop offset="0" stopColor="#fbbf24" stopOpacity=".6" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient>
      </defs>

      {/* camera rig: everything inside flies with the zoom */}
      <g ref={camG}>
        {/* orbit paths */}
        <circle className="cel-orbitpath" cx={SUN.x} cy={SUN.y} r="174" />

        {/* Sun · Viability */}
        <g ref={sunLit} className="cel-body s">
          <circle className="cel-halo" cx={SUN.x} cy={SUN.y} r="132" fill="url(#celh-s)" />
          <circle cx={SUN.x} cy={SUN.y} r="118" fill="url(#cel-corona)">
            <animate attributeName="r" values="112;126;112" dur="5.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".8;1;.8" dur="5.2s" repeatCount="indefinite" />
          </circle>
          <circle className="cel-pulse" cx={SUN.x} cy={SUN.y} r="62" stroke="#d97706" />
          <g transform={`translate(${SUN.x} ${SUN.y})`}><SunBody r={48} idp="celS" /></g>
          <circle cx={SUN.x} cy={SUN.y} r="54" fill="none" stroke="rgba(217,119,6,.35)" strokeWidth="1">
            <animate attributeName="r" values="54;60;54" dur="3.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".6;.15;.6" dur="3.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Earth system (rAF moves this group along the sun orbit) */}
        <g ref={earthG} transform="translate(388 168)">
          <circle className="cel-orbitpath moonpath" cx="0" cy="0" r="46" />
          <g ref={earthLit} className="cel-body e">
            <circle className="cel-halo" cx="0" cy="0" r="52" fill="url(#celh-e)" />
            <circle className="cel-pulse" cx="0" cy="0" r="26" stroke="#2563eb" />
            <EarthBody r={17} idp="celE" />
          </g>
          {/* Moon (rAF moves this group around Earth, faster) */}
          <g ref={moonG} transform="translate(38 26)">
            <g ref={moonLit} className="cel-body m">
              <circle className="cel-halo" cx="0" cy="0" r="30" fill="url(#celh-m)" />
              <circle className="cel-pulse" cx="0" cy="0" r="14" stroke="#475569" />
              <MoonBody r={8.5} idp="celM" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
