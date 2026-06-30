import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion'
import { Reveal } from './lib/Reveal'
import { useLenis } from './lib/useLenis'
import { HeroNetwork } from './lib/HeroNetwork'
import { DimsNetwork } from './lib/DimsNetwork'
import { Aurora } from './lib/Aurora'
import { CountUp, MaskLines, Stagger } from './lib/anim'
import { STATS } from './stats'
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
          <motion.div className="sec-progress dark" style={{ scaleX: scrollYProgress }} aria-hidden />
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

type Dim = { en: string; zh: string; de: string; dz: string }
const DIM_VAR = { e: 'var(--earth)', m: 'var(--moon)', s: 'var(--sun)' } as const

function DimsSection() {
  const { lang } = useLang()
  const c = COPY[lang].dims
  const [k, setK] = useState<'e' | 'm' | 's'>('e')
  const [hov, setHov] = useState<{ k: 'e' | 'm' | 's'; d: Dim } | null>(null)
  const meta = c.lensMeta[k]
  const accent = hov ? DIM_VAR[hov.k] : DIM_VAR[k]
  const name = hov ? (lang === 'en' ? hov.d.en : hov.d.zh) : `${meta.label} · ${DIMENSIONS[k].length} ${c.dimsWord}`
  const desc = hov ? (lang === 'en' ? hov.d.de : hov.d.dz) : meta.q

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
            {LENS_KEYS.map((x) => (
              <button key={x} className={`lenstab ${x} ${k === x ? 'on' : ''}`} onClick={() => setK(x)}>
                <span className="lenstab-dot" /> {c.lensMeta[x].label} <em>{DIMENSIONS[x].length}</em>
              </button>
            ))}
          </div>
        </div>
        <div className="dim-detail" style={{ ['--acc' as string]: accent }}>
          <AnimatePresence mode="wait">
            <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="dim-detail-name">{name}</div>
              <div className="dim-detail-desc">{desc}</div>
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
        <motion.div className="sec-progress" style={{ scaleX: scrollYProgress }} aria-hidden />
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
          <motion.div className="stack-viz" aria-hidden initial="hide" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
            {c.layers.map((s, i) => (
              <motion.div key={s.n} className="stack-plate-wrap" variants={{ hide: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 130, damping: 18 } } }}>
                <div className={`stack-plate p${i} ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)}>
                  <span className="plate-n">{s.n}</span>
                  <span className="plate-h">{s.h}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
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

function FitSection() {
  const { lang } = useLang()
  const c = COPY[lang].fit
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const fill = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '100%'])
  const [i, setI] = useState(0)
  const n = c.stages.length
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setI(Math.min(n - 1, Math.max(0, Math.floor(p * n))))
  })
  const s = c.stages[i]
  return (
    <section id="fit" className="fit-scrolly">
      <Aurora tone="cool" />
      <div ref={ref} className="fit-track">
        <div className="fit-stage wrap">
          <motion.div className="sec-progress" style={{ scaleX: scrollYProgress }} aria-hidden />
          <div className="sec-head"><div className="eyebrow">{c.eyebrow}</div><h2>{c.h2}</h2><p className="lead">{c.lead}</p></div>
          <div className="fit">
            <div className="fit-rail">
              <div className="fit-rail-line"><motion.div className="fit-rail-fill" style={{ width: fill }} /></div>
              {c.stages.map((st, idx) => (
                <button key={idx} className={`fit-node ${idx <= i ? 'on' : ''} ${idx === i ? 'cur' : ''}`} onClick={() => setI(idx)}>
                  <span className="fit-dot" />
                  <span className="fit-node-lbl">{st.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={i} className="fit-panel" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}>
                <div className="fit-room">
                  <div className="eyebrow">{c.roomAtPre}{s.label}{c.roomAtPost}</div>
                  <h3>{s.room}</h3>
                  <p>{s.desc}</p>
                </div>
                <div className="fit-firms">
                  <div className="fit-firms-cap">{c.who}</div>
                  <motion.div className="fit-firm-list" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
                    {FIRMS[i].map((f) => (
                      <motion.div key={f.n} className="fit-firm" variants={{ hide: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] } } }}>
                        <span className="fit-firm-n">{f.n}</span>
                        <span className="fit-firm-geo">{f.geo}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
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
  const items = [
    { v: STATS.analyzed, plus: true },
    { v: 55, plus: false },
    { v: 3, plus: false },
    { v: 2, plus: false },
  ]
  return (
    <section className="statsband sec-dark">
      <div className="wrap statsband-in">
        {items.map((it, i) => (
          <div className="stat-cell" key={i}>
            <div className="stat-v"><CountUp to={it.v} />{it.plus && <span className="stat-plus">+</span>}</div>
            <div className="stat-l">{labels[i]}</div>
          </div>
        ))}
      </div>
    </section>
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

export default function Home({ onAnalyze }: { onAnalyze: () => void }) {
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
            <a className={active === 'engine' ? 'on' : ''} href="#engine">{c.nav.howItWorks}</a>
            <a className={active === 'stack' ? 'on' : ''} href="#stack">{c.nav.stack}</a>
            <a className={active === 'dims' ? 'on' : ''} href="#dims">{c.nav.dims}</a>
            <a className={active === 'fit' ? 'on' : ''} href="#fit">{c.nav.fit}</a>
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
              <a className="btn btn-ghost" href="#engine">{c.hero.ctaGhost}</a>
            </div>
          </Reveal>
        </div>
        <div className="scroll-cue" aria-hidden />
      </header>

      <section className="sec sec-soft">
        <Aurora tone="cool" />
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

      <EngineScrolly />

      <StackSection />

      <DimsSection />

      <FitSection />

      <WhyFounders />

      <BeforeAfter />

      <StatsBand />

      <section id="cta" className="sec sec-dark cta-sec">
        <div className="cta-glow" aria-hidden />
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
            <a className="path" href="#engine">
              <span className="path-h">{c.cta.paths[1].h}</span>
              <span className="path-p">{c.cta.paths[1].p}</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
            <a className="path" href="#fit">
              <span className="path-h">{c.cta.paths[2].h}</span>
              <span className="path-p">{c.cta.paths[2].p}</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
          </Stagger>
        </div>
      </section>

      <footer>
        <div className="wrap foot-in">
          <a className="brand" href="#top">{LOGO} TRINITY</a>
          <div>{c.footer}</div>
        </div>
      </footer>
    </>
  )
}
