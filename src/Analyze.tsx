import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { CountUp } from './lib/anim'
import { useLang } from './i18n'
import { COPY, DIMENSIONS } from './copy'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

type Phase = 'input' | 'running' | 'done'

const COLS = { e: '#2563eb', m: '#475569', s: '#d97706' } as const
const SCORES = { e: 72, m: 64, s: 58 } as const
const ORDER = ['e', 'm', 's'] as const

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
        <circle ref={ref} cx="65" cy="65" r={R} fill="none" stroke={col} strokeWidth="11" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} transform="rotate(-90 65 65)" />
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
  const { lang } = useLang()
  const c = COPY[lang]
  const [active, setActive] = useState(0)
  const [scanIdx, setScanIdx] = useState(0)

  useEffect(() => {
    const lensMs = 1150
    const timers: ReturnType<typeof setTimeout>[] = []
    ORDER.forEach((_, i) => timers.push(setTimeout(() => setActive(i), i * lensMs)))
    const flick = setInterval(() => setScanIdx((n) => n + 1), 190)
    timers.push(setTimeout(onDone, ORDER.length * lensMs + 500))
    return () => { timers.forEach(clearTimeout); clearInterval(flick) }
  }, [onDone])

  const k = ORDER[active]
  const col = COLS[k]
  const list = DIMENSIONS[k]
  const dim = list[scanIdx % list.length]
  return (
    <motion.div className="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="scan-orb" aria-hidden>
        <svg viewBox="0 0 220 220" width="220" height="220">
          <defs>
            <radialGradient id="scan-core" cx="42%" cy="36%"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#60a5fa" /><stop offset="1" stopColor="#7c3aed" /></radialGradient>
          </defs>
          {[88, 66, 44].map((r, i) => (
            <circle key={r} cx="110" cy="110" r={r} fill="none" stroke={COLS[ORDER[i]]} strokeWidth="2" strokeDasharray="3 7" opacity={active === i ? 0.95 : 0.2}>
              <animateTransform attributeName="transform" type="rotate" from="0 110 110" to={`${i % 2 ? -360 : 360} 110 110`} dur={`${8 + i * 4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <circle cx="110" cy="110" r="26" fill="url(#scan-core)">
            <animate attributeName="r" values="26;30;26" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="scan-tag" style={{ color: col }}>{c.dims.lensMeta[k].label}</div>
      <div className="scan-dim">{lang === 'en' ? dim.en : dim.zh}</div>
      <div className="scan-dots">
        {ORDER.map((key, i) => <span key={key} className={i <= active ? 'on' : ''} style={{ background: i <= active ? COLS[ORDER[i]] : undefined }} />)}
      </div>
      <div className="scan-cap">{c.analyze.scan.caption}</div>
    </motion.div>
  )
}

export default function Analyze({ onBack }: { onBack: () => void }) {
  const { lang, setLang } = useLang()
  const a = COPY[lang].analyze
  const r = a.report
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
        <div className="az-top-right">
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">{lang === 'en' ? '中' : 'EN'}</button>
          <button className="az-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            {a.back}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.section key="in" className="az-stage" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="eyebrow">{a.input.eyebrow}</div>
            <h1 className="az-h1">{a.input.h1}</h1>
            <p className="az-sub">{a.input.sub}</p>

            <textarea className="az-text" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={a.input.placeholder} />

            <div
              className={`az-drop${drag ? ' on' : ''}${file ? ' has' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f.name) }}
            >
              <input ref={fileRef} type="file" hidden accept=".pdf,.ppt,.pptx,.key,.doc,.docx,.md,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f.name) }} />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              {file ? <span className="az-drop-file">{file}</span> : <span>{a.input.dropMain} <i>{a.input.dropHint}</i></span>}
            </div>

            <button className="btn btn-primary az-run" disabled={!ready} onClick={run}>
              {a.input.run}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </button>
          </motion.section>
        )}

        {phase === 'running' && <Scanning key="run" onDone={() => setPhase('done')} />}

        {phase === 'done' && (
          <motion.section key="done" className="az-report" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
            <div className="az-sample">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              {r.sample}
            </div>

            <div className="az-verdict">
              <div>
                <div className="eyebrow">{r.verdictKicker}</div>
                <h1 className="az-h1">{r.verdict}</h1>
                <p className="az-sub">{r.verdictLine}</p>
              </div>
              <div className="rings">
                <ScoreRing label={r.rings[0]} value={SCORES.e} col={COLS.e} delay={0.1} />
                <ScoreRing label={r.rings[1]} value={SCORES.m} col={COLS.m} delay={0.22} />
                <ScoreRing label={r.rings[2]} value={SCORES.s} col={COLS.s} delay={0.34} />
              </div>
            </div>

            <div className="az-grid">
              <div className="az-card">
                <div className="az-kicker">{r.stageKicker}</div>
                <div className="az-big">{r.stage}</div>
                <p>{r.stageWhy}</p>
              </div>
              <div className="az-card">
                <div className="az-kicker">{r.roomKicker}</div>
                <div className="az-big">{r.archetype}</div>
                <p>{r.archetypeWhy}</p>
              </div>
            </div>

            <div className="az-firms">
              <div className="az-kicker">{r.firmsKicker}</div>
              <div className="firm-list">
                {r.firms.map((f) => (
                  <div className="firm" key={f.n}>
                    <div className="firm-top"><span className="firm-n">{f.n}</span><span className="firm-geo">{f.geo}</span></div>
                    <div className="firm-type">{f.type}</div>
                    <p>{f.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="az-fixes">
              <div className="az-kicker">{r.fixesKicker}</div>
              {r.fixes.map((f, i) => (
                <div className="fix" key={f.h}>
                  <div className="fix-n" style={{ color: COLS[f.lens as 'e' | 'm' | 's'] }}>{String(i + 1).padStart(2, '0')}</div>
                  <div><h3 style={{ color: COLS[f.lens as 'e' | 'm' | 's'] }}>{f.h}</h3><p>{f.p}</p></div>
                </div>
              ))}
            </div>

            <div className="az-actions">
              <button className="btn btn-ghost" onClick={reset}>{r.again}</button>
              <button className="btn btn-primary" onClick={onBack}>{r.backHome}</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
