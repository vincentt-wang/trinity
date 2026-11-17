import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { submitIntake, mailtoFallback, IntakeError, PUBLIC_EMAIL } from './intake'

/**
 * Course-materials waitlist (261117 PM), opened from the footer.
 * name + email + at least one topic, an optional line. POST /api/intake kind=course;
 * the worker emails Vincent (with the source s) and sends the submitter a confirmation.
 */
const T = {
  en: {
    eyebrow: 'Course materials', h: 'Get on the list',
    lead: 'The materials are still being put together. Leave your details and Vincent will write to you first, with what is inside and the price. Nothing is charged.',
    name: 'Name', email: 'Email', topics: 'Topics you want', topicsNote: 'Pick one or more.',
    note: 'Anything else', optional: 'optional', notePh: 'What you are working on, or what you hope to learn.',
    opts: ['Strategic thinking', 'Desirability', 'Feasibility', 'Viability', 'Growth mindset'],
    send: 'Join the list', sending: 'Sending…', close: 'Close',
    okH: 'You are on the list', okP: (id: string, mailed: boolean) => mailed ? `A confirmation is on its way to your inbox. Your id is ${id}.` : `Saved, id ${id}. The confirmation email did not go out, so keep this id.`,
    errMissing: 'Fill in your name, a valid email and at least one topic.',
    err: 'That did not go through. Try again, or send it by email.', errMail: 'Send by email',
  },
  zh: {
    eyebrow: '教材購買', h: '加入等候名單',
    lead: '教材還在整理中。留下資料，準備好時 Vincent 會先寫信告訴你內容與價格，現在不收費。',
    name: '名字', email: 'Email', topics: '想要的主題', topicsNote: '可以選多個。',
    note: '想說的話', optional: '選填', notePh: '你在做什麼，或想學到什麼。',
    opts: ['策略思維', '欲求性', '可行性', '存續性', '成長思維'],
    send: '加入名單', sending: '送出中…', close: '關閉',
    okH: '已加入名單', okP: (id: string, mailed: boolean) => mailed ? `確認信已寄到你的信箱，編號 ${id}。` : `已收到，編號 ${id}。確認信沒有寄出，請記下這個編號。`,
    errMissing: '請填名字、有效的 Email，並至少選一個主題。',
    err: '沒有送出成功，請再試一次，或改用 Email 寄給我們。', errMail: '改用 Email',
  },
}
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function CourseWaitlist({ onClose }: { onClose: () => void }) {
  const { lang } = useLang()
  const t = T[lang]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topics, setTopics] = useState<number[]>([])
  const [note, setNote] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error' | 'missing'>('idle')
  const [res, setRes] = useState<{ id: string; mailed: boolean } | null>(null)
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    first.current?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev }
  }, [onClose])

  const topicText = () => topics.slice().sort().map((i) => t.opts[i]).join(', ')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || !topics.length) { setState('missing'); return }
    setState('sending')
    try {
      const r = await submitIntake('course', lang, { name: name.trim(), email: email.trim(), topics: topicText(), note: note.trim() })
      setRes({ id: r.id, mailed: r.mail.confirm === 'sent' })
      setState('ok')
    } catch (err) {
      void (err instanceof IntakeError)
      setState('error')
    }
  }

  return (
    <motion.div className="cw-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.div className="cw" role="dialog" aria-modal="true" aria-labelledby="cw-h"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}>
        <button type="button" className="cw-x" onClick={onClose} aria-label={t.close}>×</button>
        <div className="eyebrow">{t.eyebrow}</div>
        {state === 'ok' && res ? (
          <div className="cw-ok">
            <h2 id="cw-h">{t.okH}</h2>
            <p>{t.okP(res.id, res.mailed)}</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>{t.close}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="cw-h">{t.h}</h2>
            <p className="cw-lead">{t.lead}</p>
            <div className="cw-row">
              <label className="cw-f"><span>{t.name}</span><input ref={first} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} required /></label>
              <label className="cw-f"><span>{t.email}</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={200} required /></label>
            </div>
            <fieldset className="cw-f cw-topics">
              <legend>{t.topics}<small>{t.topicsNote}</small></legend>
              <div className="cw-chips">
                {t.opts.map((o, i) => (
                  <button type="button" key={o} className={`cw-chip${topics.includes(i) ? ' on' : ''}`} aria-pressed={topics.includes(i)}
                    onClick={() => setTopics((x) => x.includes(i) ? x.filter((y) => y !== i) : [...x, i])}>{o}</button>
                ))}
              </div>
            </fieldset>
            <label className="cw-f"><span>{t.note}<small>{t.optional}</small></span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePh} maxLength={600} /></label>
            {state === 'missing' && <p className="cw-err">{t.errMissing}</p>}
            {state === 'error' && (
              <p className="cw-err">{t.err} <a href={mailtoFallback(lang === 'zh' ? '教材等候名單' : 'Course materials waitlist', [name, email, topicText(), note])}>{t.errMail}</a> · {PUBLIC_EMAIL}</p>
            )}
            <button type="submit" className="btn btn-primary cw-send" disabled={state === 'sending'} data-cta="foot:course-waitlist">{state === 'sending' ? t.sending : t.send}</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
