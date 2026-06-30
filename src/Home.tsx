import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { Reveal } from './lib/Reveal'
import { useLenis } from './lib/useLenis'
import { HeroNetwork } from './lib/HeroNetwork'
import { CountUp, MaskLines, Stagger } from './lib/anim'
import { STATS } from './stats'

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
                {/* the three lenses, now merged into one */}
                <circle cx="170" cy="166" r="9" fill="url(#v-e)" stroke="#fff" strokeWidth="2" />
                <circle cx="190" cy="166" r="9" fill="url(#v-s)" stroke="#fff" strokeWidth="2" />
                <circle cx="180" cy="181" r="9" fill="url(#v-m)" stroke="#fff" strokeWidth="2" />
                <text x="180" y="210" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="16" letterSpacing=".02em" fill="#fff">One clear call</text>
              </motion.g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

const LENS_META = {
  e: { label: 'Desirability', q: 'Is the need real, sharp and shared by enough people to pay?', col: 'var(--earth)' },
  m: { label: 'Feasibility', q: 'Can this team actually build the mechanism and ship it?', col: 'var(--moon)' },
  s: { label: 'Viability', q: 'Will the model fund itself and let the venture endure?', col: 'var(--sun)' },
} as const

// one-line plain-English read for every dimension, shown on hover
const DESC: Record<string, string> = {
  'Painkiller vs vitamin': 'Must-have urgency versus nice-to-have. Only painkillers get bought fast.',
  'Tar-pit test': 'A seductive idea that quietly traps founders for years.',
  'Venture-backable': 'Could this plausibly return a whole fund, not just a salary?',
  'Three eternal markets': 'Health, wealth or relationships, the demand that never dies.',
  'Perfect-market traits': 'Large, growing, urgent, underserved and reachable.',
  'Six pain tests': 'Frequency, intensity, budget, urgency, reach and willingness to pay.',
  'Top-down vs bottom-up': 'Two independent ways to size whether the demand is really there.',
  'Fermi pain cost': 'A back-of-envelope dollar cost of the problem today.',
  'ICP / HXC specificity': 'How sharply you have defined the ideal, high-expectation customer.',
  'B2B stakeholder matrix': 'Who decides, who uses, who pays and who can block the deal.',
  'JTBD three layers': 'The functional, emotional and social job the customer hires you for.',
  'Five-layer insight': 'How deep the non-obvious truth behind the idea really runs.',
  'TPO scenarios': 'The time, place and occasion where the need actually fires.',
  'Perceived value 3D': 'Functional, emotional and economic value as the buyer feels it.',
  'Octalysis drivers': 'Which core motivation drivers pull users in and keep them.',
  'North-star + bowling pin': 'A clear beachhead that knocks down the next segments in turn.',
  'Golden intersection': 'Where real demand, your unfair edge and a market overlap.',
  'Founder-market fit': 'Why this team, uniquely, is built to win this market.',
  'Geo & policy targeting': 'The region and regulation that make the wedge winnable now.',
  'Stage placement': 'Pre-seed to growth, placed by evidence rather than age.',
  'PSF -> PMF -> Scaling': 'Which proof milestone you have actually cleared so far.',
  'Willingness to pay': 'Real signed or paid intent, not survey smiles.',
  'PMF three signals': 'Retention, word-of-mouth and organic pull as proof of fit.',
  'Four MVP types': 'The cheapest build that tests the single riskiest thing.',
  'Technical first-principles': 'Does the mechanism hold up from physics, not from hype?',
  'Business Model Canvas': 'Do the nine building blocks actually fit together?',
  'Model & multi-side needs': 'Every side of the market has a reason to show up.',
  'Ecosystem & competition': 'Who else is in the arena and where the open gaps are.',
  'Five moat types': 'Network effects, scale, brand, switching cost or IP.',
  'Team three traits': 'Founder grit, sharp insight and the ability to recruit.',
  'FMF (execution)': 'Can this specific team really ship and sell it?',
  'Technical gross margin': 'What it actually costs you to deliver one more unit.',
  'Runway & valley of death': 'Enough cash to reach the next proof point before zero.',
  'Riskiest assumption': 'The one belief that, if wrong, kills the company.',
  'Demo-ability': 'Can you show, not just tell, that it works?',
  'AI gap positioning': 'Where you sit as foundation models keep getting better.',
  'TAM / SAM / SOM': 'Total, serviceable and obtainable market, honestly sized.',
  'PMF three pillars': 'Demand, retention and economics all holding together.',
  'Six key numbers': 'The metrics an investor checks before anything else.',
  'Unit economics': 'Do you make money on a single customer?',
  'Rule of 40': 'Growth rate plus profit margin should clear forty percent.',
  'Burn multiple': 'Cash burned for every dollar of new recurring revenue.',
  'Stage / round thresholds': 'The numbers each funding round expects you to hit.',
  'Customer-funded (CFA)': 'Can customers fund growth instead of dilution?',
  'Hormozi value equation': 'Dream outcome over perceived effort, time and risk.',
  'Pricing strategy': 'Capturing a fair share of the value you create.',
  'Break-even point': 'When revenue finally covers the whole cost base.',
  'Multi-method valuation': 'A triangulated worth, not one hopeful number.',
  'Exit paths': 'Who realistically buys this one day, and why.',
  'Liquidation preference': 'How the terms reshape who actually gets paid first.',
  'VC return lens (10x?)': 'Could this plausibly 10x from where it stands today?',
  'D2C trap / B2B margin': 'The margin reality of the chosen go-to-market.',
  'Pitch ten elements': 'Whether the story covers what investors must hear.',
  'Valuation vs comparables': 'Priced sanely against similar recent deals.',
  'AI-durable value': 'Does the value survive as AI commoditizes the easy parts?',
}

function DimsSection() {
  const [k, setK] = useState<'e' | 'm' | 's'>('e')
  const [hov, setHov] = useState<string | null>(null)
  const meta = LENS_META[k]
  const name = hov ?? `${meta.label} · ${DIMS[k].length} dimensions`
  const desc = hov ? DESC[hov] : meta.q
  const lens = (['e', 'm', 's'] as const)

  return (
    <div className="stat-row">
      <div className="stat-left">
        <div className="bignum"><span className="bn-ghost">55</span><span className="bn-live"><CountUp to={55} /></span></div>
        <div className="bignum-sub">weighted dimensions, scored across three lenses</div>
        <div className="dim-detail" style={{ ['--acc' as string]: meta.col }}>
          <AnimatePresence mode="wait">
            <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="dim-detail-name">{name}</div>
              <div className="dim-detail-desc">{desc}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="stat-right">
        <div className="lenstabs">
          {lens.map((x) => (
            <button key={x} className={`lenstab ${x} ${k === x ? 'on' : ''}`} onClick={() => { setK(x); setHov(null) }}>
              {LENS_META[x].label} · {DIMS[x].length}
            </button>
          ))}
        </div>
        <motion.div className="dimgrid" key={k} initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.022 } } }} onMouseLeave={() => setHov(null)}>
          {DIMS[k].map((d) => (
            <motion.button
              key={d}
              type="button"
              className={`dimchip ${k} ${hov === d ? 'on' : ''}`}
              onMouseEnter={() => setHov(d)}
              onFocus={() => setHov(d)}
              variants={{ hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] } } }}
            >
              {d}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* ---------- Where you fit: interactive stage explorer ---------- */
const STAGES = [
  { id: 'pre', label: 'Pre-seed', room: 'Accelerators & angels', desc: 'Conviction on the founder and a sharp wedge, before the metrics exist.', firms: [{ n: 'Y Combinator', geo: 'US' }, { n: 'Techstars', geo: 'US' }, { n: 'AppWorks', geo: 'TW' }] },
  { id: 'seed', label: 'Seed', room: 'Thesis-driven seed funds', desc: 'A non-obvious insight and the first real signs of pull.', firms: [{ n: 'a16z', geo: 'US' }, { n: 'First Round', geo: 'US' }, { n: 'Hive Ventures', geo: 'TW' }] },
  { id: 'a', label: 'Series A', room: 'Metrics-led growth VCs', desc: 'Repeatable traction and unit economics that actually work.', firms: [{ n: 'Accel', geo: 'US' }, { n: 'Lightspeed', geo: 'US' }, { n: 'Cherubic Ventures', geo: 'US / TW' }] },
  { id: 'growth', label: 'Growth', room: 'Late-stage & crossover funds', desc: 'A proven engine, now the question is how efficiently it scales.', firms: [{ n: 'Sequoia', geo: 'US' }, { n: 'Taiwania Capital', geo: 'TW' }, { n: 'CDIB Capital', geo: 'TW' }] },
] as const

function FitExplorer() {
  const [i, setI] = useState(1)
  const s = STAGES[i]
  return (
    <div className="fit">
      <div className="fit-rail">
        <div className="fit-rail-line"><motion.div className="fit-rail-fill" animate={{ width: `${(i / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }} /></div>
        {STAGES.map((st, idx) => (
          <button key={st.id} className={`fit-node ${idx <= i ? 'on' : ''} ${idx === i ? 'cur' : ''}`} onClick={() => setI(idx)}>
            <span className="fit-dot" />
            <span className="fit-node-lbl">{st.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={s.id} className="fit-panel" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
          <div className="fit-room">
            <div className="eyebrow">The room at {s.label}</div>
            <h3>{s.room}</h3>
            <p>{s.desc}</p>
          </div>
          <div className="fit-firms">
            <div className="fit-firms-cap">Who you would talk to</div>
            <motion.div className="fit-firm-list" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
              {s.firms.map((f) => (
                <motion.div key={f.n} className="fit-firm" variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.7, 0.2, 1] } } }}>
                  <span className="fit-firm-n">{f.n}</span>
                  <span className="fit-firm-geo">{f.geo}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------- The Trinity stack: interactive composable layers ---------- */
const STACK = [
  { n: '01', h: '55-dimension scoring', p: 'Every idea is read across 55 weighted dimensions, each one a solid algorithm rather than a hunch.' },
  { n: '02', h: 'Three independent lenses', p: 'Desirability, Feasibility and Viability are scored blind to each other, so no lens anchors the rest.' },
  { n: '03', h: 'Six-way cross-link', p: 'The three lenses then correct one another in six directions before anything is concluded.' },
  { n: '04', h: 'Evidence gating', p: 'Scores are gated on evidence, so the engine cannot be talked into an inflated number.' },
  { n: '05', h: 'Synthesis into one verdict', p: 'Desirability is the gate. The three converge into a single, actionable call.' },
  { n: '06', h: 'Investor & stage matching', p: 'Your verdict maps to a funding stage and a shortlist of real investors, across the US and Taiwan.' },
] as const

function StackSection() {
  const [active, setActive] = useState(0)
  return (
    <section id="stack" className="sec sec-soft">
      <div className="wrap">
        <Reveal><div className="sec-head"><div className="eyebrow">The Trinity stack</div><h2>Innovation, engineered</h2><p className="lead">Six composable layers turn a raw idea into a verdict you can act on. Hover a layer to see it light up.</p></div></Reveal>
        <div className="stack">
          <div className="stack-list">
            {STACK.map((s, i) => (
              <button key={s.n} type="button" className={`stack-item ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
                <span className="stack-n">{s.n}</span>
                <span className="stack-tx">
                  <span className="stack-h">{s.h}</span>
                  <span className="stack-p">{s.p}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="stack-viz" aria-hidden>
            {STACK.map((s, i) => (
              <div key={s.n} className={`stack-plate p${i} ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)}>
                <span className="plate-n">{s.n}</span>
                <span className="plate-h">{s.h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Why founders choose Trinity ---------- */
const WHY = [
  { k: 'e', h: 'A verdict, not vibes', p: 'A clear call gated on evidence, instead of a flattering gut feeling.', icon: <path d="M20 6L9 17l-5-5" /> },
  { k: 's', h: 'Scored across 55 dimensions', p: 'Every weighted dimension is a solid algorithm, not a one-line prompt.', icon: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5m4 5V8m4 8v-3" /></> },
  { k: 'm', h: 'Your stage and the right room', p: 'The funding stage you are really at, and the investor type that buys it.', icon: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></> },
  { k: 'e', h: 'Honest gating, no inflated scores', p: 'The engine cannot be talked into a high number it has not earned.', icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></> },
] as const

function WhyFounders() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal><div className="sec-head"><div className="eyebrow">Why founders choose Trinity</div><h2>An honest read you can act on</h2><p className="lead">Most tools flatter you. Trinity is built to tell you where you actually stand.</p></div></Reveal>
        <Stagger className="cards c4">
          {WHY.map((w, i) => (
            <div className="card" key={i}>
              <div className={`ic ${w.k}`}>
                <svg fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{w.icon}</svg>
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

/* ---------- Before / After: show the muscle ---------- */
const BA = [
  { k: 'Your read of the idea', before: 'A gut feeling and a flattering self-score.', after: 'A D / F / V verdict, gated on real evidence.' },
  { k: 'Who to raise from', before: 'A guessed list of famous VCs.', after: 'Named funds matched to your stage and strongest lens.' },
  { k: 'What to do on Monday', before: 'Polish the deck again and hope.', after: 'The top three things to fix, in priority order.' },
] as const

function BeforeAfter() {
  return (
    <section className="sec sec-soft">
      <div className="wrap">
        <Reveal><div className="sec-head"><div className="eyebrow">Before and after</div><h2>From guesswork to a clear move</h2><p className="lead">The same idea, read two ways. One leaves you guessing; the other hands you the next step.</p></div></Reveal>
        <Reveal delay={0.1}>
          <div className="ba">
            <div className="ba-col before">
              <div className="ba-tag">Without Trinity</div>
              {BA.map((r) => (
                <div className="ba-item" key={r.k}>
                  <div className="ba-q">{r.k}</div>
                  <div className="ba-a">{r.before}</div>
                </div>
              ))}
            </div>
            <div className="ba-arrow" aria-hidden>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </div>
            <div className="ba-col after">
              <div className="ba-tag">With Trinity</div>
              {BA.map((r) => (
                <div className="ba-item" key={r.k}>
                  <div className="ba-q">{r.k}</div>
                  <div className="ba-a">
                    <svg className="ba-check" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    {r.after}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Track-record stats band ---------- */
function StatsBand() {
  const items = [
    { v: STATS.analyzed, plus: true, l: 'startups analyzed' },
    { v: 55, l: 'dimensions scored' },
    { v: 3, l: 'independent lenses' },
    { v: 2, l: 'markets mapped · US + TW' },
  ]
  return (
    <section className="statsband sec-dark">
      <div className="wrap statsband-in">
        {items.map((it) => (
          <div className="stat-cell" key={it.l}>
            <div className="stat-v"><CountUp to={it.v} />{it.plus && <span className="stat-plus">+</span>}</div>
            <div className="stat-l">{it.l}</div>
          </div>
        ))}
      </div>
    </section>
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

export default function Home({ onAnalyze }: { onAnalyze: () => void }) {
  useLenis()
  const navDark = useNavTheme()
  const heroMag = useMagnetic<HTMLButtonElement>()

  return (
    <>
      <nav className={`nav${navDark ? ' on-dark' : ''}`}>
        <div className="nav-in">
          <a className="brand" href="#top">{LOGO} TRINITY</a>
          <div className="nav-links nav-center">
            <a href="#engine">How it works</a>
            <a href="#stack">The stack</a>
            <a href="#dims">The 55 dimensions</a>
            <a href="#fit">Where you fit</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-primary" onClick={onAnalyze}>Analyze my idea</button>
          </div>
        </div>
      </nav>

      <header className="hero hero-center" id="top">
        <HeroNetwork />
        <div className="hero-veil" aria-hidden />
        <div className="wrap hero-inner">
          <Reveal><div className="eyebrow eyebrow-center">Innovation Trinity · Feasibility Engine</div></Reveal>
          <h1 className="hero-title">
            <MaskLines lines={[<>From an idea to</>, <>an <span className="hl">investable startup</span></>]} />
          </h1>
          <Reveal delay={0.45}><p className="hero-lead">Feed your idea to the Trinity engine. See where it really stands across 55 dimensions, and exactly who to talk to next.</p></Reveal>
          <Reveal delay={0.58}>
            <div className="hero-cta hero-cta-center">
              <button ref={heroMag} className="btn btn-primary" onClick={onAnalyze}>Analyze my idea</button>
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

      <StackSection />

      <section id="dims" className="sec sec-soft">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">The 55 dimensions</div><h2>Every score is a solid algorithm</h2><p className="lead">Trinity scores a startup across 55 weighted dimensions, split across the three lenses. Hover any one to see what it checks.</p></div></Reveal>
          <Reveal delay={0.1}><DimsSection /></Reveal>
        </div>
      </section>

      <section id="fit" className="sec">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">Where you fit</div><h2>Your analysis, turned into a move</h2><p className="lead">Trinity places your stage, names the investor type that weights your strongest lens, and shortlists real institutions to contact. Walk the stages to see who you would talk to.</p></div></Reveal>
          <Reveal delay={0.1}><FitExplorer /></Reveal>
        </div>
      </section>

      <WhyFounders />

      <BeforeAfter />

      <StatsBand />

      <section id="cta" className="sec sec-dark cta-sec">
        <div className="cta-glow" aria-hidden />
        <div className="wrap">
          <Reveal>
            <div className="cta">
              <h2>Get started</h2>
              <p>Run your first round free. A full report: your Trinity scores, your stage, and the top three things to fix.</p>
            </div>
          </Reveal>
          <Stagger className="paths">
            <button className="path primary" onClick={onAnalyze}>
              <span className="path-h">Analyze my idea</span>
              <span className="path-p">Your D / F / V verdict, stage and top-three fixes.</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </button>
            <a className="path" href="#engine">
              <span className="path-h">See how it works</span>
              <span className="path-p">The engine, step by step, from lenses to verdict.</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
            <a className="path" href="#fit">
              <span className="path-h">Where you fit</span>
              <span className="path-p">The stage and the investors that match your idea.</span>
              <span className="path-go"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg></span>
            </a>
          </Stagger>
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
