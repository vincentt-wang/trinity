import { useMemo, useState, type ReactNode, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { TCARDS, TD_CAT, type TCard } from './canonCards'

const WAITLIST_TO = 'vincent@easeai.com.tw'

const EARTH = '#2563eb'
const MOON = '#475569'
const SUN = '#d97706'
const EASE = [0.2, 0.7, 0.2, 1] as const

/* Eclipse-stack logo — the Trinity CIS mark (earth / moon / sun on one axis) */
const LOGO = (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill={EARTH} />
    <circle cx="16" cy="13" r="5" fill={MOON} stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill={SUN} />
  </svg>
)
/* Dark-card variant of the same mark (cosmic palette, matches the printed deck) */
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

/* ── the card faces ── */
function CardFace({ c, lang }: { c: TCard; lang: L }) {
  const en = lang === 'en'
  const col = pileColor(c.k)
  const blk = (label: string, v: string) =>
    v ? (
      <div className="td-blk">
        <span className="td-bl" style={{ color: col }}>{label}</span>
        <span className="td-bv">{hl(v)}</span>
      </div>
    ) : null
  return (
    <div className="td-inner-faces" style={{ '--tc': col } as CSSProperties}>
      {/* front */}
      <div className="td-face td-front">
        <div className="td-cat">{c.k} · {pileName(c.k, lang)}</div>
        {CARD_LOGO(40, 43)}
        <div className="td-cn">{en ? c.cne : c.cn}</div>
        <div className="td-pun">{punchLines(en ? c.pe || c.p : c.p)}</div>
        <div className="td-wm">TRINITY</div>
      </div>
      {/* back */}
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
    </div>
  )
}

/* ── draw engine (ports the workshop s_trinity_draw) ── */
function DeckDraw({ lang }: { lang: L }) {
  const first = useMemo(() => TCARDS[Math.floor(Math.random() * TCARDS.length)], [])
  const [cur, setCur] = useState<TCard>(first)
  const [drawn, setDrawn] = useState<string[]>([first.id])
  const [flipped, setFlipped] = useState(false)
  const [seq, setSeq] = useState(0)

  const draw = () => {
    let pool = TCARDS.filter((c) => !drawn.includes(c.id))
    let next = drawn
    if (!pool.length) { pool = TCARDS.slice(); next = [] }
    const c = pool[Math.floor(Math.random() * pool.length)]
    setCur(c); setDrawn([...next, c.id]); setFlipped(false); setSeq((s) => s + 1)
  }
  const pick = (id: string) => {
    const c = TCARDS.find((x) => x.id === id)
    if (!c) return
    setCur(c); setDrawn((d) => [...d.filter((x) => x !== id), id]); setFlipped(false); setSeq((s) => s + 1)
  }

  const col = pileColor(cur.k)
  const sibs = useMemo(
    () => TCARDS.filter((x) => x.k === cur.k && x.id !== cur.id)
      .sort((a, b) => Math.abs(+a.n - +cur.n) - Math.abs(+b.n - +cur.n)).slice(0, 2),
    [cur],
  )
  const pileCount = TCARDS.filter((x) => x.k === cur.k).length
  const hist = drawn.slice(0, -1).slice(-8).reverse()

  return (
    <div className="td-draw">
      <div className="td-stage">
        {/* deck pile */}
        <button className="td-deckpile" onClick={draw} aria-label={lang === 'en' ? 'Draw a card' : '抽卡'}>
          <div className="td-back td-b3" />
          <div className="td-back td-b2" />
          <div className="td-back td-b1">
            {CARD_LOGO(44, 47)}
            <div className="td-back-wm">TRINITY</div>
            <div className="td-back-count">{TCARDS.length - drawn.length}</div>
          </div>
        </button>

        {/* dealt card — key=seq replays the deal animation on each draw */}
        <div key={seq} className={`td-flip deal${flipped ? ' on' : ''}`} onClick={() => setFlipped((f) => !f)}>
          <CardFace c={cur} lang={lang} />
        </div>

        {/* related in the same pile */}
        <div className="td-rel">
          <div className="td-rel-h" style={{ color: col }}>
            {cur.k} · {pileName(cur.k, lang)} ×{pileCount}
          </div>
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
      </div>

      <div className="td-ctrl">
        <button className="td-btn" onClick={draw}>{lang === 'en' ? 'Draw a card' : '隨機抽卡'}</button>
      </div>

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
  drawH: string; drawSub: string
  whatH: string; what: { t: string; d: string }[]
  pilesH: string; pilesSub: string
  inH: string; incl: { t: string; d: string }[]
  priceH: string; priceBig: string; priceNote: string; cta: string; ctaNote: string
  disc: string
}
const COPY: Record<L, Copy> = {
  zh: {
    back: '首頁',
    badge: '即將開放',
    title: '創業原則卡',
    sub: 'Innovation Trinity · 60 張原則卡',
    tagline: '把 300 頁的創業工作坊，蒸餾成 60 張你隨手能抽的原則卡。',
    drawH: '抽一張，讓原則說話',
    drawSub: '腦力激盪卡住的時候抽一張，用它的判準對照你手上的問題。點卡片翻到背面，看判準、範例、常見誤解與動手練習。',
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
    priceH: '定價',
    priceBig: '即將公布',
    priceNote: '實體卡牌正在最後打磨與印製，定價與開賣時間即將公布。',
    cta: '通知我',
    ctaNote: '開賣時第一批通知你',
    disc: '這是預告頁，尚未正式開賣。',
  },
  en: {
    back: 'Home',
    badge: 'Coming Soon',
    title: 'The Principle Deck',
    sub: 'Innovation Trinity · 60 Principle Cards',
    tagline: '300 pages of the venture workshop, distilled into 60 principle cards you can pull anytime.',
    drawH: 'Pull a card, let the principle speak',
    drawSub: 'Stuck in a brainstorm? Pull one and test its criterion against the problem in front of you. Tap the card to flip it — rule, example, common misread, and a hands-on drill.',
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
    priceH: 'Price',
    priceBig: 'Announcing soon',
    priceNote: 'The physical deck is in final polish and print. Price and launch date will be announced shortly.',
    cta: 'Notify me',
    ctaNote: "You'll be in the first batch we tell",
    disc: 'This is a preview page. Not yet on sale.',
  },
}

const PILES = ['S', 'D', 'F', 'V', 'G']

export default function Materials({ onBack }: { onBack: () => void }) {
  const { lang, setLang } = useLang()
  const c = COPY[lang]
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const join = () => {
    if (!valid) return
    fetch(`https://formsubmit.co/ajax/${WAITLIST_TO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: 'Principle Deck · waitlist signup', email, source: 'trinity /materials waitlist' }),
    }).catch(() => {})
    setSent(true)
  }

  return (
    <div className="mat">
      <button className="mat-back" onClick={onBack} aria-label={c.back}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6l-6 6 6 6" /></svg>
        {c.back}
      </button>
      <button className="mat-lang" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">{lang === 'en' ? 'CH' : 'EN'}</button>

      <div className="wrap mat-wrap">
        {/* Hero */}
        <motion.div className="mat-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <div className="mat-badge">{c.badge}</div>
          <div className="mat-logo">{LOGO}</div>
          <h1 className="mat-title">{c.title}</h1>
          <div className="mat-sub">{c.sub}</div>
          <p className="mat-tag">{c.tagline}</p>
        </motion.div>

        {/* Draw a card — the star, on a dark cosmic stage so the deck's CIS reads true */}
        <section className="mat-stage">
          <div className="mat-stage-glow" aria-hidden />
          <h2 className="mat-stage-h">{c.drawH}</h2>
          <p className="mat-stage-sub">{c.drawSub}</p>
          <DeckDraw lang={lang} />
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

        {/* Piles */}
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

        {/* Price / coming soon */}
        <section className="mat-price">
          <div className="mat-price-h">{c.priceH}</div>
          <div className="mat-price-big">{c.priceBig}</div>
          <p className="mat-price-note">{c.priceNote}</p>
          {sent ? (
            <motion.div className="mat-sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0e9f6e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              <span>{lang === 'en' ? "You're on the list — we'll email you first when it opens." : '你已在名單上，開賣第一時間寄信通知你。'}</span>
            </motion.div>
          ) : (
            <>
              <div className="mat-notify">
                <input className="mat-input" type="email" placeholder="you@email.com" aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') join() }} />
                <button className="btn btn-primary" disabled={!valid} onClick={join}>{c.cta}</button>
              </div>
              <div className="mat-cta-note">{c.ctaNote}</div>
            </>
          )}
        </section>

        <div className="mat-disc">{c.disc}</div>
      </div>
    </div>
  )
}
