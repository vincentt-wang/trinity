import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion'
import './App.css'
import { Reveal } from './lib/Reveal'
import { useLenis } from './lib/useLenis'
import { CountUp, MaskLines, Stagger } from './lib/anim'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

const LENSES = [
  { k: 'e', tag: 'Desirability', q: 'Is this a real need?', h: 'Does anyone want it', p: 'Start from people. Is the pain real enough and shared by enough of them to use and pay.' },
  { k: 'm', tag: 'Feasibility', q: 'Can you build it?', h: 'Can you make it work', p: 'Tech, team and resources. Can the mechanism actually operate and ship.' },
  { k: 's', tag: 'Viability', q: 'Will it last?', h: 'Does it sustain itself', p: 'Can the business model generate its own fuel and let the venture endure.' },
] as const

const DIMS: Record<'e' | 'm' | 's', string[]> = {
  e: ['Painkiller vs vitamin', 'Tar-pit test', 'Venture-backable', 'Three eternal markets', 'Perfect-market traits', 'Six pain tests', 'Top-down vs bottom-up', 'Fermi pain cost', 'ICP / HXC specificity', 'B2B stakeholder matrix', 'JTBD three layers', 'Five-layer insight', 'TPO scenarios', 'Perceived value 3D', 'Octalysis drivers', 'North-star + bowling pin', 'Golden intersection', 'Founder-market fit', 'Geo & policy targeting'],
  m: ['Stage placement', 'PSF -> PMF -> Scaling', 'Willingness to pay', 'PMF three signals', 'Four MVP types', 'Technical first-principles', 'Business Model Canvas', 'Model & multi-side needs', 'Ecosystem & competition', 'Five moat types', 'Team three traits', 'FMF (execution)', 'Technical gross margin', 'Runway & valley of death', 'Riskiest assumption', 'Demo-ability', 'AI gap positioning'],
  s: ['TAM / SAM / SOM', 'PMF three pillars', 'Six key numbers', 'Unit economics', 'Rule of 40', 'Burn multiple', 'Stage / round thresholds', 'Customer-funded (CFA)', 'Hormozi value equation', 'Pricing strategy', 'Break-even point', 'Multi-method valuation', 'Exit paths', 'Liquidation preference', 'VC return lens (10x?)', 'D2C trap / B2B margin', 'Pitch ten elements', 'Valuation vs comparables', 'AI-durable value'],
}

const ENGINE = [
  { n: '01', h: 'Each lens scores in isolation', p: 'Desirability, Feasibility and Viability are scored independently, blind to each other, to avoid anchoring.' },
  { n: '02', h: 'Then they cross-link', p: 'Six directions of cross-correction. A strong demand signal raises the bar on viability, and so on.' },
  { n: '03', h: 'And converge into one verdict', p: 'D is the gate. The three become a single, actionable call: where you stand and what to fix.' },
]

/* ---------- Hero orbit with 55-dimension stars + parallax ---------- */
const LENS_COL = ['#2563eb', '#64748b', '#d97706'] // e / m / s
function buildStars() {
  const rings = [70, 110, 150]
  const counts = [6, 8, 10]
  const out: { ring: number; r: number; angle: number; col: string; sz: number; delay: number }[] = []
  rings.forEach((rad, ri) => {
    for (let i = 0; i < counts[ri]; i++) {
      const angle = (360 / counts[ri]) * i + ri * 17
      out.push({
        ring: rad,
        r: rad,
        angle,
        col: LENS_COL[(i + ri) % 3],
        sz: 3.2 + ((i * 7) % 3) * 0.7,
        delay: ((i + ri) % 6) * 0.25,
      })
    }
  })
  return out
}
const STARS = buildStars()

function HeroOrbit({ progress }: { progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const y = useTransform(progress, [0, 1], [0, 140]) // slow parallax drift
  const rot = useTransform(progress, [0, 1], [0, 24])
  const fade = useTransform(progress, [0, 0.8], [1, 0.25])
  const sy = useSpring(y, { stiffness: 80, damping: 22 })
  const ringDur = [60, 44, 30]
  const ringIdx = (rad: number) => (rad === 150 ? 2 : rad === 110 ? 1 : 0)
  return (
    <div className="hero-orbit" aria-hidden>
    <motion.div className="hero-orbit-inner" style={{ y: sy, rotate: rot, opacity: fade }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <radialGradient id="g-sun" cx="38%" cy="32%"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#d97706" /></radialGradient>
          <radialGradient id="g-earth" cx="36%" cy="30%"><stop offset="0" stopColor="#bfdbfe" /><stop offset=".5" stopColor="#3b82f6" /><stop offset="1" stopColor="#1d4ed8" /></radialGradient>
          <radialGradient id="g-moon" cx="36%" cy="30%"><stop offset="0" stopColor="#f8fafc" /><stop offset="1" stopColor="#64748b" /></radialGradient>
          <radialGradient id="g-glow" cx="50%" cy="50%"><stop offset="0" stopColor="#dbeafe" stopOpacity=".9" /><stop offset="1" stopColor="#dbeafe" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="200" cy="200" r="150" fill="url(#g-glow)" opacity=".5" />
        {[150, 110, 70].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#d4d9e8" strokeWidth="1" strokeDasharray="2 6" />
        ))}

        {/* dimension stars: one rotating group per ring */}
        {[70, 110, 150].map((rad) => (
          <motion.g
            key={`ring${rad}`}
            style={{ originX: '200px', originY: '200px' }}
            animate={{ rotate: rad === 110 ? -360 : 360 }}
            transition={{ duration: ringDur[ringIdx(rad)], repeat: Infinity, ease: 'linear' }}
          >
            {STARS.filter((s) => s.ring === rad).map((s, i) => {
              const a = (s.angle * Math.PI) / 180
              const cx = 200 + s.r * Math.cos(a)
              const cy = 200 + s.r * Math.sin(a)
              return (
                <circle key={i} cx={cx} cy={cy} r={s.sz} fill={s.col}>
                  <animate attributeName="opacity" values="0.35;1;0.35" dur="2.6s" begin={`${s.delay}s`} repeatCount="indefinite" />
                </circle>
              )
            })}
          </motion.g>
        ))}

        {/* earth core */}
        <circle cx="200" cy="200" r="36" fill="url(#g-earth)" />
        {/* sun + moon satellites */}
        <motion.g style={{ originX: '200px', originY: '200px' }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
          <circle cx={200 + 150} cy="200" r="13" fill="url(#g-sun)" />
        </motion.g>
        <motion.g style={{ originX: '200px', originY: '200px' }} animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
          <circle cx={200 + 110} cy="200" r="9" fill="url(#g-moon)" />
        </motion.g>
      </svg>
    </motion.div>
    </div>
  )
}

/* ---------- Engine: Sui-style pinned scroll narrative ---------- */
function EngineScrolly() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setStep(v < 0.34 ? 0 : v < 0.67 ? 1 : 2)
  })

  // diagram geometry
  const C = 180
  const D = { x: 180, y: 86 }
  const M = { x: 96, y: 232 }
  const S = { x: 264, y: 232 }
  // cross-link draw-in (phase 2)
  const linkLen = useTransform(scrollYProgress, [0.36, 0.62], [0, 1])
  // converge (phase 3): lerp each lens toward center
  const t = useTransform(scrollYProgress, [0.68, 0.96], [0, 1])
  const lerp = (from: { x: number; y: number }, key: 'x' | 'y') =>
    useTransform(t, (v) => from[key] + (C - from[key]) * v)
  const Dx = lerp(D, 'x'), Dy = lerp(D, 'y')
  const Mx = lerp(M, 'x'), My = lerp(M, 'y')
  const Sx = lerp(S, 'x'), Sy = lerp(S, 'y')
  const lensOp = useTransform(scrollYProgress, [0.78, 0.96], [1, 0.12])
  const linkOp = useTransform(scrollYProgress, [0.34, 0.4, 0.7, 0.86], [0, 1, 1, 0])
  const verdictScale = useTransform(scrollYProgress, [0.82, 1], [0, 1])
  const verdictOp = useTransform(scrollYProgress, [0.82, 0.96], [0, 1])

  return (
    <section id="engine" className="engine-scrolly sec-dark">
      <div ref={ref} className="scrolly-track">
        <div className="scrolly-stage wrap">
          <div className="scrolly-copy">
            <div className="eyebrow">How the engine computes</div>
            <h2>Independent first,<br />then cross-linked</h2>
            <p className="lead">Not vibes. Not one prompt. A disciplined sequence that mirrors how the best investors actually reason.</p>
            <div className="estep-list">
              {ENGINE.map((s, i) => (
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
                <radialGradient id="v-core" cx="42%" cy="36%"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#60a5fa" /><stop offset="1" stopColor="#7c3aed" /></radialGradient>
              </defs>

              {/* cross-link lines */}
              <motion.g style={{ opacity: linkOp }} stroke="#7c8bbf" strokeWidth="1.4">
                <motion.line x1={D.x} y1={D.y} x2={M.x} y2={M.y} style={{ pathLength: linkLen }} />
                <motion.line x1={M.x} y1={M.y} x2={S.x} y2={S.y} style={{ pathLength: linkLen }} />
                <motion.line x1={S.x} y1={S.y} x2={D.x} y2={D.y} style={{ pathLength: linkLen }} />
              </motion.g>

              {/* three lenses */}
              <motion.circle cx={Dx} cy={Dy} r="34" fill="url(#v-e)" style={{ opacity: lensOp }}>
                <animate attributeName="r" values="34;37;34" dur="3s" repeatCount="indefinite" />
              </motion.circle>
              <motion.circle cx={Mx} cy={My} r="28" fill="url(#v-m)" style={{ opacity: lensOp }}>
                <animate attributeName="r" values="28;31;28" dur="3.4s" begin=".4s" repeatCount="indefinite" />
              </motion.circle>
              <motion.circle cx={Sx} cy={Sy} r="30" fill="url(#v-s)" style={{ opacity: lensOp }}>
                <animate attributeName="r" values="30;33;30" dur="3.2s" begin=".8s" repeatCount="indefinite" />
              </motion.circle>

              {/* converged verdict */}
              <motion.g style={{ scale: verdictScale, opacity: verdictOp, transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx="180" cy="180" r="58" fill="url(#v-core)" />
                <circle cx="180" cy="180" r="58" fill="none" stroke="#a5b4fc" strokeWidth="1" opacity=".6">
                  <animate attributeName="r" values="58;72;58" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                <text x="180" y="174" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="30" fill="#fff">D / F / V</text>
                <text x="180" y="200" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#e0e7ff">one verdict</text>
              </motion.g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dims() {
  const [k, setK] = useState<'e' | 'm' | 's'>('e')
  const counts = { e: 19, m: 17, s: 19 }
  const label = { e: 'Desirability', m: 'Feasibility', s: 'Viability' }
  return (
    <div>
      <div className="lenstabs">
        {(['e', 'm', 's'] as const).map((x) => (
          <button key={x} className={`lenstab ${x} ${k === x ? 'on' : ''}`} onClick={() => setK(x)}>
            {label[x]} · {counts[x]}
          </button>
        ))}
      </div>
      <motion.div className="dimgrid" key={k} initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.025 } } }}>
        {DIMS[k].map((d) => (
          <motion.div key={d} className={`dimchip ${k}`} variants={{ hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] } } }}>
            {d}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
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

export default function App() {
  useLenis()
  const navDark = useNavTheme()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProg } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  return (
    <>
      <nav className={`nav${navDark ? ' on-dark' : ''}`}>
        <div className="nav-in">
          <a className="brand" href="#top">{LOGO} TRINITY</a>
          <div className="nav-links">
            <a href="#engine">How it works</a>
            <a href="#dims">The 55 dimensions</a>
            <a href="#fit">Where you fit</a>
            <a className="btn btn-primary" href="#cta">Analyze my idea</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top" ref={heroRef}>
        <div className="hero-blob" aria-hidden />
        <HeroOrbit progress={heroProg} />
        <div className="wrap">
          <Reveal><div className="eyebrow">Innovation Trinity · Feasibility Engine</div></Reveal>
          <h1>
            <MaskLines lines={[<>From an idea</>, <>to an <span className="hl">investable</span></>, <span className="hl">startup</span>]} />
          </h1>
          <Reveal delay={0.5}><p>Feed your idea to the Trinity engine. See where it really stands across 55 dimensions, and who to talk to next.</p></Reveal>
          <Reveal delay={0.62}>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#cta">Analyze my idea</a>
              <a className="btn btn-ghost" href="#engine">See how it works</a>
            </div>
          </Reveal>
        </div>
        <div className="scroll-cue" aria-hidden />
      </header>

      <section className="sec sec-soft">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">How the engine thinks</div><h2>Three lenses, three questions</h2><p className="lead">An investable startup needs three things to hold at once. Miss one and the engine tells you.</p></div></Reveal>
          <Stagger className="cards c3">
            {LENSES.map((l) => (
              <div className="card" key={l.k}>
                <div className={`ic ${l.k}`}>
                  <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
                </div>
                <div className="eyebrow" style={{ color: 'var(--ink-dim)' }}>{l.tag}</div>
                <h3>{l.h}</h3>
                <p>{l.p}</p>
                <div className="q">“{l.q}”</div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      <EngineScrolly />

      <section id="dims" className="sec sec-soft">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">The 55 dimensions</div><h2>Every score is a solid algorithm</h2><p className="lead">Trinity scores a startup across 55 weighted dimensions, split across the three lenses.</p></div></Reveal>
          <div className="stat-row">
            <div className="bignum"><CountUp to={55} /></div>
            <Reveal delay={0.1}><Dims /></Reveal>
          </div>
        </div>
      </section>

      <section id="fit" className="sec">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">Where you fit</div><h2>Your analysis, turned into a move</h2><p className="lead">Trinity places your stage, names the investor type that weights your strongest lens, and shortlists real institutions to contact, across the US and Taiwan.</p></div></Reveal>
          <Stagger className="cards c3">
            {[
              { h: 'Your stage', p: 'Pre-seed, seed, Series A or growth, placed by evidence, not age.' },
              { h: 'The right room', p: 'The investor type that buys what you are strongest at right now.' },
              { h: 'Named contacts', p: 'Real institutions with sites and how to approach each one.' },
            ].map((c) => (
              <div className="card" key={c.h}><h3>{c.h}</h3><p>{c.p}</p></div>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="cta" className="sec sec-dark cta-sec">
        <div className="cta-glow" aria-hidden />
        <div className="wrap">
          <Reveal>
            <div className="cta">
              <h2>Run your first round, free</h2>
              <p>A full report: your Trinity scores, your stage, and the top three things to fix.</p>
              <a className="btn btn-primary" href="#top">Analyze my idea</a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="wrap foot-in">
          <a className="brand" href="#top">{LOGO} TRINITY</a>
          <div>Innovation Trinity · Feasibility Engine</div>
        </div>
      </footer>
    </>
  )
}
