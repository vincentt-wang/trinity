import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { CountUp } from './lib/anim'
import { Aurora } from './lib/Aurora'
import { useLang } from './i18n'
import { COPY, DIMENSIONS } from './copy'

const EASE = [0.2, 0.7, 0.2, 1] as const
const STAG = { hide: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } } }
const ITEM = { hide: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

type Phase = 'input' | 'running' | 'done'

// HITL mini-loop: submissions email here; Vincent runs deal-lens by hand, then automates later.
const FORM_TO = 'vincent@easeai.com.tw'
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
  const fc = a.input.form
  const [phase, setPhase] = useState<Phase>('input')
  const [f, setF] = useState({ company: '', name: '', email: '', website: '', stage: 0, oneLine: '', desir: '', feas: '', via: '' })
  const [agree, setAgree] = useState(false)
  const upd = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))
  const ready = Boolean(f.company.trim() && f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.oneLine.trim().length > 6 && agree)

  useEffect(() => { window.scrollTo(0, 0) }, [phase])

  const run = () => {
    if (!ready) return
    // fire-and-forget: route the submission to Vincent so a real read can be sent back
    try {
      const fd = new FormData()
      fd.append('Company', f.company); fd.append('Name', f.name); fd.append('Email', f.email)
      fd.append('Website', f.website); fd.append('Stage', fc.stages[f.stage])
      fd.append('One-line', f.oneLine)
      fd.append('Desirability', f.desir); fd.append('Feasibility', f.feas); fd.append('Viability', f.via)
      fd.append('_subject', 'Trinity · new idea to analyze')
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(FORM_TO), { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).catch(() => {})
    } catch { /* never block the flow */ }
    setPhase('running')
  }
  const reset = () => { setPhase('input') }

  return (
    <div className="az">
      <Aurora tone="cool" />
      <div className="az-top">
        <button className="brand" onClick={onBack}>{LOGO} TRINITY</button>
        <div className="az-top-right">
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">{lang === 'en' ? 'CH' : 'EN'}</button>
          <button className="az-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            {a.back}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.section key="in" className="az-stage az-form" variants={STAG} initial="hide" animate="show" exit={{ opacity: 0, y: -18 }}>
            <motion.div className="eyebrow" variants={ITEM}>{a.input.eyebrow}</motion.div>
            <motion.h1 className="az-h1" variants={ITEM}>{a.input.h1}</motion.h1>
            <motion.p className="az-sub" variants={ITEM}>{a.input.sub}</motion.p>

            <motion.div className="fgroup" variants={ITEM}>
              <div className="fgroup-h">{fc.s1}</div>
              <div className="frow two">
                <label className="ffield"><span className="fl">{fc.company.l}<i>*</i></span><input value={f.company} onChange={upd('company')} placeholder={fc.company.ph} /></label>
                <label className="ffield"><span className="fl">{fc.name.l}<i>*</i></span><input value={f.name} onChange={upd('name')} placeholder={fc.name.ph} /></label>
              </div>
              <div className="frow two">
                <label className="ffield"><span className="fl">{fc.email.l}<i>*</i></span><input type="email" value={f.email} onChange={upd('email')} placeholder={fc.email.ph} /></label>
                <label className="ffield"><span className="fl">{fc.website.l} <em className="opt">{a.input.optional}</em></span><input value={f.website} onChange={upd('website')} placeholder={fc.website.ph} /></label>
              </div>
              <div className="ffield">
                <span className="fl">{fc.stageL}</span>
                <div className="fstages">
                  {fc.stages.map((s, i) => (
                    <button key={i} type="button" className={`fstage ${f.stage === i ? 'on' : ''}`} onClick={() => setF((st) => ({ ...st, stage: i }))}>{s}</button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div className="fgroup" variants={ITEM}>
              <div className="fgroup-h">{fc.s2}</div>
              <label className="ffield"><span className="fl">{fc.oneLine.l}<i>*</i></span><input value={f.oneLine} onChange={upd('oneLine')} placeholder={fc.oneLine.ph} /></label>
            </motion.div>

            <motion.div className="fgroup" variants={ITEM}>
              <div className="fgroup-h">{fc.s3}</div>
              <label className="ffield"><span className="fl"><span className="ldot e" />{fc.desir.l}</span><textarea value={f.desir} onChange={upd('desir')} placeholder={fc.desir.ph} /></label>
              <label className="ffield"><span className="fl"><span className="ldot m" />{fc.feas.l}</span><textarea value={f.feas} onChange={upd('feas')} placeholder={fc.feas.ph} /></label>
              <label className="ffield"><span className="fl"><span className="ldot s" />{fc.via.l}</span><textarea value={f.via} onChange={upd('via')} placeholder={fc.via.ph} /></label>
            </motion.div>

            <motion.label className="az-consent" variants={ITEM}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>{a.input.consent}</span>
            </motion.label>

            <motion.div className="az-pricenote" variants={ITEM}>{a.input.priceNote}</motion.div>

            <motion.button className="btn btn-primary az-run" variants={ITEM} disabled={!ready} onClick={run}>
              {a.input.run}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </motion.button>

            <motion.p className="az-fineprint" variants={ITEM}>{a.input.privacy}</motion.p>
            <motion.p className="az-fineprint" variants={ITEM}>{a.input.disclaimer}</motion.p>
          </motion.section>
        )}

        {phase === 'running' && <Scanning key="run" onDone={() => setPhase('done')} />}

        {phase === 'done' && (
          <motion.section key="done" className="az-report" variants={STAG} initial="hide" animate="show">
            <motion.div className="az-sample" variants={ITEM}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              {r.sample}
            </motion.div>

            <motion.div className="az-verdict" variants={ITEM}>
              <div>
                <div className="eyebrow">{r.verdictKicker}</div>
                <h1 className="az-h1">{r.verdict}</h1>
                <p className="az-sub">{r.verdictLine}</p>
              </div>
              <div className="rings">
                <ScoreRing label={r.rings[0]} value={SCORES.e} col={COLS.e} delay={0.3} />
                <ScoreRing label={r.rings[1]} value={SCORES.m} col={COLS.m} delay={0.42} />
                <ScoreRing label={r.rings[2]} value={SCORES.s} col={COLS.s} delay={0.54} />
              </div>
            </motion.div>

            <motion.div className="az-grid" variants={ITEM}>
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
            </motion.div>

            <motion.div className="az-firms" variants={ITEM}>
              <div className="az-kicker">{r.firmsKicker}</div>
              <p className="az-firms-note">{r.firmsNote}</p>
              <motion.div className="firm-list" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                {r.firms.map((f) => (
                  <motion.div className="firm" key={f.n} variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}>
                    <div className="firm-top"><span className="firm-n">{f.n}</span><span className="firm-geo">{f.geo}</span></div>
                    <div className="firm-type">{f.type}</div>
                    <p>{f.note}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="az-fixes" variants={ITEM}>
              <div className="az-kicker">{r.fixesKicker}</div>
              {r.fixes.map((f, i) => (
                <div className="fix" key={f.h}>
                  <div className="fix-n" style={{ color: COLS[f.lens as 'e' | 'm' | 's'] }}>{String(i + 1).padStart(2, '0')}</div>
                  <div><h3 style={{ color: COLS[f.lens as 'e' | 'm' | 's'] }}>{f.h}</h3><p>{f.p}</p></div>
                </div>
              ))}
            </motion.div>

            <motion.div className="az-actions" variants={ITEM}>
              <button className="btn btn-ghost" onClick={reset}>{r.again}</button>
              <button className="btn btn-primary" onClick={onBack}>{r.backHome}</button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
