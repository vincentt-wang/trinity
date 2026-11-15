import { useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { Nav } from './lib/Nav'
import { urlFor } from './router'
import { TCARDS, TD_CAT, BFACE, type TCard, type BFaceData } from './canonCards'
import { submitIntake, mailtoFallback, IntakeError, PUBLIC_EMAIL } from './intake'

const EARTH = '#2563eb'
const MOON = '#475569'
const SUN = '#d97706'
const EASE = [0.2, 0.7, 0.2, 1] as const
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* Eclipse-stack logo — the Trinity CIS mark (earth / moon / sun on one axis) */
const LOGO = (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill={EARTH} />
    <circle cx="16" cy="13" r="5" fill={MOON} stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill={SUN} />
  </svg>
)
/* Dark-card variant of the mark (cosmic palette, matches the printed deck) */
const CARD_LOGO = (w = 40, h = 43) => (
  <svg viewBox="0 0 32 34" width={w} height={h} aria-hidden>
    <line x1="16" y1="4" x2="16" y2="30" stroke="#67e8f9" strokeWidth=".8" opacity=".35" />
    <circle cx="16" cy="21" r="8" fill="#38bdf8" />
    <circle cx="16" cy="15" r="5" fill="#cbd5e1" stroke="#06060f" strokeWidth="1.4" />
    <circle cx="16" cy="9" r="3" fill="#fbbf24" />
  </svg>
)

/* ⟨⟨amber⟩⟩ + ⟦green⟧ inline highlights → JSX (the Canon's two emphasis colours) */
function hl(s: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /⟨⟨(.+?)⟩⟩|⟦(.+?)⟧/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index))
    if (m[1] !== undefined) out.push(<b key={k++} className="td-hl">{m[1]}</b>)
    else out.push(<b key={k++} className="td-gl">{m[2]}</b>)
    last = re.lastIndex
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

/* punchline → up to 3 balanced lines, broken on CJK / latin clause marks */
function punchLines(s: string): ReactNode {
  s = String(s || '').replace(/[。！？.!]+$/, '')
  let p = s.split(/[，、；,;]/).map((x) => x.trim()).filter(Boolean)
  if (p.length > 3) p = [p[0], p[1], p.slice(2).join(' ')]
  return p.map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ))
}

type L = 'en' | 'zh'
const pileName = (k: string, lang: L) => (lang === 'en' ? TD_CAT[k][1] : TD_CAT[k][0])
const pileColor = (k: string) => TD_CAT[k][2]

/* the printed card back — used for the deck pile and the hero product shot */
function CardBack({ small }: { small?: boolean }) {
  return (
    <div className="cardback">
      {CARD_LOGO(small ? 34 : 46, small ? 36 : 49)}
      <div className="cardback-wm">TRINITY</div>
    </div>
  )
}

/* a small principle-card front for the hero fan (so it isn't five identical backs) */
function MiniFront({ card, lang }: { card: TCard; lang: L }) {
  const col = pileColor(card.k)
  return (
    <div className="mat-hb front" style={{ '--c': col } as CSSProperties}>
      <span className="mat-hb-accent" />
      <div className="mhb-cat">{card.k} · {pileName(card.k, lang)}</div>
      {CARD_LOGO(30, 32)}
      <div className="mhb-cn">{lang === 'en' ? card.cne : card.cn}</div>
      <div className="mhb-wm">TRINITY</div>
    </div>
  )
}

/* the hero: a hand of 60 cards fanning open — backs on the wings, three real fronts in the middle.
   opens wide on load, then fans out even further on hover. */
const FAN_PICK = { s: TCARDS.find((c) => c.k === 'S')!, d: TCARDS.find((c) => c.k === 'D')!, v: TCARDS.find((c) => c.k === 'V')! }
const FAN_BASE = [-36, -18, 0, 18, 36]
const FAN_OPEN = [-56, -28, 0, 28, 56]
function HeroFan({ lang }: { lang: L }) {
  const reduce = REDUCED
  const [open, setOpen] = useState(false)
  const nodes = [
    <div className="mat-hb"><CardBack small /></div>,
    <MiniFront card={FAN_PICK.d} lang={lang} />,
    <MiniFront card={FAN_PICK.s} lang={lang} />,
    <MiniFront card={FAN_PICK.v} lang={lang} />,
    <div className="mat-hb"><CardBack small /></div>,
  ]
  return (
    <div className="mat-herofan" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="mat-halo" aria-hidden />
      {nodes.map((node, i) => {
        const ang = reduce ? FAN_BASE[i] : (open ? FAN_OPEN[i] : FAN_BASE[i])
        return (
          <motion.div
            key={i}
            className="mat-fancard"
            initial={reduce ? { rotate: FAN_BASE[i], opacity: 1 } : { rotate: 0, y: 30, opacity: 0, scale: 0.9 }}
            animate={{ rotate: ang, y: open ? -10 : 0, opacity: 1, scale: open ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 15, delay: reduce ? 0 : 0.1 + i * 0.07 }}
            style={{ zIndex: 6 - Math.abs(FAN_BASE[i]) / 18 } as CSSProperties}
          >
            {node}
          </motion.div>
        )
      })}
    </div>
  )
}

/* the B 版面 (framework visual) — used as the back for cards whose canonical default is B (BFACE) */
function BFaceBack({ c, data, lang }: { c: TCard; data: BFaceData; lang: L }) {
  const en = lang === 'en'
  const col = pileColor(c.k)
  const T = (o?: { zh: string; en: string } | null) => (o ? (en ? o.en || o.zh : o.zh) : '')
  const isGrid = data.type === 'grid'
  return (
    <div className="td-face td-backface" style={{ '--tc': col } as CSSProperties}>
      <div className="td-bhead">
        <span className="td-bid">{c.k}{c.n}</span>
        <span className="td-bcn" style={{ color: col }}>{T(data.title)}</span>
      </div>
      {isGrid ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '4px', margin: '6px 10px 8px' }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gridTemplateRows: '1fr 1fr', gridTemplateAreas: "'prob sol uvp adv cust' 'prob met uvp chan cust'", gap: '4px' }}>
            {['prob', 'sol', 'uvp', 'adv', 'cust', 'met', 'chan'].map((k) => (
              <div key={k} style={{ gridArea: k, border: '1px solid rgba(255,255,255,.16)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2px', fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.15, color: '#d4d9f5' }}>{T(data.cells![k])}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: '20%' }}>
            {['cost', 'rev'].map((k) => (
              <div key={k} style={{ border: '1px solid rgba(255,255,255,.16)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2px', fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.15, color: '#d4d9f5' }}>{T(data.cells![k])}</div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', margin: '2px 12px 4px' }}>
          {data.items!.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,.08)', flex: 1, minHeight: 0 }}>
              <span style={{ flex: 'none', width: '22px', fontSize: '0.66rem', fontWeight: 800, color: col }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#eef1ff', lineHeight: 1.15 }}>{T(it.label)}</span>
                {it.sub && <span style={{ display: 'block', fontSize: '0.66rem', color: '#a9b0d6', lineHeight: 1.15, marginTop: '1px' }}>{T(it.sub)}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
      {data.note && <div style={{ fontSize: '0.62rem', color: col, textAlign: 'center', padding: '1px 10px 2px', lineHeight: 1.3 }}>{T(data.note)}</div>}
      <div className="td-bfoot">
        <span style={{ color: col }}>{c.src}</span>
        <span className="td-wm2">TRINITY</span>
      </div>
    </div>
  )
}

/* the two faces of a dealt card */
function CardFace({ c, lang }: { c: TCard; lang: L }) {
  const en = lang === 'en'
  const col = pileColor(c.k)
  const bface = BFACE[c.id]
  const blk = (label: string, v: string) =>
    v ? (
      <div className="td-blk">
        <span className="td-bl" style={{ color: col }}>{label}</span>
        <span className="td-bv">{hl(v)}</span>
      </div>
    ) : null
  return (
    <div className="td-inner-faces" style={{ '--tc': col } as CSSProperties}>
      <div className="td-face td-front">
        <div className="td-cat">{c.k} · {pileName(c.k, lang)}</div>
        {CARD_LOGO(40, 43)}
        <div className="td-cn">{en ? c.cne : c.cn}</div>
        <div className="td-gloss">{en ? c.ge : c.g}</div>
        <div className="td-pun">{punchLines(en ? c.pe || c.p : c.p)}</div>
        <div className="td-wm">TRINITY</div>
      </div>
      {bface ? (
        <BFaceBack c={c} data={bface} lang={lang} />
      ) : (
        <div className="td-face td-backface">
          <div className="td-bhead">
            <span className="td-bid">{c.k}{c.n}</span>
            <span className="td-bcn" style={{ color: col }}>{en ? c.cne : c.cn}</span>
          </div>
          <div className="td-bbody">
            {blk(en ? 'Rule' : '判準', en ? c.cre : c.cr)}
            {blk(en ? 'Example' : '範例', en ? c.cee : c.ce)}
            {blk(en ? 'Trap' : '常見誤解', en ? c.cae : c.ca)}
            {blk(en ? 'Do' : '動手', en ? c.cde : c.cd)}
          </div>
          <div className="td-bfoot">
            <span style={{ color: col }}>{c.src}</span>
            <span className="td-wm2">TRINITY</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── draw engine: deck → draw → reveal → draw again ── */
function DeckDraw({ lang, cta }: { lang: L; cta: { draw: string; reveal: string; again: string; empty: string } }) {
  const [cur, setCur] = useState<TCard | null>(null)
  const [drawn, setDrawn] = useState<string[]>([])
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [seq, setSeq] = useState(0)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const tiltRef = useRef<HTMLDivElement>(null)

  const draw = () => {
    let pool = TCARDS.filter((c) => !drawn.includes(c.id))
    let next = drawn
    if (!pool.length) { pool = TCARDS.slice(); next = [] }
    const c = pool[Math.floor(Math.random() * pool.length)]
    setCur(c); setDrawn([...next, c.id]); setFlipped(!!BFACE[c.id]); setRevealed(false); setSeq((s) => s + 1); setTilt({ rx: 0, ry: 0 })
  }
  const pick = (id: string) => {
    const c = TCARDS.find((x) => x.id === id)
    if (!c) return
    setCur(c); setDrawn((d) => [...d.filter((x) => x !== id), id]); setFlipped(!!BFACE[c.id]); setRevealed(false); setSeq((s) => s + 1); setTilt({ rx: 0, ry: 0 })
  }
  const primary = () => {
    if (!cur) return draw()
    if (!revealed) { setFlipped((f) => !f); setRevealed(true); return }
    return draw()
  }
  const primaryLabel = !cur ? cta.draw : !revealed ? cta.reveal : cta.again

  const onMove = (e: React.MouseEvent) => {
    if (REDUCED || !tiltRef.current) return
    const r = tiltRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 11, ry: px * 13 })
  }
  const onLeave = () => setTilt({ rx: 0, ry: 0 })

  const col = cur ? pileColor(cur.k) : MOON
  const sibs = useMemo(
    () => cur ? TCARDS.filter((x) => x.k === cur.k && x.id !== cur.id)
      .sort((a, b) => Math.abs(+a.n - +cur.n) - Math.abs(+b.n - +cur.n)).slice(0, 2) : [],
    [cur],
  )
  const pileCount = cur ? TCARDS.filter((x) => x.k === cur.k).length : 0
  const hist = drawn.slice(0, -1).slice(-6).reverse()

  return (
    <div className="td-draw">
      <div className={`td-stage${cur ? ' dealt' : ''}`}>
        {/* deck pile — the physical stack, always the source */}
        <button className="td-deckpile" onClick={draw} aria-label={cta.draw}>
          <div className="td-back td-b3" />
          <div className="td-back td-b2" />
          <div className="td-back td-b1">
            <CardBack />
            <div className="td-back-count">{TCARDS.length - drawn.length}</div>
          </div>
        </button>

        {/* dealt card — key=seq replays the deal on each draw */}
        {cur && (
          <div key={seq} className="td-flip deal" style={{ '--tc': col } as CSSProperties}>
            <div
              ref={tiltRef}
              className="td-tilt"
              style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onClick={() => { setFlipped((f) => !f); setRevealed(true) }}
            >
              <div className={`td-inner-faces${flipped ? ' flipped' : ''}`}>
                <CardFace c={cur} lang={lang} />
              </div>
            </div>
          </div>
        )}

        {/* related in the same pile */}
        {cur && (
          <div className="td-rel">
            <div className="td-rel-h" style={{ color: col }}>{cur.k} · {pileName(cur.k, lang)} ×{pileCount}</div>
            {sibs.map((s, i) => (
              <button
                key={s.id}
                className="td-relchip"
                style={{ '--tc': col, animationDelay: `${0.15 + i * 0.12}s` } as CSSProperties}
                onClick={() => pick(s.id)}
              >
                <b>{s.k}{s.n}</b>{lang === 'en' ? s.cne : s.cn}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="td-ctrl">
        <button className="td-btn" onClick={primary}>{primaryLabel}</button>
      </div>

      {/* fixed-height strip so the section frame never changes size */}
      <div className="td-hist">
        {hist.map((id) => {
          const x = TCARDS.find((t) => t.id === id)!
          return (
            <button key={id} className="td-histchip" style={{ '--tc': pileColor(x.k) } as CSSProperties} onClick={() => pick(id)}>
              <b>{x.k}{x.n}</b>{lang === 'en' ? x.cne : x.cn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── page copy ── */
type Copy = {
  back: string; badge: string; title: string; sub: string; tagline: string
  share: string; shareCopied: string
  drawH: string; drawSub: string
  cta: { draw: string; reveal: string; again: string; empty: string }
  whatH: string; what: { t: string; d: string }[]
  pilesH: string; pilesSub: string
  inH: string; incl: { t: string; d: string }[]
  priceH: string; priceBig: string; priceNote: string; notify: string; notifyNote: string
  sending: string; sentH: string; sentBody: string; sentNoMail: string
  errH: string; errP: string; errRetry: string; errMail: string; disc: string
}
const COPY: Record<L, Copy> = {
  zh: {
    back: '首頁',
    badge: '即將開放',
    title: '創業原則卡',
    sub: 'Innovation Trinity · 60 張原則卡',
    tagline: '把 300 頁的創業工作坊，蒸餾成 60 張你隨手能抽的原則卡。',
    share: '分享這頁連結',
    shareCopied: '已複製連結',
    drawH: '抽一張，讓原則說話',
    drawSub: '腦力激盪卡住的時候抽一張，用它的判準對照你手上的問題。翻到背面，看判準、範例、常見誤解與動手練習。',
    cta: { draw: '抽一張', reveal: '翻到背面', again: '再抽一張', empty: '從牌堆抽一張' },
    whatH: '這是什麼',
    what: [
      { t: '一副判斷卡', d: 'D 欲求性、F 可行性、V 存續性，加上策略與成長，五疊共 60 張。抽一張對照你的專案，或攤成三元牌陣做健檢。' },
      { t: '每張都雙面', d: '正面一句招牌原則；背面是判準、真實範例、常見誤解、動手練習。不是名言卡，是逼你回答問題的工具。' },
      { t: '同一套大腦', d: '和工作坊、AI 評案引擎共用同一條 DFV 脊椎。你在課堂學的、丟進引擎評的，都是這 60 張。' },
    ],
    pilesH: '五疊 · 60 張',
    pilesSub: '牌序＝五疊依序 S → D → F → V → G；數字＝課程教學順序。',
    inH: '內含',
    incl: [
      { t: '60 張實體原則卡', d: '63×88mm 撲克牌尺寸，雙面印製' },
      { t: '教材 Reader', d: '可印成 PDF 的隨行手冊' },
      { t: '使用說明', d: 'facilitator 牌陣與判準速查' },
      { t: 'AI 教練 Gem', d: '用同一套判準自評你的案子' },
    ],
    priceH: '目前不收費',
    priceBig: '只收等候名單',
    priceNote: '只留 email，不收錢，名單也不會自動變成訂單。滿 10 人才送印；送印前先寄信告訴你價格與內含物，到時再決定要不要買。',
    notify: '加入等候名單',
    notifyNote: '只用來通知這副卡，不寄其他東西。送出後會收到一封確認信。',
    sending: '送出中…',
    sentH: '已加入等候名單，編號 {id}',
    sentBody: '確認信已寄到你的信箱。滿 10 人開始製作，製作前會先寄信問你要不要買。',
    sentNoMail: '已存進名單，但確認信沒寄出去。請記下編號；滿 10 人前會再寄信給你。',
    errH: '沒送出。',
    errP: '請再試一次；還是不行的話，改寄 email 到 ' + PUBLIC_EMAIL + '，寫「原則卡等候名單」就好。',
    errRetry: '再試一次',
    errMail: '改用 email',
    disc: '這是預告頁，尚未正式開賣，目前不收任何費用。',
  },
  en: {
    back: 'Home',
    badge: 'Coming Soon',
    title: 'The Principle Deck',
    sub: 'Innovation Trinity · 60 Principle Cards',
    tagline: '300 pages of the venture workshop, distilled into 60 principle cards you can pull anytime.',
    share: 'Share this page',
    shareCopied: 'Link copied',
    drawH: 'Pull a card, let the principle speak',
    drawSub: 'Stuck in a brainstorm? Pull one and test its criterion against the problem in front of you. Flip it over for the rule, a real example, the common misread, and a hands-on drill.',
    cta: { draw: 'Draw a card', reveal: 'Flip it over', again: 'Draw another', empty: 'Draw from the deck' },
    whatH: 'What it is',
    what: [
      { t: 'A deck for judgment', d: 'Desirability, Feasibility, Viability, plus strategy and growth: five piles, 60 cards. Pull one against your project, or lay a Trinity spread for a health check.' },
      { t: 'Two-sided, every card', d: 'Front: one signature principle. Back: the pass criterion, a real example, the common misread, and a hands-on drill. Not quote cards, tools that make you answer.' },
      { t: 'Same brain', d: 'Same DFV spine as the workshop and the AI screening engine. What you learn in class and what you run through the engine are these same 60 cards.' },
    ],
    pilesH: 'Five piles · 60 cards',
    pilesSub: 'Order = five piles S → D → F → V → G; the number is the teaching sequence.',
    inH: "What's inside",
    incl: [
      { t: '60 physical cards', d: '63×88mm poker size, printed both sides' },
      { t: 'Reader handbook', d: 'A companion you can print to PDF' },
      { t: 'Facilitator manual', d: 'Spreads and a criteria cheat-sheet' },
      { t: 'AI coach Gem', d: 'Self-check your case on the same criteria' },
    ],
    priceH: 'Not charging yet',
    priceBig: 'Waitlist only',
    priceNote: 'Email only, no money, and the list does not turn into an order by itself. The deck goes to print once 10 people are on it; before that you get the price and contents by email and decide then.',
    notify: 'Join the waitlist',
    notifyNote: 'Only about this deck, nothing else. You get a confirmation email right away.',
    sending: 'Sending…',
    sentH: 'You are on the list, id {id}',
    sentBody: 'A confirmation is in your inbox. Production starts at 10 people; you hear from Vincent before that and decide whether to buy.',
    sentNoMail: 'Stored on the list, but the confirmation email did not go out. Keep the id; you hear from Vincent before production starts.',
    errH: 'Not sent.',
    errP: 'Try again; if it still fails, email ' + PUBLIC_EMAIL + ' with the words "Principle Deck waitlist".',
    errRetry: 'Try again',
    errMail: 'Email instead',
    disc: 'This is a preview page. Not on sale, nothing is charged.',
  },
}

const PILES = ['S', 'D', 'F', 'V', 'G']

export default function Materials() {
  const { lang } = useLang()
  const c = COPY[lang]
  // always open at the top, and jump back to the top if the deck nav is re-clicked
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = lang === 'zh' ? '創業原則卡 · Trinity Check' : 'The Principle Deck · Trinity Check'
    const h = (e: Event) => { if ((e as CustomEvent).detail === 'materials') window.scrollTo(0, 0) }
    window.addEventListener('trinity:navview', h)
    return () => window.removeEventListener('trinity:navview', h)
  }, [lang])
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sentId, setSentId] = useState('')
  const [sentMail, setSentMail] = useState('')
  const [errCode, setErrCode] = useState('')
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = urlFor('materials')
    try {
      if (navigator.share) { await navigator.share({ title: c.title, url }); return }
      await navigator.clipboard.writeText(url)
    } catch { /* clipboard blocked — the button still flips to confirm */ }
    setCopied(true); window.setTimeout(() => setCopied(false), 2200)
  }
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  // One call: the intake Worker stores the email (KV, deduped), emails the person a
  // confirmation and emails Vincent. Failure is shown, never swallowed.
  const join = async () => {
    if (!valid || state === 'sending') return
    setState('sending'); setErrCode('')
    try {
      const r = await submitIntake('waitlist', lang, { email: email.trim() })
      setSentId(r.id); setSentMail(r.mail.confirm); setState('sent')
    } catch (e) {
      setErrCode(e instanceof IntakeError ? e.code : 'network'); setState('error')
    }
  }

  return (
    <div className="mat">
      <Nav sub />

      <div className="wrap mat-wrap">
        {/* Hero — product shot: a lit fan of card backs is the thesis */}
        <motion.div className="mat-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <HeroFan lang={lang} />
          <div className="mat-badge">{c.badge}</div>
          <h1 className="mat-title">{c.title}</h1>
          <div className="mat-sub">{LOGO}<span>{c.sub}</span></div>
          <p className="mat-tag">{c.tagline}</p>
        </motion.div>

        {/* Draw — the interactive lightbox */}
        <section className="mat-stage">
          <div className="mat-stage-glow" aria-hidden />
          <h2 className="mat-stage-h">{c.drawH}</h2>
          <p className="mat-stage-sub">{c.drawSub}</p>
          <DeckDraw lang={lang} cta={c.cta} />
        </section>

        {/* What it is */}
        <section className="mat-sec">
          <h2 className="mat-h2">{c.whatH}</h2>
          <div className="mat-grid3">
            {c.what.map((w) => (
              <div className="mat-card" key={w.t}>
                <div className="mat-card-t">{w.t}</div>
                <p className="mat-card-d">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Piles — the five suits legend */}
        <section className="mat-sec">
          <h2 className="mat-h2">{c.pilesH}</h2>
          <p className="mat-sec-sub">{c.pilesSub}</p>
          <div className="mat-piles">
            {PILES.map((k) => (
              <div className="mat-pile" key={k} style={{ '--c': pileColor(k) } as CSSProperties}>
                <span className="mat-pk">{k}</span>
                <span className="mat-pn">{pileName(k, lang)}</span>
                <span className="mat-pcount">×{TCARDS.filter((x) => x.k === k).length}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What's inside */}
        <section className="mat-sec">
          <h2 className="mat-h2">{c.inH}</h2>
          <div className="mat-incl">
            {c.incl.map((it) => (
              <div className="mat-inc" key={it.t}>
                <svg className="mat-tick" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={EARTH} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                <div>
                  <div className="mat-inc-t">{it.t}</div>
                  <div className="mat-inc-d">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Price / waitlist */}
        <section className="mat-price">
          <div className="mat-price-h">{c.priceH}</div>
          <div className="mat-price-big">{c.priceBig}</div>
          <p className="mat-price-note">{c.priceNote}</p>
          {state === 'sent' ? (
            <motion.div className="mat-sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0e9f6e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              <div>
                <div className="mat-sent-h">{c.sentH.replace('{id}', sentId)}</div>
                <div className="mat-sent-b">{sentMail === 'sent' ? c.sentBody : c.sentNoMail}</div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mat-notify">
                <input className="mat-input" type="email" placeholder="you@email.com" aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') join() }} disabled={state === 'sending'} />
                <button className="btn btn-primary" disabled={!valid || state === 'sending'} onClick={join} aria-busy={state === 'sending'}>{state === 'sending' ? c.sending : c.notify}</button>
              </div>
              <div className="mat-cta-note">{c.notifyNote}</div>
              {state === 'error' && (
                <div className="mat-err" role="alert">
                  <b>{c.errH}</b> {c.errP}
                  <div className="mat-err-actions">
                    <button className="btn btn-primary" onClick={join}>{c.errRetry}</button>
                    <a className="btn btn-ghost" href={mailtoFallback(lang === 'zh' ? '原則卡等候名單' : 'Principle Deck waitlist', [email])}>{c.errMail}</a>
                  </div>
                  <span className="mat-err-code">{errCode}</span>
                </div>
              )}
            </>
          )}
        </section>

        <div className="mat-share-row">
          <button className="mat-share" onClick={share}>
            {copied ? (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" /><path d="M16 6l-4-4-4 4M12 2v13" /></svg>
            )}
            {copied ? c.shareCopied : c.share}
          </button>
        </div>

        <div className="mat-disc">{c.disc}</div>
      </div>
    </div>
  )
}
