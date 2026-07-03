import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'
import { Reveal } from './lib/Reveal'
import { useLenis, scrollToId } from './lib/useLenis'
import { HeroNetwork } from './lib/HeroNetwork'
import { DimsNetwork } from './lib/DimsNetwork'
import { DIM_OBS } from './dimsGraph'
import { Aurora } from './lib/Aurora'
import { Celestial, CelStars, EarthBody, MoonBody, SunBody, MiniSystem } from './lib/Celestial'
import { DrawArcs, ParallaxRings } from './lib/Ambient'
import { CountUp, MaskLines, Stagger } from './lib/anim'
import { analyzedCount, fetchAnalyzed } from './stats'
import { useLang } from './i18n'
import { COPY, DIMENSIONS } from './copy'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

const LENS_KEYS = ['e', 'm', 's'] as const
const LENS_ICON = (
  <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
)

/* ---------- Vertical scroll-progress rail (sui-style) for pinned sections ---------- */
function VScrollRail({ progress, steps, active, dark }: { progress: MotionValue<number>; steps: number; active: number; dark?: boolean }) {
  return (
    <div className={`vrail${dark ? ' dark' : ''}`} aria-hidden>
      <div className="vrail-track" />
      <motion.div className="vrail-fill" style={{ scaleY: progress }} />
      {Array.from({ length: steps }).map((_, i) => (
        <span key={i} className={`vrail-dot${i <= active ? ' on' : ''}`} style={{ top: `${(i / (steps - 1)) * 100}%` }} />
      ))}
    </div>
  )
}

/* ---------- Celestial Trinity: the brand story, scroll-driven camera ---------- */
const CEL_EASE = [0.2, 0.7, 0.2, 1] as const
const CEL_FOCI = ['earth', 'moon', 'sun', 'all'] as const
const CEL_STEPS = [0, 0.27, 0.53, 0.79, 1] as const
const celStepAt = (v: number) => (v < 0.27 ? 0 : v < 0.53 ? 1 : v < 0.79 ? 2 : 3)

/* the bodies themselves as the section's scroll-progress indicator */
const CELPROG = [
  { c: '#2563eb', el: <EarthBody r={9} idp="cpE" /> },
  { c: '#64748b', el: <MoonBody r={9} idp="cpM" /> },
  { c: '#d97706', el: <SunBody r={9} idp="cpS" /> },
  { c: '#7c3aed', el: <MiniSystem r={10} /> },
] as const

function CelProgress({ progress, active }: { progress: MotionValue<number>; active: number }) {
  return (
    <div className="celprog" aria-hidden>
      <div className="celprog-track" />
      <motion.div className="celprog-fill" style={{ scaleY: progress }} />
      {CELPROG.map((b, i) => (
        <motion.div
          key={i}
          className={`celprog-body${i === active ? ' on' : ''}`}
          style={{ top: `${(i / (CELPROG.length - 1)) * 100}%`, ['--cg' as string]: b.c }}
          animate={{ scale: i === active ? 1.5 : 1, opacity: i === active ? 1 : 0.45 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <svg viewBox="-16 -16 32 32">{b.el}</svg>
        </motion.div>
      ))}
    </div>
  )
}

/* headline with the key words highlighted: '**' pairs become <strong> */
function CelHeadline({ text }: { text: string }) {
  return <>{text.split('**').map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>
}

function CelestialSection() {
  const { lang } = useLang()
  const c = COPY[lang].celestial
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(celStepAt(v)))
  const reduced = useReducedMotion()

  /* progress within the current step (0..1): drives the camera push-in and
   * the subtitle's scroll-tied drift, so every scrolled pixel shows on screen */
  const celLocal = useTransform(scrollYProgress, (v) => {
    const i = celStepAt(v)
    return Math.min(1, Math.max(0, (v - CEL_STEPS[i]) / (CEL_STEPS[i + 1] - CEL_STEPS[i])))
  })
  const capScale = useTransform(celLocal, [0, 1], [0.88, 1.12])
  const capY = useTransform(celLocal, [0, 1], [22, -24])

  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 920px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  if (narrow) {
    return (
      <section id="celestial" className="cel-scrolly">
        <div className="wrap cel-mstage">
          <div className="eyebrow">{c.kicker}</div>
          <h2 className="cel-title">{c.title}</h2>
          <div className="cel-viz"><Celestial focus="all" /></div>
          <div className="cel-rows">
            {c.bodies.map((b) => (
              <div key={b.k} className={`cel-row ${b.k}`}>
                <div className="cel-cap-label">{b.label}</div>
                <h3 className="cel-row-h"><CelHeadline text={b.h} /></h3>
                <p className="cel-row-s">{b.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const b = c.bodies[step]
  return (
    <section id="celestial" className="cel-scrolly">
      <div ref={ref} className="cel-track">
        <div className="cel-stage">
          <CelStars />
          <CelProgress progress={scrollYProgress} active={step} />
          <div className="cel-head">
            <div className="eyebrow">{c.kicker}</div>
            <h2 className="cel-title">{c.title}</h2>
          </div>
          <div className="cel-viz"><Celestial focus={CEL_FOCI[step]} drive={reduced ? undefined : celLocal} /></div>
          <motion.div className="cel-caption" style={reduced ? undefined : { scale: capScale, y: capY }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className={`cel-cap ${b.k}`}
                initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: CEL_EASE }}
              >
                <div className="cel-cap-label">{b.label}</div>
                <h3 className="cel-cap-h"><CelHeadline text={b.h} /></h3>
                <p className="cel-cap-s">{b.s}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Engine: Sui-style pinned scroll narrative ---------- */
const SPRING = { type: 'spring' as const, stiffness: 120, damping: 18, mass: 0.9 }
const LP = { e: { x: 180, y: 86 }, m: { x: 96, y: 232 }, s: { x: 264, y: 232 } }
const CEN = { x: 180, y: 176 }

function EngineScrolly() {
  const { lang } = useLang()
  const c = COPY[lang].engine
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(v < 0.34 ? 0 : v < 0.67 ? 1 : 2))

  const at = (k: 'e' | 'm' | 's', axis: 'x' | 'y') => (step === 2 ? CEN[axis] : LP[k][axis])
  const lensR = (base: number) => (step === 2 ? 0 : base)

  return (
    <section id="engine" className="engine-scrolly sec-dark">
      <div ref={ref} className="scrolly-track">
        <div className="scrolly-stage wrap">
          <VScrollRail progress={scrollYProgress} steps={3} active={step} dark />
          <div className="scrolly-copy">
            <div className="eyebrow">{c.eyebrow}</div>
            <h2>{c.h2a}<br />{c.h2b}</h2>
            <p className="lead">{c.lead}</p>
            <div className="estep-list">
              {c.steps.map((s, i) => (
                <div key={s.n} className={`estep ${step === i ? 'on' : ''}`}>
                  <div className="en">{s.n}</div>
                  <div><h3>{s.h}</h3><p>{s.p}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="scrolly-viz">
            <svg viewBox="0 0 360 360" width="100%" height="100%">
              <defs>
                <radialGradient id="v-e" cx="36%" cy="30%"><stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#2563eb" /></radialGradient>
                <radialGradient id="v-m" cx="36%" cy="30%"><stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#64748b" /></radialGradient>
                <radialGradient id="v-s" cx="36%" cy="30%"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#d97706" /></radialGradient>
                <radialGradient id="v-core" cx="42%" cy="34%"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor="#7aa2f7" /><stop offset="1" stopColor="#7c3aed" /></radialGradient>
              </defs>

              <motion.g stroke="#8b96c9" strokeWidth="1.4" animate={{ opacity: step === 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <motion.line x1={LP.e.x} y1={LP.e.y} x2={LP.m.x} y2={LP.m.y} animate={{ pathLength: step >= 1 ? 1 : 0 }} transition={{ duration: 0.6 }} />
                <motion.line x1={LP.m.x} y1={LP.m.y} x2={LP.s.x} y2={LP.s.y} animate={{ pathLength: step >= 1 ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.08 }} />
                <motion.line x1={LP.s.x} y1={LP.s.y} x2={LP.e.x} y2={LP.e.y} animate={{ pathLength: step >= 1 ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.16 }} />
              </motion.g>

              <motion.circle fill="url(#v-e)" animate={{ cx: at('e', 'x'), cy: at('e', 'y'), r: lensR(34), opacity: step === 2 ? 0 : 1 }} transition={SPRING} />
              <motion.circle fill="url(#v-m)" animate={{ cx: at('m', 'x'), cy: at('m', 'y'), r: lensR(28), opacity: step === 2 ? 0 : 1 }} transition={SPRING} />
              <motion.circle fill="url(#v-s)" animate={{ cx: at('s', 'x'), cy: at('s', 'y'), r: lensR(30), opacity: step === 2 ? 0 : 1 }} transition={SPRING} />

              <motion.g animate={{ scale: step === 2 ? 1 : 0, opacity: step === 2 ? 1 : 0 }} transition={SPRING} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx={CEN.x} cy={CEN.y} r="58" fill="url(#v-core)" />
                <circle cx={CEN.x} cy={CEN.y} r="58" fill="none" stroke="#a5b4fc" strokeWidth="1">
                  <animate attributeName="r" values="58;76;58" dur="3.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="3.4s" repeatCount="indefinite" />
                </circle>
              </motion.g>
            </svg>

            <motion.div className="verdict-cap" initial={false} animate={{ opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 14 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="verdict-dots"><span className="verdict-dot e" /><span className="verdict-dot m" /><span className="verdict-dot s" /></div>
              <div className="verdict-h">{c.verdictH}</div>
              <div className="verdict-p">{c.verdictP}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

type Dim = { id: string; en: string; zh: string; de: string; dz: string; ask_en: string; ask_zh: string }
type DimK = 'e' | 'm' | 's'
const DIM_KEYS = ['e', 'm', 's'] as const
const DIM_VAR = { e: 'var(--earth)', m: 'var(--moon)', s: 'var(--sun)' } as const

/** Renders an ask question, turning ⟨⟨...⟩⟩ spans into accent-colored strong text. */
function AskText({ t }: { t: string }) {
  return (
    <>
      {t.split('⟨⟨').map((seg, i) => {
        if (i === 0) return seg
        const cut = seg.indexOf('⟩⟩')
        if (cut < 0) return seg
        return (
          <span key={i}>
            <strong>{seg.slice(0, cut)}</strong>
            {seg.slice(cut + 2)}
          </span>
        )
      })}
    </>
  )
}

function DimsSection() {
  const { lang } = useLang()
  const c = COPY[lang].dims
  const [k, setK] = useState<DimK>('e')
  const [hov, setHov] = useState<{ k: DimK; d: Dim } | null>(null)
  const meta = c.lensMeta[k]
  const accent = hov ? DIM_VAR[hov.k] : DIM_VAR[k]
  const d = hov?.d ?? null
  // zero-padded two-digit chip from the id (C04 -> 04); string ops only, no parseInt
  const num = d ? d.id.replace(/\D/g, '').padStart(2, '0') : String(DIMENSIONS[k].length)
  const tag = c.lensMeta[hov ? hov.k : k].label
  const name = d ? (lang === 'en' ? d.en : d.zh) : `${meta.label} · ${DIMENSIONS[k].length} ${c.dimsWord}`
  const desc = d ? (lang === 'en' ? d.de : d.dz) : meta.q
  const ask = d ? (lang === 'en' ? d.ask_en : d.ask_zh) : null

  return (
    <section id="dims" className="sec sec-soft dims-sec">
      <div className="dims-net-layer">
        <DimsNetwork activeLens={k} lang={lang} onHover={(h) => { setHov(h); if (h) setK(h.k) }} onPick={setK} />
      </div>
      <div className="wrap dims-overlay">
        <div className="dims-copy">
          <Reveal>
            <div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div>
          </Reveal>
          <div className="lenstabs lenstabs-row">
            {DIM_KEYS.map((x) => (
              <button key={x} className={`lenstab ${x} ${k === x ? 'on' : ''}`} onClick={() => setK(x)}>
                <span className="lenstab-dot" /> {c.lensMeta[x].label} <em>{DIMENSIONS[x].length}</em>
              </button>
            ))}
          </div>
        </div>
        <div className="dim-detail" style={{ ['--acc' as string]: accent }}>
          <AnimatePresence mode="wait">
            <motion.div className="dim-detail-in" key={d ? d.id : `lens:${k}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="dim-detail-head">
                <span className="dim-chipnum">{num}</span>
                <span className="dim-lens-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" /></svg>
                  {tag}
                </span>
                {d && DIM_OBS[d.id] && <span className="dim-obs-tag">{lang === 'en' ? 'Verified in person · not scored' : '見面驗證 · 不入分'}</span>}
              </div>
              <div className="dim-detail-name">{name}</div>
              <div className="dim-detail-desc">{desc}</div>
              {ask && <div className="dim-ask"><span className="dim-ask-t"><AskText t={ask} /></span></div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function StackSection() {
  const { lang } = useLang()
  const c = COPY[lang].stack
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  const n = c.layers.length
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(p * n))))
  })
  return (
    <section id="stack" className="stack-scrolly sec-soft">
      <Aurora tone="mixed" />
      <div ref={ref} className="stack-track">
        <div className="stack-stage wrap">
        <VScrollRail progress={scrollYProgress} steps={6} active={active} />
        <div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div>
        <div className="stack">
          <div className="stack-list">
            {c.layers.map((s, i) => (
              <button key={s.n} type="button" className={`stack-item ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
                <span className="stack-n">{s.n}</span>
                <span className="stack-tx">
                  <span className="stack-h">{s.h}</span>
                  <span className="stack-p">{s.p}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="stack-iso" aria-hidden>
            <motion.div className="stack-iso-tilt" initial="hide" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }} variants={{ show: { transition: { staggerChildren: 0.09, staggerDirection: -1 } } }}>
              <div className="iso-ground" />
              {/* 01 sits on top; analysis drills downward — passed layers lift away above */}
              {c.layers.map((s, i) => (
                <motion.div
                  key={s.n}
                  className="iso-wrap"
                  style={{ z: (c.layers.length - 1 - i) * 54 }}
                  variants={{ hide: { opacity: 0, y: 110 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 17 } } }}
                >
                  <div className={`iso-plate p${i} ${active === i ? 'on' : i < active ? 'above' : ''}`} onMouseEnter={() => setActive(i)}>
                    <span className="iso-n">{s.n}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Where you fit: interactive stage explorer ---------- */
const FIRMS = [
  [{ n: 'Y Combinator', geo: 'US' }, { n: 'Techstars', geo: 'US' }, { n: 'AppWorks', geo: 'TW' }],
  [{ n: 'a16z', geo: 'US' }, { n: 'First Round', geo: 'US' }, { n: 'Hive Ventures', geo: 'TW' }],
  [{ n: 'Accel', geo: 'US' }, { n: 'Lightspeed', geo: 'US' }, { n: 'Cherubic Ventures', geo: 'US / TW' }],
  [{ n: 'Sequoia', geo: 'US' }, { n: 'Taiwania Capital', geo: 'TW' }, { n: 'CDIB Capital', geo: 'TW' }],
] as const

/* panel items rise in sequence: title first, then rows */
const FIT_EASE = [0.2, 0.7, 0.2, 1] as const
const FIT_ITEM = {
  hide: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: FIT_EASE } },
} as const
/* node centres of the 4-col rail grid (12.5/37.5/62.5/87.5%), mapped into the
 * rail-line's own 12%-88% span, so the marker rests exactly on each node */
const FIT_NODE_POS = ['0.7%', '33.6%', '66.4%', '99.3%']

function FitSection() {
  const { lang } = useLang()
  const c = COPY[lang].fit
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  const n = c.stages.length
  // the journey marker travels node to node, arriving at each stage's scroll midpoint
  const marker = useTransform(scrollYProgress, [0.125, 0.375, 0.625, 0.875], FIT_NODE_POS)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setI(Math.min(n - 1, Math.max(0, Math.floor(p * n))))
  })
  const s = c.stages[i]
  return (
    <section id="fit" className="fit-scrolly">
      <Aurora tone="cool" />
      <div ref={ref} className="fit-track">
        <div className="fit-stage wrap">
          <VScrollRail progress={scrollYProgress} steps={n} active={i} />
          <div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div>
          <div className="fit">
            <div className="fit-rail">
              <div className="fit-rail-line">
                <motion.div className="fit-rail-fill" style={{ width: marker }} />
                <motion.div className="fit-marker" style={{ left: marker }} aria-hidden>
                  <svg viewBox="-12 -12 24 24"><EarthBody r={8.5} idp="fitMk" /></svg>
                </motion.div>
              </div>
              {c.stages.map((st, idx) => (
                <button key={idx} className={`fit-node ${idx <= i ? 'on' : ''} ${idx === i ? 'cur' : ''}`} onClick={() => setI(idx)}>
                  <motion.span
                    className="fit-dot"
                    animate={{ scale: idx === i ? 1.22 : idx < i ? 1 : 0.88 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 12 }}
                  />
                  <span className="fit-node-lbl">{st.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                className="fit-panel"
                initial="hide"
                animate="show"
                exit={{ opacity: 0, x: -26, transition: { duration: 0.24, ease: FIT_EASE } }}
                variants={{ show: { transition: { staggerChildren: 0.09 } } }}
              >
                <div className="fit-room">
                  <motion.div variants={FIT_ITEM} className="eyebrow">{c.roomAtPre}{s.label}{c.roomAtPost}</motion.div>
                  <motion.h3 variants={FIT_ITEM}>{s.room}</motion.h3>
                  <motion.p variants={FIT_ITEM}>{s.desc}</motion.p>
                  <motion.div variants={FIT_ITEM} className="fit-read">
                    <span className="fit-read-l">{c.readsBy}</span>
                    <span className="fit-read-v">{s.read}</span>
                  </motion.div>
                </div>
                <motion.div className="fit-firms" variants={FIT_ITEM}>
                  <div className="fit-firms-cap">{c.who}</div>
                  <motion.div className="fit-firm-list" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
                    {FIRMS[i].map((f) => (
                      <motion.div key={f.n} className="fit-firm" variants={{ hide: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: FIT_EASE } } }}>
                        <span className="fit-firm-n">{f.n}</span>
                        <span className="fit-firm-geo">{f.geo}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Why founders choose Trinity ---------- */
const WHY_META = [
  { k: 'e', icon: <path d="M20 6L9 17l-5-5" /> },
  { k: 's', icon: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5m4 5V8m4 8v-3" /></> },
  { k: 'm', icon: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></> },
  { k: 'e', icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></> },
] as const

function WhyFounders() {
  const { lang } = useLang()
  const c = COPY[lang].why
  return (
    <section className="sec why">
      <div className="why-bg" aria-hidden><span className="why-blob b1" /><span className="why-blob b2" /><span className="why-blob b3" /></div>
      <ParallaxRings />
      <div className="wrap">
        <Reveal><div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div></Reveal>
        <Stagger className="cards c4">
          {c.cards.map((w, i) => (
            <div className="card" key={i}>
              <div className={`ic ${WHY_META[i].k}`}>
                <svg fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{WHY_META[i].icon}</svg>
              </div>
              <h3>{w.h}</h3>
              <p>{w.p}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------- Before / After ---------- */
function BeforeAfter() {
  const { lang } = useLang()
  const c = COPY[lang].ba
  const EASE = [0.2, 0.7, 0.2, 1] as const
  return (
    <section className="sec sec-soft">
      <Aurora tone="warm" />
      <DrawArcs />
      <div className="wrap">
        <Reveal><div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div></Reveal>
        <motion.div className="ba" initial="hide" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }}>
          <motion.div className="ba-col before" variants={{ hide: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}>
            <div className="ba-tag">{c.without}</div>
            {c.rows.map((r, i) => (
              <motion.div className="ba-item" key={r.k} variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE } } }}>
                <div className="ba-q">{r.k}</div>
                <div className="ba-a">{r.before}</div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div className="ba-arrow" aria-hidden variants={{ hide: { opacity: 0, scale: 0, rotate: -90 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 14, delay: 0.5 } } }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
          </motion.div>
          <motion.div className="ba-col after" variants={{ hide: { opacity: 0, x: 70 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2, ease: EASE } } }}>
            <div className="ba-tag">{c.withT}</div>
            {c.rows.map((r, i) => (
              <motion.div className="ba-item" key={r.k} variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.4 + i * 0.12, ease: EASE } } }}>
                <div className="ba-q">{r.k}</div>
                <div className="ba-a">
                  <motion.svg className="ba-check" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                    variants={{ hide: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 12, delay: 0.55 + i * 0.12 } } }}>
                    <path d="M20 6L9 17l-5-5" />
                  </motion.svg>
                  {r.after}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Track-record stats band ---------- */
function StatsBand() {
  const { lang } = useLang()
  const labels = COPY[lang].stats.labels
  // live global count from the Worker; local base+bump until it answers (or when offline)
  const [analyzed, setAnalyzed] = useState(analyzedCount())
  useEffect(() => {
    let on = true
    fetchAnalyzed().then((n) => { if (on && n) setAnalyzed(Math.max(n, analyzedCount())) })
    return () => { on = false }
  }, [])
  const items = [
    { v: analyzed, plus: true },
    { v: 60, plus: false },
    { v: 3, plus: false },
    { v: 2, plus: false },
  ]
  return (
    <div className="statsband-embed">
      <div className="wrap statsband-in">
        {items.map((it, i) => (
          <div className="stat-cell" key={i}>
            <div className="stat-v"><CountUp to={it.v} />{it.plus && <span className="stat-plus">+</span>}</div>
            <div className="stat-l">{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Footer: brand + channels + learn + start ---------- */
const CHAN_ICONS = [
  /* Instagram: rounded square + lens + dot */
  <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="16.9" cy="7.1" r="1.15" fill="currentColor" stroke="none" /></>,
  /* YouTube: rounded rect + play triangle */
  <><rect x="2.5" y="6" width="19" height="13" rx="3.5" /><path d="M10.2 9.6l4.8 2.9-4.8 2.9z" fill="currentColor" stroke="none" /></>,
  /* Podcast: mic + stand */
  <><rect x="9" y="3.5" width="6" height="10.5" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0013 0" /><path d="M12 18v2.8" /></>,
]

function Footer({ onAnalyze, onInsight }: { onAnalyze: () => void; onInsight: () => void }) {
  const { lang } = useLang()
  const c = COPY[lang]
  const f = c.foot
  return (
    <footer>
      <HeroNetwork variant="ambient" />
      <div className="wrap">
        <Stagger className="foot-grid" gap={0.08}>
          <div className="foot-col foot-brandcol">
            <a className="brand" href="#top">{LOGO} TRINITY</a>
            <p className="foot-note">{c.footer}</p>
          </div>
          <div className="foot-col">
            <div className="foot-h">{f.channels}</div>
            <div className="foot-list">
              {f.chans.map((name, i) => (
                <span className="fchan" key={name} aria-disabled="true">
                  <span className="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{CHAN_ICONS[i]}</svg></span>
                  <span className="fchan-n">{name}</span>
                  <span className="fpill">{f.soon}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="foot-col">
            <div className="foot-h">{f.learn}</div>
            <div className="foot-list">
              <span className="flink" aria-disabled="true">{f.workshop}<span className="fpill">{f.soon}</span></span>
              <span className="flink" aria-disabled="true">{f.materials}<span className="fpill">{f.soon}</span></span>
              <button className="flink real" onClick={onInsight}>
                {f.insight}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
          <div className="foot-col">
            <div className="foot-h">{f.start}</div>
            <p className="foot-start-p">{f.startLine}</p>
            <button className="btn btn-primary foot-cta" onClick={onAnalyze}>{f.analyze}</button>
          </div>
        </Stagger>
      </div>
    </footer>
  )
}

/** Track which section is centred in the viewport (nav scrollspy). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])
  return active
}

/** Subtle magnetic pull toward the cursor for hero CTAs. */
function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left - r.width / 2
      const y = e.clientY - r.top - r.height / 2
      el.style.transform = `translate(${x * 0.28}px, ${y * 0.4}px)`
    }
    const leave = () => { el.style.transform = '' }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [])
  return ref
}

/** Invert the nav while a dark full-bleed section sits under it. */
function useNavTheme() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const el = document.elementsFromPoint(window.innerWidth / 2, 64)
        .find((n) => n instanceof HTMLElement && (n.classList.contains('sec-dark') || n.closest('.sec-dark')))
      setDark(Boolean(el))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return dark
}

export default function Home({ onAnalyze, onInsight }: { onAnalyze: () => void; onInsight: () => void }) {
  useLenis()
  const { lang, setLang } = useLang()
  const c = COPY[lang]
  const navDark = useNavTheme()
  const heroMag = useMagnetic<HTMLButtonElement>()
  const active = useActiveSection(['engine', 'stack', 'dims', 'fit'])

  return (
    <>
      <nav className={`nav${navDark ? ' on-dark' : ''}`}>
        <div className="nav-in">
          <a className="brand" href="#top">{LOGO} TRINITY</a>
          <div className="nav-links nav-center">
            <a className={active === 'engine' ? 'on' : ''} href="#engine" onClick={(e) => { e.preventDefault(); scrollToId('#engine') }}>{c.nav.howItWorks}</a>
            <a className={active === 'stack' ? 'on' : ''} href="#stack" onClick={(e) => { e.preventDefault(); scrollToId('#stack') }}>{c.nav.stack}</a>
            <a className={active === 'dims' ? 'on' : ''} href="#dims" onClick={(e) => { e.preventDefault(); scrollToId('#dims') }}>{c.nav.dims}</a>
            <a className={active === 'fit' ? 'on' : ''} href="#fit" onClick={(e) => { e.preventDefault(); scrollToId('#fit') }}>{c.nav.fit}</a>
            <a href="#insight" onClick={(e) => { e.preventDefault(); onInsight() }}>{c.nav.insight}</a>
          </div>
          <div className="nav-cta">
            <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">{lang === 'en' ? 'CH' : 'EN'}</button>
            <button className="btn btn-primary" onClick={onAnalyze}>{c.nav.cta}</button>
          </div>
        </div>
      </nav>

      <header className="hero hero-center" id="top">
        <HeroNetwork />
        <div className="hero-veil" aria-hidden />
        <div className="wrap hero-inner">
          <Reveal><div className="eyebrow eyebrow-center">{c.hero.eyebrow}</div></Reveal>
          <h1 className="hero-title" key={lang}>
            <MaskLines lines={[<>{c.hero.titleA}</>, <>{c.hero.titleB}<span className="hl">{c.hero.titleHl}</span></>]} />
          </h1>
          <Reveal delay={0.45}><p className="hero-lead">{c.hero.lead}</p></Reveal>
          <Reveal delay={0.58}>
            <div className="hero-cta hero-cta-center">
              <button ref={heroMag} className="btn btn-primary" onClick={onAnalyze}>{c.hero.ctaPrimary}</button>
              <a className="btn btn-ghost" href="#engine" onClick={(e) => { e.preventDefault(); scrollToId('#engine') }}>{c.hero.ctaGhost}</a>
            </div>
          </Reveal>
        </div>
        <div className="scroll-cue" aria-hidden />
      </header>

      <section className="sec sec-soft">
        <Aurora tone="cool" />
        <HeroNetwork variant="ambient" />
        <DrawArcs />
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">{c.lenses.eyebrow}</div><h2>{c.lenses.h2}</h2><p className="lead">{c.lenses.lead}</p></div></Reveal>
          <motion.div className="cards c3" initial="hide" whileInView="show" viewport={{ once: true, margin: '-12% 0px' }} variants={{ show: { transition: { staggerChildren: 0.16 } } }}>
            {c.lenses.items.map((l, i) => (
              <motion.div className="card" key={i} variants={{ hide: { opacity: 0, y: 60, scale: 0.92 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 16 } } }}>
                <motion.div className={`ic ${LENS_KEYS[i]}`} variants={{ hide: { scale: 0, rotate: -40 }, show: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 12, delay: 0.12 } } }}>{LENS_ICON}</motion.div>
                <div className="eyebrow" style={{ color: 'var(--ink-dim)' }}>{l.tag}</div>
                <h3>{l.h}</h3>
                <p>{l.p}</p>
                <div className="q">“{l.q}”</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CelestialSection />

      <EngineScrolly />

      <StackSection />

      <DimsSection />

      <FitSection />

      <WhyFounders />

      <BeforeAfter />

      <section id="cta" className="sec sec-dark cta-sec">
        <div className="cta-glow" aria-hidden />
        <HeroNetwork variant="ambient-dark" />
        <StatsBand />
        <div className="wrap">
          <Reveal>
            <div className="cta">
              <h2>{c.cta.h2}</h2>
              <p>{c.cta.p}</p>
            </div>
          </Reveal>
          <Stagger className="paths">
            <button className="path primary" onClick={onAnalyze}>
              <span className="path-h">{c.cta.paths[0].h}</span>
              <span className="path-p">{c.cta.paths[0].p}</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </button>
            <a className="path" href="#engine" onClick={(e) => { e.preventDefault(); scrollToId('#engine') }}>
              <span className="path-h">{c.cta.paths[1].h}</span>
              <span className="path-p">{c.cta.paths[1].p}</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
            <a className="path" href="#fit" onClick={(e) => { e.preventDefault(); scrollToId('#fit') }}>
              <span className="path-h">{c.cta.paths[2].h}</span>
              <span className="path-p">{c.cta.paths[2].p}</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
          </Stagger>
        </div>
      </section>

      <Footer onAnalyze={onAnalyze} onInsight={onInsight} />
    </>
  )
}
