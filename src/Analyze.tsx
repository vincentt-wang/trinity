import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { CountUp } from './lib/anim'
import { Aurora } from './lib/Aurora'
import { HeroNetwork } from './lib/HeroNetwork'
import { useLang } from './i18n'
import { Nav } from './lib/Nav'
import { COPY } from './copy'
import { bumpAnalyzed, postAnalyzed } from './stats'
import { submitIntake, mailtoFallback, IntakeError, PUBLIC_EMAIL, CONTACT_URL, type MailStatus } from './intake'
import { routeTo } from './router'

const EASE = [0.2, 0.7, 0.2, 1] as const
const STAG = { hide: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } } }
const ITEM = { hide: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }

type Phase = 'intro' | 'form' | 'done'
type Plan = 'free' | 'report' | 'report-meet'
const PLANS: Plan[] = ['free', 'report', 'report-meet']

const CHECK = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
)
const ARROW = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>

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

/** Ambient backdrop: constellation on intro/done, faint aurora on the form. */
function AzAmbient({ phase }: { phase: Phase }) {
  return (
    <div className="az-amb" aria-hidden>
      <motion.div className="az-amb-aurora" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: EASE }}>
        <div className={`az-amb-aurora-in${phase === 'form' ? ' faint' : ''}`}>
          <Aurora tone="cool" />
        </div>
      </motion.div>
      <AnimatePresence>
        {phase !== 'form' && (
          <motion.div key="amb-soft" className="az-amb-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            <HeroNetwork variant="ambient" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// The intro shows what a finished read looks like. These three numbers are a labelled
// sample (copy.analyze.input.intro.previewTitle / previewNote); nothing on the page scores anyone.
const COLS = { e: '#2563eb', m: '#475569', s: '#d97706' } as const
const SAMPLE = { e: 72, m: 64, s: 58 } as const
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

/** ?plan=report | ?plan=meet preselects the plan (product cards on the home page link here). */
function planFromUrl(): Plan {
  const p = new URLSearchParams(location.search).get('plan')
  if (p === 'report') return 'report'
  if (p === 'meet' || p === 'report-meet') return 'report-meet'
  return 'free'
}

type Result = { id: string; mail: MailStatus; email: string; company: string; oneLine: string; plan: Plan; track: 'a' | 'b' }

export default function Analyze({ onBack }: { onBack: () => void }) {
  const { lang } = useLang()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = lang === 'zh' ? '分析你的點子 · Trinity Check' : 'Analyze your idea · Trinity Check'
  }, [lang])
  const c = COPY[lang]
  const a = c.analyze
  const intro = a.input.intro
  const fc = a.input.form
  const done = a.done
  const lens = c.dims.lensMeta
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
  const [plan, setPlan] = useState<Plan>(planFromUrl)
  const [reportLang, setReportLang] = useState<'zh' | 'en'>(lang)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
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

  /** Everything the user typed, with the select answers as the labels they saw. */
  const answers = () => ({
    company: f.company, name: f.name, email: f.email.trim(), website: f.website,
    oneLine: f.oneLine, pain: f.pain, customer: f.customer, evidence: f.evidence,
    solution: f.solution, team: f.team, demo: f.demo, money: f.money,
    metrics: f.metrics.map((v, i) => (v.trim() ? `${fc.metrics[i]}: ${v.trim()}` : '')).filter(Boolean).join(' | '),
    whyNow: f.whyNow,
    model: f.model >= 0 ? fc.models[f.model] : '',
    stage: f.stage >= 0 ? fc.stages[f.stage] : '',
    markets: f.markets.map((i) => fc.markets[i]),
    funding: f.funding >= 0 ? fc.fundings[f.funding] : '',
    deck: f.deck,
    plan,
    reportLang: plan === 'free' ? '' : reportLang,
    consentTrack: track === 'b' ? 'ecosystem' : 'confidential',
  })
  /** Plain-text copy of the answers for the mailto fallback and the copy button. */
  const asLines = () => {
    const an = answers()
    const L: Record<string, string> = {
      company: fc.company.l, name: fc.name.l, email: fc.email.l, website: fc.website.l, oneLine: fc.oneLine.l,
      pain: fc.pain.l, customer: fc.customer.l, evidence: fc.evidence.l, solution: fc.solution.l, team: fc.team.l,
      demo: fc.demo.l, money: fc.money.l, metrics: fc.metricsL, whyNow: fc.whyNow.l, model: fc.modelL, stage: fc.stageL,
      markets: fc.marketsL, funding: fc.fundingL, deck: fc.deck.l, plan: fc.s4, reportLang: fc.reportLangL, consentTrack: intro.tracks.title,
    }
    return Object.entries(an).map(([k, v]) => {
      let val: string = Array.isArray(v) ? v.join(', ') : String(v ?? '')
      if (!val) return ''
      if (k === 'plan') val = `${fc.plans[v as Plan].h} (${fc.plans[v as Plan].price})`
      if (k === 'reportLang') val = fc.reportLangs[v as 'zh' | 'en']
      if (k === 'consentTrack') val = v === 'ecosystem' ? intro.tracks.b.h : intro.tracks.a.h
      return `${L[k]}: ${val}`
    }).filter(Boolean)
  }

  const run = async () => {
    if (!ready || sending) return
    setSending(true); setErr(null)
    try {
      const r = await submitIntake('analyze', lang, answers())
      bumpAnalyzed(); postAnalyzed() // the public counter only moves once a submission is actually stored
      setResult({ id: r.id, mail: r.mail, email: f.email.trim(), company: f.company, oneLine: f.oneLine, plan, track })
      setPhase('done')
    } catch (e) {
      setErr(e instanceof IntakeError ? e.code : 'network')
    } finally { setSending(false) }
  }
  const copyAnswers = async () => {
    try { await navigator.clipboard.writeText(asLines().join('\n')) } catch { /* the user still has the page */ }
    setCopied(true); window.setTimeout(() => setCopied(false), 2200)
  }
  const mailHref = () => mailtoFallback(`Trinity Check · ${f.company || 'my idea'}`, asLines())

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
                {ORDER.map((k, i) => <ScoreRing key={k} label={lens[k].label} value={SAMPLE[k]} col={COLS[k]} delay={0.25 + i * 0.12} />)}
              </div>
              <div className="az-preview-note">{intro.previewNote}</div>
            </motion.div>

            <motion.div className="az-decl" variants={ITEM}>
              <div className="az-decl-h">{intro.declTitle}</div>
              <ul>
                {intro.decl.map((d, i) => (
                  <li key={i}><span className="az-decl-ic">{CHECK}</span><span>{d.replace('{email}', PUBLIC_EMAIL)}</span></li>
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
              {intro.start}{ARROW}
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

            {/* What you want back: free first read, full report, report + Meet. No payment happens here. */}
            <motion.div className="fgroup" variants={ITEM} id="plan">
              <GroupHead t={fc.s4} />
              <div className="ffield">
                <span className="fl">{fc.planL}</span>
                <div className="az-plan-grid" role="radiogroup" aria-label={fc.s4}>
                  {PLANS.map((k) => (
                    <button key={k} type="button" role="radio" aria-checked={plan === k} className={`az-track az-plan${plan === k ? ' on' : ''}`} onClick={() => setPlan(k)}>
                      <span className="az-track-top"><span className="az-track-dot" aria-hidden /><span className="az-track-tag">{fc.plans[k].price}</span></span>
                      <span className="az-track-h">{fc.plans[k].h}</span>
                      <span className="az-track-p">{fc.plans[k].p}</span>
                    </button>
                  ))}
                </div>
              </div>
              {plan !== 'free' && (
                <div className="ffield">
                  <span className="fl">{fc.reportLangL}</span>
                  <div className="fstages">
                    {(['zh', 'en'] as const).map((k) => (
                      <button key={k} type="button" className={`fstage ${reportLang === k ? 'on' : ''}`} onClick={() => setReportLang(k)}>{fc.reportLangs[k]}</button>
                    ))}
                  </div>
                </div>
              )}
              <p className="az-track-note">{fc.planNote}</p>
            </motion.div>

            {err && (
              <motion.div className="az-err" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="az-err-h">{fc.err.h}</div>
                <p>{fc.err.p.replace('{email}', PUBLIC_EMAIL)}</p>
                <div className="az-err-actions">
                  <button className="btn btn-primary" onClick={run} disabled={sending}>{fc.err.retry}</button>
                  <a className="btn btn-ghost" href={mailHref()}>{fc.err.mail}</a>
                  <button className="btn btn-ghost" onClick={copyAnswers}>{copied ? fc.err.copied : fc.err.copy}</button>
                </div>
                <div className="az-err-code">{err}</div>
              </motion.div>
            )}

            <motion.div className="az-formnav" variants={ITEM}>
              <button className="btn btn-ghost" onClick={() => setPhase('intro')} disabled={sending}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                {fc.back}
              </button>
              <button className="btn btn-primary az-run" disabled={!ready || sending} onClick={run} aria-busy={sending}>
                {sending ? fc.sending : fc.run}{!sending && ARROW}
              </button>
            </motion.div>
          </motion.section>
        )}

        {phase === 'done' && result && (
          <motion.section key="done" className="az-stage az-done" variants={STAG} initial="hide" animate="show">
            <motion.div className="eyebrow" variants={ITEM}>{done.eyebrow}</motion.div>
            <motion.h1 className="az-h1" variants={ITEM}>
              {done.h1.split('{id}')[0]}<span className="az-id">{result.id}</span>{done.h1.split('{id}')[1]}
            </motion.h1>
            <motion.p className={`az-sub${result.mail.confirm === 'sent' ? '' : ' az-sub-warn'}`} variants={ITEM}>
              {result.mail.confirm === 'sent' ? done.mailOk.replace('{email}', result.email) : done.mailFail}
            </motion.p>

            <motion.div className="az-trackecho" variants={ITEM}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {result.track === 'a'
                  ? <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
                  : <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" /></>}
              </svg>
              {result.track === 'a' ? intro.tracks.a.h : intro.tracks.b.h}
            </motion.div>

            <motion.div className="az-done-card" variants={ITEM}>
              <div className="az-kicker">{done.nextH}</div>
              <ol className="az-steps">
                {done.steps[result.plan].map((s, i) => <li key={i}><span className="az-step-n">{i + 1}</span><span>{s}</span></li>)}
              </ol>
            </motion.div>

            <motion.div className="az-done-card" variants={ITEM}>
              <div className="az-kicker">{done.summaryH}</div>
              <dl className="az-summary">
                <dt>{fc.company.l}</dt><dd>{result.company}</dd>
                <dt>{fc.oneLine.l}</dt><dd>{result.oneLine}</dd>
                <dt>{done.plan}</dt><dd>{fc.plans[result.plan].h} · {fc.plans[result.plan].price}</dd>
                <dt>{fc.email.l}</dt><dd>{result.email}</dd>
              </dl>
              <p className="fnote">{done.summaryNote}</p>
            </motion.div>

            <motion.div variants={ITEM}>
              <div className="az-kicker az-more-h">{done.moreH}</div>
              <div className="az-more">
                {done.more.map((m) => (
                  m.kind === 'contact'
                    ? <a className="az-more-card" key={m.kind} href={CONTACT_URL} target="_blank" rel="noopener"><b>{m.h}</b><p>{m.p}</p><span className="az-more-cta">{m.cta} ↗</span></a>
                    : <button className="az-more-card" key={m.kind} onClick={() => routeTo(m.kind === 'deck' ? 'materials' : 'insight')}><b>{m.h}</b><p>{m.p}</p><span className="az-more-cta">{m.cta} →</span></button>
                ))}
              </div>
            </motion.div>

            <motion.div className="az-actions" variants={ITEM}>
              <button className="btn btn-primary" onClick={onBack}>{done.home}</button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
