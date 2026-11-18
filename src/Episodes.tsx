import { useEffect } from 'react'
import { useLang } from './i18n'
import { EPISODES, type Episode } from './episodeData'
import { EP_LONG, EP_SEC } from './epArticles'

/** Only episodes Vincent has approved (published: true) are listed or linked (261117). */
export const PUBLISHED_EPISODES = EPISODES.filter((e) => e.published)
import { routeTo } from './router'
import { FOLLOW } from './intake'
import { setSource, trackCta, trackView } from './lib/track'
import { StoryBody, hasStory } from './EpStory'
import { EP_STORY } from './epStories'
import { readMinutes } from './storyLength'

/** Video episodes moved over from venturerelations.pages.dev (261117). Clean URLs: /insight/ep01 … /insight/ep06. */

const T = {
  en: {
    eyebrow: 'Video articles', h2: 'Startup ideas, one short at a time',
    lead: 'Each episode starts with something you have lived through, then gets to the startup idea and a real case. Every claim is sourced.',
    watch: 'Watch and read', back: 'All episodes', short: 'The short version', sources: 'Sources',
    srcNote: 'Only primary sources are linked. Secondary reports are listed with their level and used only as the narration describes them.',
    next: 'Next', prev: 'Previous',
    npKick: 'Not published yet', npH: 'This piece isn\'t published yet.', npP: 'It will show up on the Insight page once it goes live.', npBack: 'See published pieces',
    origLabel: 'Original',
    ctaH: 'Working on an idea of your own?',
    ctaP: 'Trinity can take a first look, the same way Vincent reads startups.\nYour first read is free.',
    ctaBtn: 'Take a first look', follow: 'Follow',
  },
  zh: {
    eyebrow: '影片文章', h2: '一集一個創業觀念',
    lead: '每集從一段你經歷過的事開始，接到一個創業的詞和一個真實案例。每集都有出處。',
    watch: '看影片與文字', back: '全部集數', short: '這集講什麼', sources: '出處',
    srcNote: '只有一手來源附連結；二手報導標出等級，旁白也照這個層級講。',
    next: '下一集', prev: '上一集',
    npKick: '尚未發布', npH: '這篇還沒發布。', npP: '發布之後會出現在洞察觀點頁。', npBack: '看已發布的文章',
    origLabel: '原文',
    ctaH: '手上也有一個點子嗎？',
    ctaP: '讓 Trinity 先幫你看一眼，用的是 Vincent 看新創的同一套方法。\n第一次免費。',
    ctaBtn: '讓 Trinity 看看', follow: '追蹤',
  },
}

const nn = (n: number) => String(n).padStart(2, '0')
const go = (slug: string | null) => { routeTo('insight', slug ? '/' + slug : ''); window.scrollTo(0, 0) }

/** Grid of the six episodes, shown at the top of /insight. */
export function EpisodeList() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <section className="ep-list wrap" id="episodes">
      <div className="eyebrow">{t.eyebrow}</div>
      <h2 className="ep-list-h">{t.h2}</h2>
      <p className="ep-list-lead">{t.lead}</p>
      <div className="ep-grid">
        {PUBLISHED_EPISODES.map((e) => {
          const c = e[lang]
          return (
            <a key={e.slug} className="ep-card" href={`/insight/${e.slug}`} onClick={(ev) => { ev.preventDefault(); go(e.slug) }}>
              <img src={`/ep/${e.slug}.jpg`} alt="" width={1080} height={1920} loading="lazy" decoding="async" />
              <div className="ep-card-b">
                <div className="ep-kick">EP {nn(e.n)} · {c.term}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

export function FollowRow({ label }: { label: string }) {
  return (
    <div className="ep-follow">
      <span className="ep-follow-h">{label}</span>
      {FOLLOW.map((f) => (
        <a key={f.name} href={f.href} target="_blank" rel="noopener" data-cta={'follow:' + f.name}>{f.name}</a>
      ))}
    </div>
  )
}

export function EpisodeDetail({ ep }: { ep: Episode }) {
  const { lang } = useLang()
  const t = T[lang]
  const c = ep[lang]
  const idx = PUBLISHED_EPISODES.findIndex((x) => x.slug === ep.slug)
  const prev = PUBLISHED_EPISODES[idx - 1]
  const next = PUBLISHED_EPISODES[idx + 1]
  const story = hasStory(ep.slug)
  const long = story || EP_LONG[ep.slug]?.[lang] || EP_SEC[ep.slug]?.[lang]
  const src = `ins-${ep.slug}`

  const preview = !ep.published
  useEffect(() => { if (!preview) trackView('/insight/' + ep.slug) }, [ep.slug, preview])
  useEffect(() => {
    document.title = `EP ${nn(ep.n)} · ${c.title} · Trinity Check`
    let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = c.desc
    setRobots(preview ? 'noindex,nofollow' : null)
    return () => { if (preview) setRobots(null) }
  }, [ep, c, preview])

  const analyze = (e: React.MouseEvent) => {
    e.preventDefault()
    setSource(src)
    trackCta('ep:' + ep.slug + ':analyze')
    window.dispatchEvent(new CustomEvent('trinity:navview', { detail: 'analyze' }))
    routeTo('analyze', '?s=' + src)
    window.scrollTo(0, 0)
  }

  return (
    <article className="insight-detail ep-detail" data-lens="e">
      {preview && <div className="ep-preview" role="note">{lang === 'zh' ? '預覽：這篇還沒發布，只有拿到這個網址的人看得到。' : 'Preview: not published yet. Only people with this link can see it.'}</div>}
      <button className="id-back" onClick={() => go(null)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        {t.back}
      </button>
      <header className="id-head">
        <div className="ep-kick">EP {nn(ep.n)} · {c.term}</div>
        <h1 className="id-title">{c.title}</h1>
        {story && <p className="ep-read" data-testid="read-time">{lang === 'zh' ? `約 ${readMinutes(EP_STORY[ep.slug].zh, 'zh')} 分鐘` : `${readMinutes(EP_STORY[ep.slug].en, 'en')} min read`}</p>}
        {!long && <p className="id-lead">{c.desc}</p>}
      </header>
      {story ? <StoryBody ep={ep} preview={preview} /> : (
      <>
      <div className="ep-video">
        <video key={ep.slug} controls playsInline preload="metadata" poster={`/ep/${ep.slug}.jpg`} src={`/ep/${ep.slug}.mp4`} />
      </div>
      {EP_SEC[ep.slug] ? <SecBody ep={ep} t={t} /> : long ? <LongBody ep={ep} t={t} /> : (
        <>
          <section className="id-sec ep-body">
            <h2>{t.short}</h2>
            {c.body.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
          </section>
          <section className="ep-quote">
            <div className="ep-qby">{c.quoteBy}</div>
            <blockquote>{c.quote}</blockquote>
            {lang === 'zh' && c.quoteOrig && <div className="ep-qorig">原文：{c.quoteOrig}</div>}
            {c.quoteNote && <p className="ep-qnote">{c.quoteNote}</p>}
            <p className="ep-ask">{c.ask}</p>
          </section>
          <section className="id-sec">
            <h2>{t.sources}</h2>
            <ol className="ep-srcs">
              {ep.sources.map((s, i) => (
                <li key={i}>
                  <span className={`ep-lv ${s.levelZh === '一手' ? 'p' : 's'}`}>{lang === 'zh' ? s.levelZh : s.levelEn}</span>{' '}
                  {s.url ? <a href={s.url} target="_blank" rel="noopener">{s.label}</a> : s.label}
                </li>
              ))}
            </ol>
            <p className="ep-srcnote">{t.srcNote}</p>
          </section>
        </>
      )}
      <div className="ep-cta">
        <div>
          <h2>{t.ctaH}</h2>
          <p>{t.ctaP}</p>
        </div>
        <a className="btn btn-primary" href={`/analyze?s=${src}`} onClick={analyze}>{t.ctaBtn} →</a>
      </div>
      <nav className="ep-nav">
        {prev ? <a href={`/insight/${prev.slug}`} onClick={(e) => { e.preventDefault(); go(prev.slug) }}>← {t.prev}: EP {nn(prev.n)}</a> : <span />}
        {next ? <a className="nx" href={`/insight/${next.slug}`} onClick={(e) => { e.preventDefault(); go(next.slug) }}>{t.next}: EP {nn(next.n)} →</a> : <a href="/insight" onClick={(e) => { e.preventDefault(); go(null) }}>{t.back}</a>}
      </nav>
      </>
      )}
      <FollowRow label={t.follow} />
    </article>
  )
}

/** Long-form article (EP01 first): opening, metaphor, the board, the vote math, latest news, Buffett, annotated sources. */
function LongBody({ ep, t }: { ep: Episode; t: (typeof T)['en'] }) {
  const { lang } = useLang()
  const c = ep[lang]
  const a = EP_LONG[ep.slug][lang]
  return (
    <div className="ep-long">
      <section className="id-sec ep-body">
        {a.open.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      </section>
      <section className="id-sec ep-body">
        <h2>{a.metaphorH}</h2>
        {a.metaphor.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      </section>
      <section className="id-sec">
        <h2>{a.boardH}</h2>
        <p className="ep-sec-lead">{a.boardLead}</p>
        <div className="ep-board" role="table" aria-label={a.boardH}>
          <div className="ep-brow ep-bhead" role="row">
            <span role="columnheader">{a.colName}</span><span role="columnheader">{a.colSince}</span><span role="columnheader">{a.colBg}</span>
          </div>
          {a.directors.map((d) => (
            <div className="ep-brow" role="row" key={d.name}>
              <span className="ep-bname" role="cell">{d.name}</span>
              <span className="ep-bsince" role="cell">{d.since}</span>
              <span className="ep-bbg" role="cell">{d.bg}</span>
            </div>
          ))}
        </div>
        <p className="ep-srcnote">{a.boardNote}</p>
      </section>
      <section className="id-sec ep-body">
        <h2>{a.votesH}</h2>
        <div className="ep-seats" aria-label={a.seatsCap}>
          {Array.from({ length: 10 }, (_, i) => <span key={i} className={i < 6 ? 'on' : ''} />)}
        </div>
        <p className="ep-seats-cap">{a.seatsCap}</p>
        {a.votes.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      </section>
      <section className="id-sec">
        <h2>{a.newsH}</h2>
        <p className="ep-sec-lead">{a.newsLead}</p>
        <ol className="ep-news">
          {a.updates.map((u, i) => (
            <li key={i}>
              <span className="ep-news-d">{u.date}</span>
              <div>
                <p>{u.text}</p>
                <span className="ep-news-s">{u.src}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="ep-srcnote">{a.newsNote}</p>
      </section>
      <section className="ep-quote">
        <div className="ep-qby">{c.quoteBy}</div>
        <blockquote>{c.quote}</blockquote>
        {lang === 'zh' && c.quoteOrig && <div className="ep-qorig">{t.origLabel}：{c.quoteOrig}</div>}
        <p className="ep-ask">{c.ask}</p>
      </section>
      <section className="id-sec">
        <h2>{a.sourcesH}</h2>
        <ol className="ep-srcs ep-srcs-long">
          {a.sources.map((s, i) => (
            <li key={i}>
              <p className="ep-src-what">{s.what}</p>
              <div className="ep-src-link">
                <span className={`ep-lv ${s.level === 'p' ? 'p' : 's'}`}>{a.levels[s.level]}</span>{' '}
                <a href={s.url} target="_blank" rel="noopener">{s.label}</a>
              </div>
            </li>
          ))}
        </ol>
        <p className="ep-srcnote">{a.srcNote}</p>
      </section>
    </div>
  )
}


/** Sectioned long-form article (EP03 on): opening, sections with paragraphs or sourced items, the quote, annotated sources. */
function SecBody({ ep, t }: { ep: Episode; t: (typeof T)['en'] }) {
  const { lang } = useLang()
  const c = ep[lang]
  const a = EP_SEC[ep.slug][lang]
  return (
    <div className="ep-long">
      <section className="id-sec ep-body">
        {a.open.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      </section>
      {a.sections.map((s) => (
        <section className="id-sec ep-body" key={s.h}>
          <h2>{s.h}</h2>
          {s.lead && <p className="ep-sec-lead">{s.lead}</p>}
          {s.seats && (
            <>
              <div className="ep-seats" aria-label={s.seats.cap}>
                {Array.from({ length: 10 }, (_, i) => <span key={i} className={i < s.seats!.on ? 'on' : ''} />)}
              </div>
              <p className="ep-seats-cap">{s.seats.cap}</p>
            </>
          )}
          {s.paras?.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
          {s.items && (
            <ol className="ep-items">
              {s.items.map((it) => (
                <li key={it.k}>
                  <h3>{it.k}</h3>
                  <p dangerouslySetInnerHTML={{ __html: it.v }} />
                  <span className="ep-news-s">{it.src}</span>
                </li>
              ))}
            </ol>
          )}
          {s.note && <p className="ep-srcnote">{s.note}</p>}
        </section>
      ))}
      <section className="ep-quote">
        <div className="ep-qby">{c.quoteBy}</div>
        <blockquote>{c.quote}</blockquote>
        {lang === 'zh' && c.quoteOrig && <div className="ep-qorig">{t.origLabel}：{c.quoteOrig}</div>}
        {a.quoteNote && <p className="ep-qnote">{a.quoteNote}</p>}
        <p className="ep-ask">{c.ask}</p>
      </section>
      <section className="id-sec">
        <h2>{a.sourcesH}</h2>
        <ol className="ep-srcs ep-srcs-long">
          {a.sources.map((s, i) => (
            <li key={i}>
              <p className="ep-src-what">{s.what}</p>
              <div className="ep-src-link">
                <span className={`ep-lv ${s.level === 'p' ? 'p' : 's'}`}>{a.levels[s.level]}</span>{' '}
                <a href={s.url} target="_blank" rel="noopener">{s.label}</a>
              </div>
            </li>
          ))}
        </ol>
        <p className="ep-srcnote">{a.srcNote}</p>
      </section>
    </div>
  )
}

/** Set or clear <meta name="robots"> for client-side navigation. The static HTML at /insight/epNN carries the real tag. */
export function setRobots(content: string | null) {
  let m = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
  if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m) }
  m.content = content || 'index,follow,max-image-preview:large'
}

/** Neutral page for an episode URL that exists but is not published yet (noindex). */
export function EpisodeNotPublished() {
  const { lang } = useLang()
  const t = T[lang]
  useEffect(() => {
    document.title = (lang === 'zh' ? '尚未發布' : 'Not published yet') + ' · Trinity Check'
    setRobots('noindex,nofollow')
    return () => setRobots(null)
  }, [lang])
  return (
    <article className="insight-detail ep-detail ep-np" data-lens="e">
      <header className="id-head">
        <div className="ep-kick">{t.npKick}</div>
        <h1 className="id-title">{t.npH}</h1>
        <p className="id-lead">{t.npP}</p>
      </header>
      <a className="btn btn-primary" href="/insight" onClick={(e) => { e.preventDefault(); go(null) }}>{t.npBack} →</a>
    </article>
  )
}
