import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { CountUp } from './lib/anim'
import { Aurora } from './lib/Aurora'
import { HeroNetwork } from './lib/HeroNetwork'
import { CelStars } from './lib/Celestial'
import { useLang } from './i18n'
import { Nav } from './lib/Nav'
import { COPY, DIMENSIONS } from './copy'
import { bumpAnalyzed, postAnalyzed } from './stats'

const EASE = [0.2, 0.7, 0.2, 1] as const
const STAG = { hide: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } } }
const ITEM = { hide: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }

type Phase = 'intro' | 'form' | 'running' | 'done'

const CHECK = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
)

/** Form-section heading with a gradient hairline that draws in on scroll. */
function GroupHead({ t }: { t: string }) {
  return (
    <div className="fgroup-h">
      {t}
      <motion.span
        className="fgroup-hair"
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </div>
  )
}

/** Phase-aware ambient backdrop: constellation on intro/done, stars+net while scanning, faint aurora on form. */
function AzAmbient({ phase }: { phase: Phase }) {
  return (
    <div className="az-amb" aria-hidden>
      <motion.div className="az-amb-aurora" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: EASE }}>
        <div className={`az-amb-aurora-in${phase === 'form' ? ' faint' : ''}`}>
          <Aurora tone="cool" />
        </div>
      </motion.div>
      <AnimatePresence>
        {(phase === 'intro' || phase === 'done') && (
          <motion.div key="amb-soft" className="az-amb-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            <HeroNetwork variant="ambient" />
          </motion.div>
        )}
        {phase === 'running' && (
          <motion.div key="amb-scan" className="az-amb-layer az-amb-scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <CelStars />
            <HeroNetwork variant="ambient" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// HITL mini-loop: submissions email here; Vincent runs deal-lens by hand, then automates later.
// Address is base64-encoded so scrapers that regex the bundle for e-mails can't harvest it;
// it is decoded only at submit time. Swap for a formsubmit alias when available for full cover.
const FORM_TO = atob('dmluY2VudEBlYXNlYWkuY29tLnR3')
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
  const { lang } = useLang()
  const a = COPY[lang].analyze
  const r = a.report
  const intro = a.input.intro
  const fc = a.input.form
  const [phase, setPhase] = useState<Phase>('intro')
  const [f, setF] = useState({
    company: '', name: '', email: '', website: '',
    oneLine: '', pain: '', solution: '', customer: '',
    evidence: '', team: '', demo: '', money: '', whyNow: '',
    metrics: ['', '', '', '', '', ''],
    model: -1, stage: -1, markets: [] as number[], funding: -1, deck: '',
  })
  const [agree, setAgree] = useState(false)
  const [track, setTrack] = useState<'a' | 'b'>('a')
  const upd = (k: 'company' | 'name' | 'email' | 'website' | 'oneLine' | 'pain' | 'solution' | 'customer' | 'deck' | 'evidence' | 'team' | 'demo' | 'money' | 'whyNow') =>
    (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))
  const updMetric = (i: number) => (e: { target: { value: string } }) =>
    setF((s) => ({ ...s, metrics: s.metrics.map((m, j) => (j === i ? e.target.value : m)) }))
  /* textareas grow with content so long answers never scroll inside a small box */
  const grow = (e: { currentTarget: HTMLTextAreaElement }) => {
    const t = e.currentTarget
    t.style.height = 'auto'
    t.style.height = t.scrollHeight + 2 + 'px'
  }
  const toggleMarket = (i: number) => setF((s) => ({ ...s, markets: s.markets.includes(i) ? s.markets.filter((x) => x !== i) : [...s.markets, i] }))
  const ready = Boolean(
    f.company.trim() && f.name.trim() && /\S+@\S+\.\S+/.test(f.email) &&
    f.oneLine.trim().length > 6 && f.pain.trim() && f.solution.trim() && f.customer.trim() &&
    f.model >= 0 && f.stage >= 0 && f.markets.length > 0,
  )

  useEffect(() => { window.scrollTo(0, 0) }, [phase])

  const run = () => {
    if (!ready) return
    // fire-and-forget: route the submission to Vincent so a real hand-made read can be sent back
    try {
      const fd = new FormData()
      fd.append('Company', f.company); fd.append('Name', f.name); fd.append('Email', f.email)
      fd.append('Website', f.website)
      fd.append('One-line', f.oneLine)
      fd.append('Pain', f.pain); fd.append('Solution', f.solution); fd.append('Target customer', f.customer)
      fd.append('Proof of demand', f.evidence)
      fd.append('Why this team', f.team); fd.append('Demo', f.demo)
      fd.append('Revenue model', f.money); fd.append('Why now', f.whyNow)
      fd.append('Key numbers', f.metrics.map((v, i) => (v.trim() ? `${fc.metrics[i]}: ${v.trim()}` : '')).filter(Boolean).join(' | '))
      fd.append('Business model', f.model >= 0 ? fc.models[f.model] : '')
      fd.append('Product stage', f.stage >= 0 ? fc.stages[f.stage] : '')
      fd.append('Target markets', f.markets.map((i) => fc.markets[i]).join(', '))
      fd.append('Funding round', f.funding >= 0 ? fc.fundings[f.funding] : '')
      fd.append('Pitch deck', f.deck)
      fd.append('Consent track', track === 'b' ? 'ecosystem-visibility' : 'confidential-only')
      fd.append('_subject', 'Trinity · new idea to analyze')
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(FORM_TO), { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).catch(() => {})
      bumpAnalyzed() // local fallback: the submitter sees the count tick up even offline
      postAnalyzed() // global live counter (CF Worker + KV), fire-and-forget
    } catch { /* never block the flow */ }
    setPhase('running')
  }
  const reset = () => { setPhase('form') }

  return (
    <div className="az">
      <AzAmbient phase={phase} />
      <Nav sub />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.section key="intro" className="az-stage az-intro" variants={STAG} initial="hide" animate="show" exit={{ opacity: 0, y: -18 }}>
            <motion.div className="eyebrow" variants={ITEM}>{intro.eyebrow}</motion.div>
            <motion.h1 className="az-h1" variants={ITEM}>{intro.h1}</motion.h1>
            <motion.p className="az-sub" variants={ITEM}>{intro.sub}</motion.p>

            <motion.div className="az-preview" variants={ITEM}>
              <div className="az-preview-h">{intro.previewTitle}</div>
              <div className="rings">
                <ScoreRing label={r.rings[0]} value={SCORES.e} col={COLS.e} delay={0.25} />
                <ScoreRing label={r.rings[1]} value={SCORES.m} col={COLS.m} delay={0.37} />
                <ScoreRing label={r.rings[2]} value={SCORES.s} col={COLS.s} delay={0.49} />
              </div>
              <div className="az-preview-note">{intro.previewNote}</div>
            </motion.div>

            <motion.div className="az-decl" variants={ITEM}>
              <div className="az-decl-h">{intro.declTitle}</div>
              <ul>
                {intro.decl.map((d, i) => (
                  <li key={i}><span className="az-decl-ic">{CHECK}</span><span>{d.replace('{email}', FORM_TO)}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="az-tracks" variants={ITEM}>
              <div className="az-decl-h">{intro.tracks.title}</div>
              <p className="az-tracks-sub">{intro.tracks.sub}</p>
              <div className="az-track-grid" role="radiogroup" aria-label={intro.tracks.title}>
                {(['a', 'b'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={track === k}
                    className={`az-track${track === k ? ' on' : ''}`}
                    onClick={() => setTrack(k)}
                  >
                    <span className="az-track-top">
                      <span className="az-track-dot" aria-hidden />
                      <span className="az-track-tag">{intro.tracks[k].tag}</span>
                    </span>
                    <span className="az-track-h">{intro.tracks[k].h}</span>
                    <span className="az-track-p">{intro.tracks[k].p}</span>
                  </button>
                ))}
              </div>
              <p className="az-track-note">{intro.tracks.note}</p>
            </motion.div>

            <motion.label className="az-consent" variants={ITEM}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>{intro.agree}</span>
            </motion.label>

            <motion.div className="az-pricenote" variants={ITEM}>{intro.priceNote}</motion.div>

            <motion.button className="btn btn-primary az-run" variants={ITEM} disabled={!agree} onClick={() => setPhase('form')}>
              {intro.start}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </motion.button>
          </motion.section>
        )}

        {phase === 'form' && (
          <motion.section key="form" className="az-stage az-form" variants={STAG} initial="hide" animate="show" exit={{ opacity: 0, y: -18 }}>
            <motion.div className="eyebrow" variants={ITEM}>{fc.eyebrow}</motion.div>
            <motion.h1 className="az-h1" variants={ITEM}>{fc.h1}</motion.h1>
            <motion.p className="az-sub" variants={ITEM}>{fc.sub}</motion.p>

            <motion.div className="fgroup" variants={ITEM}>
              <GroupHead t={fc.s1} />
              <div className="frow two">
                <label className="ffield"><span className="fl">{fc.company.l}<i>*</i></span><input value={f.company} onChange={upd('company')} placeholder={fc.company.ph} /></label>
                <label className="ffield"><span className="fl">{fc.name.l}<i>*</i></span><input value={f.name} onChange={upd('name')} placeholder={fc.name.ph} /></label>
              </div>
              <div className="frow two">
                <label className="ffield"><span className="fl">{fc.email.l}<i>*</i></span><input type="email" value={f.email} onChange={upd('email')} placeholder={fc.email.ph} /></label>
                <label className="ffield"><span className="fl">{fc.website.l} <em className="opt">{a.input.optional}</em></span><input value={f.website} onChange={upd('website')} placeholder={fc.website.ph} /></label>
              </div>
            </motion.div>

            <motion.div className="fgroup" variants={ITEM}>
              <GroupHead t={fc.s2} />
              <label className="ffield"><span className="fl">{fc.oneLine.l}<i>*</i></span><input value={f.oneLine} onChange={upd('oneLine')} placeholder={fc.oneLine.ph} /></label>
            </motion.div>

            <motion.div className="fgroup flens" variants={ITEM}>
              <div className="lenshead d"><span className="lensdot" /><span className="lensname">{fc.dSec.t}</span><span className="lensq">{fc.dSec.q}</span><span className="lensd">{fc.dSec.d}</span></div>
              <label className="ffield"><span className="fl">{fc.pain.l}<i>*</i></span><textarea value={f.pain} onChange={upd('pain')} onInput={grow} placeholder={fc.pain.ph} /></label>
              <label className="ffield"><span className="fl">{fc.customer.l}<i>*</i></span><textarea value={f.customer} onChange={upd('customer')} onInput={grow} placeholder={fc.customer.ph} /></label>
              <label className="ffield"><span className="fl">{fc.evidence.l} <em className="opt">{a.input.optional}</em></span><textarea value={f.evidence} onChange={upd('evidence')} onInput={grow} placeholder={fc.evidence.ph} /></label>
            </motion.div>

            <motion.div className="fgroup flens" variants={ITEM}>
              <div className="lenshead f"><span className="lensdot" /><span className="lensname">{fc.fSec.t}</span><span className="lensq">{fc.fSec.q}</span><span className="lensd">{fc.fSec.d}</span></div>
              <label className="ffield"><span className="fl">{fc.solution.l}<i>*</i></span><textarea value={f.solution} onChange={upd('solution')} onInput={grow} placeholder={fc.solution.ph} /></label>
              <label className="ffield"><span className="fl">{fc.team.l} <em className="opt">{a.input.optional}</em></span><textarea value={f.team} onChange={upd('team')} onInput={grow} placeholder={fc.team.ph} /></label>
              <label className="ffield"><span className="fl">{fc.demo.l} <em className="opt">{a.input.optional}</em></span><input value={f.demo} onChange={upd('demo')} placeholder={fc.demo.ph} /></label>
            </motion.div>

            <motion.div className="fgroup flens" variants={ITEM}>
              <div className="lenshead v"><span className="lensdot" /><span className="lensname">{fc.vSec.t}</span><span className="lensq">{fc.vSec.q}</span><span className="lensd">{fc.vSec.d}</span></div>
              <label className="ffield"><span className="fl">{fc.money.l} <em className="opt">{a.input.optional}</em></span><textarea value={f.money} onChange={upd('money')} onInput={grow} placeholder={fc.money.ph} /></label>
              <div className="ffield">
                <span className="fl">{fc.metricsL} <em className="opt">{a.input.optional}</em></span>
                <div className="fmetrics">
                  {fc.metrics.map((m, i) => (
                    <label key={i} className="fmetric"><span>{m}</span><input value={f.metrics[i]} onChange={updMetric(i)} placeholder="…" /></label>
                  ))}
                </div>
                <span className="fnote">{fc.metricsNote}</span>
              </div>
              <label className="ffield"><span className="fl">{fc.whyNow.l} <em className="opt">{a.input.optional}</em></span><textarea value={f.whyNow} onChange={upd('whyNow')} onInput={grow} placeholder={fc.whyNow.ph} /></label>
            </motion.div>

            <motion.div className="fgroup" variants={ITEM}>
              <GroupHead t={fc.s3} />
              <div className="ffield">
                <span className="fl">{fc.modelL}<i>*</i></span>
                <div className="fstages">
                  {fc.models.map((s, i) => (
                    <button key={i} type="button" className={`fstage ${f.model === i ? 'on' : ''}`} onClick={() => setF((st) => ({ ...st, model: i }))}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="ffield">
                <span className="fl">{fc.stageL}<i>*</i></span>
                <div className="fstages">
                  {fc.stages.map((s, i) => (
                    <button key={i} type="button" className={`fstage ${f.stage === i ? 'on' : ''}`} onClick={() => setF((st) => ({ ...st, stage: i }))}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="ffield">
                <span className="fl">{fc.marketsL}<i>*</i></span>
                <div className="fstages">
                  {fc.markets.map((s, i) => (
                    <button key={i} type="button" className={`fstage ${f.markets.includes(i) ? 'on' : ''}`} onClick={() => toggleMarket(i)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="ffield">
                <span className="fl">{fc.fundingL} <em className="opt">{a.input.optional}</em></span>
                <div className="fstages">
                  {fc.fundings.map((s, i) => (
                    <button key={i} type="button" className={`fstage ${f.funding === i ? 'on' : ''}`} onClick={() => setF((st) => ({ ...st, funding: st.funding === i ? -1 : i }))}>{s}</button>
                  ))}
                </div>
              </div>
              <label className="ffield"><span className="fl">{fc.deck.l} <em className="opt">{a.input.optional}</em></span><input value={f.deck} onChange={upd('deck')} placeholder={fc.deck.ph} /><span className="fnote">{fc.deckNote}</span></label>
            </motion.div>

            <motion.div className="az-formnav" variants={ITEM}>
              <button className="btn btn-ghost" onClick={() => setPhase('intro')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                {fc.back}
              </button>
              <button className="btn btn-primary az-run" disabled={!ready} onClick={run}>
                {fc.run}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
              </button>
            </motion.div>
          </motion.section>
        )}

        {phase === 'running' && <Scanning key="run" onDone={() => setPhase('done')} />}

        {phase === 'done' && (
          <motion.section key="done" className="az-report" variants={STAG} initial="hide" animate="show">
            <motion.div className="az-sample" variants={ITEM}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></svg>
              {r.sample}
            </motion.div>

            <motion.div className="az-trackecho" variants={ITEM}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {track === 'a'
                  ? <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
                  : <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" /></>}
              </svg>
              {track === 'a' ? r.trackEcho.a : r.trackEcho.b}
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
