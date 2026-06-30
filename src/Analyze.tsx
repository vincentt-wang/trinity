import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { CountUp } from './lib/anim'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

type Phase = 'input' | 'running' | 'done'

const LENSES = [
  { k: 'e', tag: 'Desirability', col: '#2563eb', soft: '#dbeafe', q: 'Is this a real need?' },
  { k: 'm', tag: 'Feasibility', col: '#475569', soft: '#e2e8f0', q: 'Can you build it?' },
  { k: 's', tag: 'Viability', col: '#d97706', soft: '#fef3c7', q: 'Will it last?' },
] as const

// dimension names that flicker past during the scan of each lens
const SCAN: Record<'e' | 'm' | 's', string[]> = {
  e: ['Painkiller vs vitamin', 'Six pain tests', 'ICP / HXC specificity', 'JTBD three layers', 'Founder-market fit'],
  m: ['Stage placement', 'Riskiest assumption', 'Five moat types', 'Team three traits', 'AI gap positioning'],
  s: ['Unit economics', 'Rule of 40', 'Gross margin', 'Multi-method valuation', 'AI-durable value'],
}

/* ---------- Sample report (clearly labelled, honest scores) ---------- */
const REPORT = {
  scores: { e: 72, m: 64, s: 58 },
  verdict: 'Conditional GO',
  verdictLine: 'The demand is real and the wedge is sharp. Durability is the open question — the engine gates on D, and D clears, so this is fundable once viability is shown.',
  stage: 'Seed',
  stageWhy: 'A working wedge and early pull, but the unit economics are still a model, not a proof.',
  archetype: 'Thesis-driven seed funds',
  archetypeWhy: 'Your strongest lens is Desirability. The right room buys conviction on a sharp insight before the metrics are fully in.',
  firms: [
    { n: 'Y Combinator', geo: 'US', type: 'Accelerator', note: 'Apply with the wedge and one sentence of traction.' },
    { n: 'a16z', geo: 'US', type: 'Seed / multistage', note: 'Lead with the market insight, not the demo.' },
    { n: 'Cherubic Ventures', geo: 'US / TW', type: 'Cross-border seed', note: 'Strong for founders bridging US and Asia.' },
    { n: 'AppWorks', geo: 'TW', type: 'Accelerator + seed', note: 'Greater-Southeast-Asia network and batch support.' },
    { n: 'Hive Ventures', geo: 'TW', type: 'B2B / AI seed', note: 'Fits enterprise-AI and deep-tech wedges.' },
  ],
  fixes: [
    { lens: 's', col: '#d97706', h: 'Model the unit economics', p: 'There is no clear path to gross margin above 60% at scale. Build the bottoms-up model before you raise.' },
    { lens: 'm', col: '#475569', h: 'De-risk the core mechanism', p: 'Your riskiest assumption is still undemonstrated. Ship a thin MVP that proves the one thing that has to be true.' },
    { lens: 'e', col: '#2563eb', h: 'Narrow the ICP', p: 'The target is too broad to dominate. Pick one high-expectation customer segment and own it first.' },
  ],
} as const

function ScoreRing({ label, value, col, delay = 0 }: { label: string; value: number; col: string; delay?: number }) {
  const R = 52
  const C = 2 * Math.PI * R
  const ref = useRef<SVGCircleElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const controls = animate(C, C - (C * value) / 100, {
      duration: 1.3,
      delay,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => { node.style.strokeDashoffset = String(v) },
    })
    return () => controls.stop()
  }, [C, value, delay])
  return (
    <div className="ring">
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r={R} fill="none" stroke="var(--line)" strokeWidth="11" />
        <circle
          ref={ref}
          cx="65" cy="65" r={R} fill="none" stroke={col} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C} transform="rotate(-90 65 65)"
        />
      </svg>
      <div className="ring-mid">
        <div className="ring-num" style={{ color: col }}><CountUp to={value} duration={1.3} /></div>
      </div>
      <div className="ring-lbl">{label}</div>
    </div>
  )
}

/* ---------- Running scan animation ---------- */
function Scanning({ onDone }: { onDone: () => void }) {
  const order = ['e', 'm', 's'] as const
  const [active, setActive] = useState(0)
  const [scanIdx, setScanIdx] = useState(0)

  useEffect(() => {
    const lensMs = 1150
    const timers: ReturnType<typeof setTimeout>[] = []
    order.forEach((_, i) => timers.push(setTimeout(() => setActive(i), i * lensMs)))
    const flick = setInterval(() => setScanIdx((n) => n + 1), 190)
    timers.push(setTimeout(onDone, order.length * lensMs + 500))
    return () => { timers.forEach(clearTimeout); clearInterval(flick) }
  }, [])

  const lens = LENSES[active]
  const list = SCAN[lens.k]
  return (
    <motion.div className="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="scan-orb" aria-hidden>
        <svg viewBox="0 0 220 220" width="220" height="220">
          <defs>
            <radialGradient id="scan-core" cx="42%" cy="36%"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#60a5fa" /><stop offset="1" stopColor="#7c3aed" /></radialGradient>
          </defs>
          {[88, 66, 44].map((r, i) => (
            <circle key={r} cx="110" cy="110" r={r} fill="none" stroke={LENSES[i].col} strokeWidth="2"
              strokeDasharray="3 7" opacity={active === i ? 0.95 : 0.2}>
              <animateTransform attributeName="transform" type="rotate" from={`0 110 110`} to={`${i % 2 ? -360 : 360} 110 110`} dur={`${8 + i * 4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <circle cx="110" cy="110" r="26" fill="url(#scan-core)">
            <animate attributeName="r" values="26;30;26" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="scan-tag" style={{ color: lens.col }}>{lens.tag}</div>
      <div className="scan-dim">{list[scanIdx % list.length]}</div>
      <div className="scan-dots">
        {order.map((k, i) => <span key={k} className={i <= active ? 'on' : ''} style={{ background: i <= active ? LENSES[i].col : undefined }} />)}
      </div>
      <div className="scan-cap">Scoring 55 dimensions across three lenses, independently.</div>
    </motion.div>
  )
}

export default function Analyze({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('input')
  const [idea, setIdea] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const ready = idea.trim().length > 12 || Boolean(file)

  useEffect(() => { window.scrollTo(0, 0) }, [phase])

  const run = () => { if (ready) setPhase('running') }
  const reset = () => { setPhase('input') }

  return (
    <div className="az">
      <div className="az-top">
        <button className="brand" onClick={onBack}>{LOGO} TRINITY</button>
        <button className="az-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Home
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.section key="in" className="az-stage" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="eyebrow">Step 1 · Your idea</div>
            <h1 className="az-h1">Tell the engine what you’re building</h1>
            <p className="az-sub">A paragraph is enough. The more concrete the problem, the customer and the model, the sharper the read.</p>

            <textarea
              className="az-text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. An AI copilot that drafts and files quarterly VAT returns for EU e-commerce sellers. It plugs into Shopify and Stripe, reconciles transactions, and submits to each tax authority. We charge per filing."
            />

            <div
              className={`az-drop${drag ? ' on' : ''}${file ? ' has' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f.name) }}
            >
              <input ref={fileRef} type="file" hidden accept=".pdf,.ppt,.pptx,.key,.doc,.docx,.md,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f.name) }} />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              {file ? <span className="az-drop-file">{file}</span> : <span>Drop a deck or one-pager, or click to browse <i>· PDF, PPT, DOC, optional</i></span>}
            </div>

            <button className="btn btn-primary az-run" disabled={!ready} onClick={run}>
              Run the Trinity engine
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </button>
          </motion.section>
        )}

        {phase === 'running' && (
          <Scanning key="run" onDone={() => setPhase('done')} />
        )}

        {phase === 'done' && (
          <motion.section key="done" className="az-report" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="az-sample">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              Sample report — live scoring connects the engine next
            </div>

            <div className="az-verdict">
              <div>
                <div className="eyebrow">The verdict</div>
                <h1 className="az-h1">{REPORT.verdict}</h1>
                <p className="az-sub">{REPORT.verdictLine}</p>
              </div>
              <div className="rings">
                <ScoreRing label="Desirability" value={REPORT.scores.e} col="#2563eb" delay={0.1} />
                <ScoreRing label="Feasibility" value={REPORT.scores.m} col="#475569" delay={0.22} />
                <ScoreRing label="Viability" value={REPORT.scores.s} col="#d97706" delay={0.34} />
              </div>
            </div>

            <div className="az-grid">
              <div className="az-card">
                <div className="az-kicker">Your stage</div>
                <div className="az-big">{REPORT.stage}</div>
                <p>{REPORT.stageWhy}</p>
              </div>
              <div className="az-card">
                <div className="az-kicker">The right room</div>
                <div className="az-big">{REPORT.archetype}</div>
                <p>{REPORT.archetypeWhy}</p>
              </div>
            </div>

            <div className="az-firms">
              <div className="az-kicker">Named contacts · US & Taiwan</div>
              <div className="firm-list">
                {REPORT.firms.map((f) => (
                  <div className="firm" key={f.n}>
                    <div className="firm-top"><span className="firm-n">{f.n}</span><span className="firm-geo">{f.geo}</span></div>
                    <div className="firm-type">{f.type}</div>
                    <p>{f.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="az-fixes">
              <div className="az-kicker">Top three things to fix</div>
              {REPORT.fixes.map((f, i) => (
                <div className="fix" key={f.h}>
                  <div className="fix-n" style={{ color: f.col }}>{String(i + 1).padStart(2, '0')}</div>
                  <div><h3 style={{ color: f.col }}>{f.h}</h3><p>{f.p}</p></div>
                </div>
              ))}
            </div>

            <div className="az-actions">
              <button className="btn btn-ghost" onClick={reset}>Analyze another idea</button>
              <button className="btn btn-primary" onClick={onBack}>Back to home</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
