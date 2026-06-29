import { useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import { Reveal } from './lib/Reveal'
import { useLenis } from './lib/useLenis'

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

function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <radialGradient id="sun" cx="40%" cy="35%"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#d97706" /></radialGradient>
          <radialGradient id="earth" cx="38%" cy="32%"><stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#2563eb" /></radialGradient>
          <radialGradient id="moon" cx="38%" cy="32%"><stop offset="0" stopColor="#f1f5f9" /><stop offset="1" stopColor="#64748b" /></radialGradient>
        </defs>
        {[150, 110, 70].map((r, i) => (
          <circle key={i} cx="200" cy="200" r={r} fill="none" stroke="#d4d9e8" strokeWidth="1" />
        ))}
        <circle cx="200" cy="200" r="34" fill="url(#earth)" />
        {[
          { r: 150, dur: 26, s: 14, fill: 'url(#sun)' },
          { r: 110, dur: 18, s: 9, fill: 'url(#moon)' },
        ].map((o, i) => (
          <motion.g key={i} style={{ originX: '200px', originY: '200px' }} animate={{ rotate: 360 }} transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}>
            <circle cx={200 + o.r} cy="200" r={o.s} fill={o.fill} />
          </motion.g>
        ))}
      </svg>
    </div>
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
      <div className="dimgrid">
        {DIMS[k].map((d) => (
          <div key={d} className={`dimchip ${k}`}>{d}</div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  useLenis()
  return (
    <>
      <nav className="nav">
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

      <header className="hero wrap" id="top">
        <HeroOrbit />
        <Reveal><div className="eyebrow">Innovation Trinity · Feasibility Engine</div></Reveal>
        <Reveal delay={0.06}><h1>From an idea<br />to an <span className="hl">investable startup</span></h1></Reveal>
        <Reveal delay={0.12}><p>Feed your idea to the Trinity engine. See where it really stands across 55 dimensions, and who to talk to next.</p></Reveal>
        <Reveal delay={0.18}>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#cta">Analyze my idea</a>
            <a className="btn btn-ghost" href="#engine">See how it works</a>
          </div>
        </Reveal>
      </header>

      <section className="sec-soft">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">How the engine thinks</div><h2>Three lenses, three questions</h2><p className="lead">An investable startup needs three things to hold at once. Miss one and the engine tells you.</p></div></Reveal>
          <div className="cards c3">
            {LENSES.map((l, i) => (
              <Reveal key={l.k} delay={i * 0.08}>
                <div className="card">
                  <div className={`ic ${l.k}`}>
                    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <div className="eyebrow" style={{ color: 'var(--ink-dim)' }}>{l.tag}</div>
                  <h3>{l.h}</h3>
                  <p>{l.p}</p>
                  <div className="q">“{l.q}”</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="engine">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">How the engine computes</div><h2>Independent first, then cross-linked</h2><p className="lead">Not vibes. Not one prompt. A disciplined sequence that mirrors how the best investors actually reason.</p></div></Reveal>
          <div className="engine-wrap">
            {ENGINE.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <div className="estep"><div className="en">{s.n}</div><div><h3>{s.h}</h3><p>{s.p}</p></div></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="dims" className="sec-soft">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">The 55 dimensions</div><h2>Every score is a solid algorithm</h2><p className="lead">Trinity scores a startup across 55 weighted dimensions, split across the three lenses.</p></div></Reveal>
          <div className="stat-row">
            <Reveal><div className="bignum">55</div></Reveal>
            <Reveal delay={0.1}><Dims /></Reveal>
          </div>
        </div>
      </section>

      <section id="fit">
        <div className="wrap">
          <Reveal><div className="sec-head"><div className="eyebrow">Where you fit</div><h2>Your analysis, turned into a move</h2><p className="lead">Trinity places your stage, names the investor type that weights your strongest lens, and shortlists real institutions to contact, across the US and Taiwan.</p></div></Reveal>
          <div className="cards c3">
            {[
              { h: 'Your stage', p: 'Pre-seed, seed, Series A or growth, placed by evidence, not age.' },
              { h: 'The right room', p: 'The investor type that buys what you are strongest at right now.' },
              { h: 'Named contacts', p: 'Real institutions with sites and how to approach each one.' },
            ].map((c, i) => (
              <Reveal key={c.h} delay={i * 0.08}><div className="card"><h3>{c.h}</h3><p>{c.p}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="cta">
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
