import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'

const WAITLIST_TO = 'vincent@easeai.com.tw'

const EARTH = '#2563eb'
const MOON = '#475569'
const SUN = '#d97706'
const EASE = [0.2, 0.7, 0.2, 1] as const

const LOGO = (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill={EARTH} />
    <circle cx="16" cy="13" r="5" fill={MOON} stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill={SUN} />
  </svg>
)

type Copy = {
  back: string; badge: string; title: string; sub: string; tagline: string
  whatH: string; what: { t: string; d: string }[]
  inH: string; incl: { t: string; d: string }[]
  pilesH: string; piles: { k: string; n: string; c: string }[]
  priceH: string; priceBig: string; priceNote: string; cta: string; ctaNote: string
  disc: string
}

const COPY: Record<'en' | 'zh', Copy> = {
  zh: {
    back: '首頁',
    badge: '即將開放',
    title: '創業原則卡',
    sub: 'Innovation Trinity · 60 張原則卡',
    tagline: '把 300 頁的創業工作坊，蒸餾成 60 張你隨手能抽的原則卡。',
    whatH: '這是什麼',
    what: [
      { t: '一副判斷卡', d: 'D 欲求性、F 可行性、V 存續性，加上策略與成長，五疊共 60 張。抽一張對照你的專案，或攤成三元牌陣做健檢。' },
      { t: '每張都雙面', d: '正面一句招牌原則；背面是判準、真實範例、常見誤解、動手練習。不是名言卡，是逼你回答問題的工具。' },
      { t: '同一套大腦', d: '和工作坊、AI 評案引擎共用同一條 DFV 脊椎。你在課堂學的、丟進引擎評的，都是這 60 張。' },
    ],
    inH: '內含',
    incl: [
      { t: '60 張實體原則卡', d: '63×88mm 撲克牌尺寸，雙面印製' },
      { t: '教材 Reader', d: '可印成 PDF 的隨行手冊' },
      { t: '使用說明', d: 'facilitator 牌陣與判準速查' },
      { t: 'AI 教練 Gem', d: '用同一套判準自評你的案子' },
    ],
    pilesH: '五疊 · 60 張',
    piles: [
      { k: 'S', n: '策略思維', c: '#7c3aed' },
      { k: 'D', n: '欲求性', c: EARTH },
      { k: 'F', n: '可行性', c: MOON },
      { k: 'V', n: '存續性', c: SUN },
      { k: 'G', n: '成長思維', c: '#16a34a' },
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
    title: "The Founder's Deck",
    sub: 'Innovation Trinity · 60 Principle Cards',
    tagline: '300 pages of the venture workshop, distilled into 60 principle cards you can pull anytime.',
    whatH: 'What it is',
    what: [
      { t: 'A deck for judgment', d: 'Desirability, Feasibility, Viability, plus strategy and growth: five piles, 60 cards. Pull one against your project, or lay a Trinity spread for a health check.' },
      { t: 'Two-sided, every card', d: 'Front: one signature principle. Back: the pass criterion, a real example, the common misread, and a hands-on drill. Not quote cards, tools that make you answer.' },
      { t: 'Same brain', d: 'Same DFV spine as the workshop and the AI screening engine. What you learn in class and what you run through the engine are these same 60 cards.' },
    ],
    inH: "What's inside",
    incl: [
      { t: '60 physical cards', d: '63×88mm poker size, printed both sides' },
      { t: 'Reader handbook', d: 'A companion you can print to PDF' },
      { t: 'Facilitator manual', d: 'Spreads and a criteria cheat-sheet' },
      { t: 'AI coach Gem', d: 'Self-check your case on the same criteria' },
    ],
    pilesH: 'Five piles · 60 cards',
    piles: [
      { k: 'S', n: 'Strategy', c: '#7c3aed' },
      { k: 'D', n: 'Desirability', c: EARTH },
      { k: 'F', n: 'Feasibility', c: MOON },
      { k: 'V', n: 'Viability', c: SUN },
      { k: 'G', n: 'Growth', c: '#16a34a' },
    ],
    priceH: 'Price',
    priceBig: 'Announcing soon',
    priceNote: 'The physical deck is in final polish and print. Price and launch date will be announced shortly.',
    cta: 'Notify me',
    ctaNote: "You'll be in the first batch we tell",
    disc: 'This is a preview page. Not yet on sale.',
  },
}

/* a few real principle cards for the draw demo — front punchline + back criterion, per pile */
type DeckCard = { p: string; c: string; f: { en: string; zh: string }; b: { en: string; zh: string } }
const DECK: DeckCard[] = [
  { p: 'S', c: '#7c3aed', f: { en: 'Decide which layer you stand on first.', zh: '先想你站在哪一層。' }, b: { en: 'The app layer defends on experience; the platform sells shovels; infra holds the highest moat.', zh: '應用層守體驗、平台層賣鏟子、基建層門檻最高。' } },
  { p: 'D', c: EARTH, f: { en: 'No rivals usually means no market.', zh: '沒有競爭對手，通常代表沒有市場。' }, b: { en: 'Competitors are proof a market is already validated. Empty means unproven, not free.', zh: '競品，是市場已被驗證的證據。空白通常是沒需求，不是沒人做。' } },
  { p: 'D', c: EARTH, f: { en: 'Painkiller, not vitamin.', zh: '止痛藥，不是維他命。' }, b: { en: 'A real painkiller has people already hacking a workaround and paying for relief.', zh: '真止痛藥，有人已經在拼湊替代方案、掏錢求解。' } },
  { p: 'F', c: MOON, f: { en: 'Founder-market fit is unforkable.', zh: '創辦人市場契合，別人拿不走。' }, b: { en: 'Asymmetric insight, domain depth and long-horizon obsession others cannot copy.', zh: '不對稱洞察、領域積累、長期執念，複製不來。' } },
  { p: 'V', c: SUN, f: { en: 'The North Star is the number that sticks.', zh: '北極星，是留得住的那個數字。' }, b: { en: 'It lives where brand meets customer experience — chase retention, not conversion.', zh: '它落在品牌與顧客體驗的交集：追留存，不追轉換。' } },
  { p: 'G', c: '#16a34a', f: { en: 'Chase LTV, not CAC.', zh: '追 LTV，不是 CAC。' }, b: { en: 'CAC caps out mid-stage; LTV and LTV/CAC are what actually compound.', zh: 'CAC 只到中段就觸頂；LTV 與 LTV/CAC 才會複利。' } },
]

function DeckDraw({ piles, lang }: { piles: { k: string; n: string; c: string }[]; lang: 'en' | 'zh' }) {
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [dealing, setDealing] = useState(false)
  const draw = () => {
    setFlip(false)
    setDealing(true)
    setI((prev) => { let n = prev; while (n === prev && DECK.length > 1) n = Math.floor(Math.random() * DECK.length); return n })
    window.setTimeout(() => setDealing(false), 440)
  }
  const card = DECK[i]
  const pileName = piles.find((p) => p.k === card.p)?.n ?? card.p
  return (
    <div className="mat-deck">
      <div className="mat-draw-stage">
        <div className={`mat-dcard${flip ? ' flip' : ''}${dealing ? ' deal' : ''}`} style={{ '--c': card.c } as CSSProperties} onClick={() => setFlip((f) => !f)}>
          <div className="mat-dcard-in">
            <div className="mat-dcard-face front">
              <div className="mat-dc-top"><span className="mat-dc-chip">{card.p}</span><span className="mat-dc-pile">{pileName}</span></div>
              <div className="mat-dc-punch">{card.f[lang]}</div>
              <svg className="mat-dc-flip" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 3v6h-6" /><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 21v-6h6" /></svg>
            </div>
            <div className="mat-dcard-face back">
              <div className="mat-dc-bl">{lang === 'en' ? 'The criterion' : '判準'}</div>
              <div className="mat-dc-back">{card.b[lang]}</div>
              <svg className="mat-dc-flip" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 3v6h-6" /><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 21v-6h6" /></svg>
            </div>
          </div>
        </div>
      </div>
      <button className="btn btn-primary mat-draw-btn" onClick={draw}>{lang === 'en' ? 'Draw a card' : '抽一張'}</button>
    </div>
  )
}

export default function Materials({ onBack }: { onBack: () => void }) {
  const { lang } = useLang()
  const c = COPY[lang]
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const join = () => {
    if (!valid) return
    // real waitlist: no backend — formsubmit emails Vincent the signup (fire-and-forget)
    fetch(`https://formsubmit.co/ajax/${WAITLIST_TO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: "Founder's Deck · waitlist signup", email, source: 'trinity /materials waitlist' }),
    }).catch(() => {})
    setSent(true)
  }

  return (
    <div className="mat">
      <button className="mat-back" onClick={onBack} aria-label={c.back}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6l-6 6 6 6" /></svg>
        {c.back}
      </button>

      <div className="wrap mat-wrap">
        {/* Hero */}
        <motion.div className="mat-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <div className="mat-badge">{c.badge}</div>
          <div className="mat-logo">{LOGO}</div>
          <h1 className="mat-title">{c.title}</h1>
          <div className="mat-sub">{c.sub}</div>
          <p className="mat-tag">{c.tagline}</p>

          {/* Card fan visual */}
          <div className="mat-fan" aria-hidden>
            {c.piles.map((p, i) => (
              <div key={p.k} className="mat-fcard" style={{ '--c': p.c, '--i': i - 2 } as CSSProperties}>
                <span className="mat-fk" style={{ color: p.c }}>{p.k}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Draw a card demo */}
        <section className="mat-sec mat-deck-sec">
          <h2 className="mat-h2">{lang === 'en' ? 'Pull a card' : '抽一張試試'}</h2>
          <DeckDraw piles={c.piles} lang={lang} />
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
          <div className="mat-piles">
            {c.piles.map((p) => (
              <div className="mat-pile" key={p.k} style={{ '--c': p.c } as CSSProperties}>
                <span className="mat-pk">{p.k}</span>
                <span className="mat-pn">{p.n}</span>
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
