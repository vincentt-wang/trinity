import { useEffect } from 'react'
import { useLang } from './i18n'
import { EPISODES, type Episode } from './episodeData'
import { routeTo } from './router'
import { FOLLOW } from './intake'
import { setSource, trackCta, trackView } from './lib/track'

/** Video episodes moved over from venturerelations.pages.dev (261117). Clean URLs: /insight/ep01 … /insight/ep06. */

const T = {
  en: {
    eyebrow: 'Episodes', h2: 'Startup ideas, one short at a time',
    lead: 'Each episode starts with something you have lived through, then gets to the startup idea and a real case. Every claim is sourced.',
    watch: 'Watch and read', back: 'All episodes', short: 'The short version', sources: 'Sources',
    srcNote: 'Only primary sources are linked. Secondary reports are listed with their level and used only as the narration describes them.',
    next: 'Next', prev: 'Previous',
    ctaH: 'Want your own idea read this way?',
    ctaP: 'Trinity reads one startup idea through 60 dimensions, the same way Vincent reviews startups. The first read is free.',
    ctaBtn: 'Analyze my idea', follow: 'Follow',
  },
  zh: {
    eyebrow: '影片與文章', h2: '一集一個創業觀念',
    lead: '每集從一段你經歷過的事開始，接到一個創業的詞和一個真實案例。每集都有出處。',
    watch: '看影片與文字', back: '全部集數', short: '這集講什麼', sources: '出處',
    srcNote: '只有一手來源附連結；二手報導標出等級，旁白也照這個層級講。',
    next: '下一集', prev: '上一集',
    ctaH: '想讓你的點子也這樣被看一次？',
    ctaP: 'Trinity 用 60 個維度看一個創業點子，跟 Vincent 看新創案的方法一樣。初步判讀免費。',
    ctaBtn: '分析我的點子', follow: '追蹤',
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
        {EPISODES.map((e) => {
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
  const idx = EPISODES.findIndex((x) => x.slug === ep.slug)
  const prev = EPISODES[idx - 1]
  const next = EPISODES[idx + 1]
  const src = `ins-${ep.slug}`

  useEffect(() => { trackView('/insight/' + ep.slug) }, [ep.slug])
  useEffect(() => {
    document.title = `EP ${nn(ep.n)} · ${c.title} · Trinity Check`
    let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = c.desc
  }, [ep, c])

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
      <button className="id-back" onClick={() => go(null)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        {t.back}
      </button>
      <header className="id-head">
        <div className="ep-kick">EP {nn(ep.n)} · {c.term}</div>
        <h1 className="id-title">{c.title}</h1>
        <p className="id-lead">{c.desc}</p>
      </header>
      <div className="ep-video">
        <video key={ep.slug} controls playsInline preload="metadata" poster={`/ep/${ep.slug}.jpg`} src={`/ep/${ep.slug}.mp4`} />
      </div>
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
      <FollowRow label={t.follow} />
    </article>
  )
}
