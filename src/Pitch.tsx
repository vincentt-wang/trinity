import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { getLenis } from './lib/useLenis'

/* ============================================================================
 * Hidden investor pitch: an easter-egg overlay opened from the hero eyebrow.
 * Product + strategy only. No prices, fees, raise amounts, valuation or
 * sensitive financials. Renders in the app's own light Sui CIS + tokens.
 * ==========================================================================*/

const EASE = [0.2, 0.7, 0.2, 1] as const

const LOGO = (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

/* '**pair**' segments render as accent <strong> */
function Rich({ t }: { t: string }) {
  return <>{t.split('**').map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>
}

type Card = { t: string; d: string; k?: 'e' | 'm' | 's' }
type Step = { s: string; h: string; x: string }
type Pillar = { k: 'e' | 'm' | 's'; lab: string; d: string }

const C = {
  zh: {
    close: '關閉',
    esc: 'Esc',
    kicker: '引擎背後的策略',
    title: '把「看得準」變成一項可規模化的判斷服務。',
    lede: '前端 AI 自動收件與初判，後端由前評案官親自把關。給早期投資機構一個又快又穩的初篩層。',
    pills: ['創新三元 Deal Flow 引擎', 'Advisor of Record 模式', 'Human in the loop'],
    secs: [
      {
        eb: '問題',
        h2: '初篩是投資機構最貴、最不一致的一段。',
        lede: '每一檔基金每年看上百上千個案子，真正值得深談的不到一成。判斷卡在人身上。',
        cards: [
          { t: '看不完', d: '投遞量遠大於合夥人的時間，好案子被淹沒，壞案子照樣佔掉一輪會議。' },
          { t: '不一致', d: '同一個案子，不同人、不同心情，給出不同結論，缺一致的判準骨架。' },
          { t: '難規模化', d: '分析師招募成本高、流動快，判斷力還在養成，初篩產能難以規模化。' },
        ] as Card[],
        note: '真正的痛不是「沒有 AI 工具」，而是**沒有可信、可對帳、可交付的判斷**。工具很多，判斷很少。',
      },
      {
        eb: '非顯而易見的洞察',
        h2: '瓶頸不在工具，在可被信任的判斷。',
        lede: 'LLM 讓「結構化判斷草稿」第一次可以自動化，但要進到投資決策，市場仍要一個真人的簽名。這道縫，就是切入點。',
        cards: [
          { t: '機器給速度', d: '引擎能在幾分鐘內把一份 deck 讀成結構化的三透鏡草稿，近乎零邊際成本。', k: 'e' },
          { t: '真人給可信', d: '前評案官在草稿上補證據、下裁決、簽名，讓結論可被投資委員會直接採用。', k: 's' },
        ] as Card[],
      },
      {
        eb: '引擎怎麼運作',
        h2: '先各自獨立評分，再交叉校正，最後由人裁決。',
        lede: '賣的不是一個 SaaS 帳號，是「系統＋評案官」的綜合判斷即戰力。',
        steps: [
          { s: '01 收件', h: '收件與補強', x: '網頁上傳 deck，三個補強問題自動補齊事實基底。' },
          { s: '02 引擎', h: '三透鏡獨立評分', x: '欲求性、可行性、存續性彼此盲評，避免互相錨定。' },
          { s: '03 校正', h: '交叉校正＋把關', x: '三透鏡交叉連動，評案官補證據、下裁決。' },
          { s: '04 交付', h: '一頁決策簡報', x: '一鍵寄回可對帳的一頁 A4，結論、證據、下一步俱全。' },
        ] as Step[],
        pillars: [
          { k: 'e', lab: '欲求性 · 閘門', d: '有沒有人真的要？過不了這關，工程再強、財務再漂亮都救不回來。' },
          { k: 'm', lab: '可行性 · 做得出來嗎', d: '這支團隊做得出、交付得了嗎？技術、團隊、資源是否對得上。' },
          { k: 's', lab: '存續性 · 養得活嗎', d: '這門生意能不能自己養活自己？單位經濟是否自洽。' },
        ] as Pillar[],
        note: '六十個維度（D21／F21／V18）各自由證據計分，三透鏡由一張總綱卡收斂；三種狀態（過、待驗證、不過）經固定矩陣，解析成單一可行動的裁決。',
      },
      {
        eb: '為什麼是現在',
        h2: '判斷草稿第一次可以自動化，信任卻還沒被自動化。',
        cards: [
          { t: '技術拐點', d: 'LLM 讓結構化推理草稿第一次可規模化產出，成本從「一個人一整天」掉到「幾分鐘」。', k: 'e' },
          { t: '信任缺口', d: '投資決策仍要一個能負責的真人簽名，純自動化的結論還進不了投資委員會。', k: 's' },
          { t: '案量上升', d: '早期案源持續變多，初篩產能的缺口只會更大。', k: 'm' },
        ] as Card[],
      },
      {
        eb: '競爭與護城河',
        h2: '對手當然有，我們的楔子是判斷加簽名。',
        cards: [
          { t: '誰在解這件事', d: '內部分析師（貴、慢、流動）、通用 AI 提示（無判準、不可對帳）、Deal flow SaaS（給資料不給裁決）、精品顧問（純人力、難規模化）。' },
          { t: '我們的楔子', d: '唯一同時給「結構化判準＋真人評案官簽名＋可對帳一頁交付」。AI 給速度，人給可信。', k: 'e' },
        ] as Card[],
        pillars: [
          { k: 'm', lab: '護城河一 · Thesis 防火牆', d: '中立報告層不碰基金的 Thesis，配置層由客戶內部自套，降低採用的政治與機密疑慮。' },
          { k: 'e', lab: '護城河二 · 資料累積', d: '只萃取判準模式、不存商業機密。案子越評，命中率資料集越厚，概念護城河轉成數據護城河。' },
          { k: 's', lab: '護城河三 · 評案官 IP', d: 'Workshop、創業正典、Trinity 引擎同一顆大腦，判準本身難以被一個提示詞複製。' },
        ] as Pillar[],
      },
      {
        eb: '創辦人與市場的契合',
        h2: '做這件事的人，本來就是評案官。',
        lede: '三透鏡讀下來，可行性（F）與創辦人契合度是最強的一柱：引擎不是設想，是既有評案流程的封裝。',
        cards: [
          { t: 'Vincent Wang · 創辦人', d: '前評案官；打造創新三元 Deal Flow 引擎；行銷策略工作坊與創業正典作者。判準的產出者親自把關。', k: 's' },
          { t: '系統作為共同創辦人', d: 'AI 引擎承擔可規模化的初判產能，人只做最高槓桿的最後一哩。人與系統分工明確。', k: 'e' },
        ] as Card[],
      },
      {
        eb: '願景',
        h2: '成為早期投資機構的評案基礎設施。',
        vision: '每一個投資決策，都有一份可對帳、有人簽名的一頁判斷。**先值錢，再規模化**：判斷做深，數據做厚。',
      },
    ],
  },
  en: {
    close: 'Close',
    esc: 'Esc',
    kicker: 'The strategy behind the engine',
    title: 'Turning “seeing it clearly” into a scalable judgment service.',
    lede: 'AI drafts the first pass; a former deal partner signs the final call. A fast, consistent screening layer for early-stage investors.',
    pills: ['Innovation Trinity Deal Flow engine', 'Advisor-of-Record model', 'Human in the loop'],
    secs: [
      {
        eb: 'The problem',
        h2: 'Screening is the most expensive, least consistent part of investing.',
        lede: 'A fund sees hundreds to thousands of deals a year; only a fraction deserve a real conversation. The bottleneck is human.',
        cards: [
          { t: 'Too many to read', d: 'Inbound far outruns partner time. Good deals drown; bad ones still eat a meeting.' },
          { t: 'Inconsistent', d: 'The same deal, different people, different moods, different verdicts. No shared rubric.' },
          { t: 'Hard to scale', d: 'Analysts are costly, turn over fast, and are still building judgment. First-pass capacity does not scale.' },
        ] as Card[],
        note: 'The real pain is not “no AI tools.” It is **no judgment you can trust, reconcile and deliver**. Tools are plentiful; judgment is scarce.',
      },
      {
        eb: 'The non-obvious insight',
        h2: 'The bottleneck is not tooling. It is judgment you can trust.',
        lede: 'LLMs made a structured judgment draft automatable for the first time. But to reach an investment decision, the market still wants a human signature. That seam is the opening.',
        cards: [
          { t: 'Machines give speed', d: 'The engine reads a deck into a structured three-lens draft in minutes, at near-zero marginal cost.', k: 'e' },
          { t: 'Humans give trust', d: 'A former deal partner adds evidence, rules, and signs, so the verdict is committee-ready.', k: 's' },
        ] as Card[],
      },
      {
        eb: 'How the engine works',
        h2: 'Score each lens blind, cross-link, then a human decides.',
        lede: 'You are not buying a SaaS seat. You are buying combined judgment: engine plus evaluator.',
        steps: [
          { s: '01 Intake', h: 'Collect and enrich', x: 'Upload a deck; three follow-ups fill in the factual base.' },
          { s: '02 Engine', h: 'Three lenses, blind', x: 'Desirability, Feasibility and Viability score independently to avoid anchoring.' },
          { s: '03 Cross-link', h: 'Cross-link and vet', x: 'The three lenses reconcile; the evaluator adds evidence and rules.' },
          { s: '04 Deliver', h: 'One-page brief', x: 'A reconcilable one-page A4: verdict, evidence and the next move.' },
        ] as Step[],
        pillars: [
          { k: 'e', lab: 'Desirability · the gate', d: 'Does anyone truly want it? Fail here and no engineering or financials can rescue the case.' },
          { k: 'm', lab: 'Feasibility · can you build it', d: 'Can this team build and ship the mechanism? Tech, team and resources have to line up.' },
          { k: 's', lab: 'Viability · does it sustain', d: 'Can the business fund its own survival? The unit economics have to hold.' },
        ] as Pillar[],
        note: 'Sixty dimensions (D21 / F21 / V18) each score from evidence; one master card converges the three lenses. Three states (pass, to-verify, fail) resolve through a fixed matrix into a single actionable verdict.',
      },
      {
        eb: 'Why now',
        h2: 'Judgment drafts just became automatable. Trust did not.',
        cards: [
          { t: 'Technical inflection', d: 'LLMs make structured reasoning drafts scalable for the first time, from a person-day down to minutes.', k: 'e' },
          { t: 'Trust gap', d: 'An investment call still needs an accountable human signature; a fully automated verdict cannot enter committee.', k: 's' },
          { t: 'Rising volume', d: 'Early-stage deal flow keeps growing, so the first-pass capacity gap only widens.', k: 'm' },
        ] as Card[],
      },
      {
        eb: 'Competition and moat',
        h2: 'Competitors exist. Our wedge is judgment plus a signature.',
        cards: [
          { t: 'Who solves this today', d: 'Internal analysts (costly, slow, churn), generic AI prompts (no rubric, not reconcilable), deal-flow SaaS (data, not verdicts), boutique advisories (all-human, hard to scale).' },
          { t: 'Our wedge', d: 'The only one giving a structured rubric, a real evaluator signature, and a reconcilable one-page delivery at once. AI gives speed; the human gives trust.', k: 'e' },
        ] as Card[],
        pillars: [
          { k: 'm', lab: 'Moat 1 · Thesis firewall', d: 'The neutral report never touches a fund thesis; the config layer runs inside the client, easing political and confidentiality concerns.' },
          { k: 'e', lab: 'Moat 2 · Data compounding', d: 'Only rubric patterns are extracted, never trade secrets. Every deal thickens the hit-rate dataset, turning a concept moat into a data moat.' },
          { k: 's', lab: 'Moat 3 · Evaluator IP', d: 'Workshop, startup canon and the Trinity engine share one brain. The rubric itself is hard to copy with a single prompt.' },
        ] as Pillar[],
      },
      {
        eb: 'Founder-market fit',
        h2: 'The person building this was already the evaluator.',
        lede: 'Read through the three lenses, Feasibility and founder fit are the strongest pillar: the engine is not a hypothesis, it is an existing evaluation process, packaged.',
        cards: [
          { t: 'Vincent Wang · founder', d: 'Former deal evaluator; built the Innovation Trinity Deal Flow engine; author of the marketing-strategy workshop and startup canon. The author of the rubric vets every call.', k: 's' },
          { t: 'The system as co-founder', d: 'The AI engine carries scalable first-pass capacity; the human does only the highest-leverage last mile. Clear division of labor.', k: 'e' },
        ] as Card[],
      },
      {
        eb: 'The vision',
        h2: 'Become the evaluation infrastructure for early-stage investors.',
        vision: 'Every investment decision backed by a reconcilable, signed one-page judgment. **Get valuable first, then scale**: deepen the judgment, thicken the data.',
      },
    ],
  },
}

const SECT = {
  hide: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
} as const

export default function Pitch({ onClose }: { onClose: () => void }) {
  const { lang } = useLang()
  const c = C[lang]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // pause Lenis + lock the page behind the overlay so only the modal scrolls
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      lenis?.start()
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="pitch-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={c.kicker}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
      onClick={onClose}
    >
      <motion.div
        className="pitch-modal"
        data-lenis-prevent
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.985 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pitch-close" onClick={onClose} aria-label={c.close}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          <span className="pitch-esc">{c.esc}</span>
        </button>

        {/* cover */}
        <motion.header className="pitch-cover" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }}>
          <motion.div className="pitch-brand" variants={SECT}>{LOGO}<span>TRINITY</span></motion.div>
          <motion.div className="pitch-kicker" variants={SECT}>{c.kicker}</motion.div>
          <motion.h1 className="pitch-title" variants={SECT}>{c.title}</motion.h1>
          <motion.p className="pitch-lede" variants={SECT}>{c.lede}</motion.p>
          <motion.div className="pitch-pills" variants={SECT}>
            {c.pills.map((p) => <span className="pitch-pill" key={p}>{p}</span>)}
          </motion.div>
        </motion.header>

        {c.secs.map((s, i) => (
          <motion.section
            className="pitch-sec"
            key={i}
            initial="hide"
            animate="show"
            transition={{ delay: 0.2 + i * 0.05 }}
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.24 + i * 0.05 } } }}
          >
            <motion.div className="pitch-eb" variants={SECT}><span className="pitch-num">{String(i + 1).padStart(2, '0')}</span>{s.eb}</motion.div>
            <motion.h2 className="pitch-h2" variants={SECT}>{s.h2}</motion.h2>
            {'lede' in s && s.lede && <motion.p className="pitch-slede" variants={SECT}>{s.lede}</motion.p>}

            {'steps' in s && s.steps && (
              <motion.div className="pitch-flow" variants={SECT}>
                {s.steps.map((st, j) => (
                  <div className="pitch-step" key={j}>
                    <div className="pitch-step-s">{st.s}</div>
                    <div className="pitch-step-h">{st.h}</div>
                    <div className="pitch-step-x">{st.x}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {'cards' in s && s.cards && (
              <motion.div className={`pitch-cards g${s.cards.length}`} variants={SECT}>
                {s.cards.map((cd, j) => (
                  <div className={`pitch-card${cd.k ? ' k-' + cd.k : ''}`} key={j}>
                    <div className="pitch-card-t">{cd.t}</div>
                    <div className="pitch-card-d"><Rich t={cd.d} /></div>
                  </div>
                ))}
              </motion.div>
            )}

            {'pillars' in s && s.pillars && (
              <motion.div className="pitch-pillars" variants={SECT}>
                {s.pillars.map((p, j) => (
                  <div className={`pitch-pillar k-${p.k}`} key={j}>
                    <div className="pitch-pillar-lab">{p.lab}</div>
                    <div className="pitch-pillar-d">{p.d}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {'vision' in s && s.vision && (
              <motion.p className="pitch-vision" variants={SECT}><Rich t={s.vision} /></motion.p>
            )}

            {'note' in s && s.note && (
              <motion.div className="pitch-note" variants={SECT}><Rich t={s.note} /></motion.div>
            )}
          </motion.section>
        ))}

        <div className="pitch-foot">{LOGO}<span>{lang === 'zh' ? '引擎背後的策略 · 產品與策略簡報' : 'The strategy behind the engine · product and strategy'}</span></div>
      </motion.div>
    </motion.div>
  )
}
