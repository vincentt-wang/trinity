/**
 * 集數文章 v2 共用版型（261118）。四集同一套：情境圖 → 影片回顧＋影片 → 延伸（中間插分析圖）→ 投票 → 出處 → 點子 CTA → 系列輪播。
 * 內容在 src/epStories.ts；投票存在 trinity-counter worker 的 /poll（KV key poll:<id>）。
 */
import { useEffect, useRef, useState } from 'react'
import { useLang } from './i18n'
import { EPISODES, type Episode } from './episodeData'
import { EP_STORY, type ChartRow, type SceneData, type StoryChart, type StoryLang, type StoryPoll, type StorySec } from './epStories'
import { routeTo } from './router'
import { setSource, trackCta } from './lib/track'

const POLL_URL = 'https://trinity-counter.comicbnb.workers.dev/poll'
const nn = (n: number) => String(n).padStart(2, '0')

const L = {
  en: {
    ideaH: 'Working on an idea of your own?', ideaBtn: 'Let Trinity take a look',
    moreH: 'More episodes', prevA: 'Previous', nextA: 'Next', all: 'All episodes', allSub: 'See every published piece', pv: 'Preview',
    voteN: (n: number) => `${n.toLocaleString('en-US')} ${n === 1 ? 'vote' : 'votes'} so far`, mine: 'Your pick',
    pollKick: 'Your turn', pollErr: 'Couldn\'t reach the vote counter. Try again in a moment.', pollPv: 'Preview votes are counted separately and don\'t touch the live poll.',
  },
  zh: {
    ideaH: '手上也有一個點子嗎？', ideaBtn: '讓 Trinity 看看',
    moreH: '系列文章', prevA: '上一張', nextA: '下一張', all: '全部集數', allSub: '看所有已發布的文章', pv: '預覽',
    voteN: (n: number) => `目前 ${n.toLocaleString('zh-TW')} 人投票`, mine: '你選的',
    pollKick: '換你選', pollErr: '票數暫時連不上，請稍後再試一次。', pollPv: '預覽模式的票另外計算，不會算進正式票數。',
  },
}

export function hasStory(slug: string) { return !!EP_STORY[slug] }

/** The whole article body for one episode. */
export function StoryBody({ ep, preview }: { ep: Episode; preview: boolean }) {
  const { lang } = useLang()
  const a = EP_STORY[ep.slug][lang]
  const t = L[lang]
  const src = `ins-${ep.slug}`
  const analyze = (e: React.MouseEvent) => {
    e.preventDefault()
    setSource(src)
    if (!preview) trackCta('ep:' + ep.slug + ':analyze')
    window.dispatchEvent(new CustomEvent('trinity:navview', { detail: 'analyze' }))
    routeTo('analyze', '?s=' + src)
    window.scrollTo(0, 0)
  }
  return (
    <div className="st">
      <Scene s={a.scene} />
      <section className="st-recap">
        <h2>{a.recapH}</h2>
        {a.recap.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
        <div className="ep-video">
          <video key={ep.slug} controls playsInline preload="metadata" poster={`/ep/${ep.slug}.jpg`} src={`/ep/${ep.slug}.mp4`} />
        </div>
      </section>
      {a.sections.map((s, i) => (
        <div key={s.h}>
          <Sec s={s} />
          {i === a.chartAfter && <GrowChart c={a.chart} />}
        </div>
      ))}
      <Poll p={a.poll} preview={preview} />
      <Sources a={a} />
      <div className="st-idea">
        <h2>{t.ideaH}</h2>
        <a className="btn btn-primary" href={`/analyze?s=${src}`} onClick={analyze} data-testid="st-analyze">{t.ideaBtn} →</a>
      </div>
      <Carousel cur={ep.slug} preview={preview} />
    </div>
  )
}

/* ── 1. 情境圖：畫概念，不畫資料。全部 HTML/CSS，字跟著語言切換 ── */
function Scene({ s }: { s: SceneData }) {
  return (
    <figure className={`sc sc--${s.kind}`} aria-label={s.cap}>
      <div className="sc-stage">
        {s.kind === 'paths' && (
          <>
            <div className="sc-talk">
              <div className="sc-bub sc-him"><span className="sc-who">{s.him.who}</span><p>{s.him.said}</p></div>
              <div className="sc-door"><span className="sc-door-in">{s.door}</span></div>
              <div className="sc-bub sc-no"><span className="sc-who">{s.board.who}</span><p>{s.board.said}</p></div>
            </div>
            <div className="sc-paths">
              {s.paths.map((p, i) => <span key={p} className="sc-path" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>{p}</span>)}
            </div>
          </>
        )}
        {s.kind === 'board' && (
          <div className="sc-boardwrap">
            <div className="sc-table">
              {(() => {
                const seats: number[] = []
                s.groups.forEach((g, gi) => { for (let k = 0; k < g.n; k++) seats.push(gi) })
                return seats.map((g, i) => {
                  const ang = (i / seats.length) * Math.PI * 2 - Math.PI / 2
                  return <span key={i} className={`sc-seat g${g}`} style={{ left: `${50 + 50 * Math.cos(ang)}%`, top: `${50 + 50 * Math.sin(ang)}%`, animationDelay: `${i * 0.06}s` }} />
                })
              })()}
              <span className="sc-table-top" />
            </div>
            <div className="sc-side">
              <span className="sc-seat sc-empty" />
              <span className="sc-empty-l">{s.empty}</span>
            </div>
            <ul className="sc-legend">
              {s.groups.map((g, gi) => <li key={g.label}><span className={`sc-dot g${gi}`} />{g.n} · {g.label}</li>)}
            </ul>
          </div>
        )}
        {s.kind === 'handoff' && (
          <div className="sc-hand">
            <div className="sc-person"><span className="sc-av">{s.from.name.slice(0, 1)}</span><b>{s.from.name}</b><span>{s.from.sub}</span></div>
            <div className="sc-baton"><span className="sc-baton-bar" /><span className="sc-baton-l">{s.mid}</span></div>
            <div className="sc-person sc-to"><span className="sc-av">{s.to.name.slice(0, 1)}</span><b>{s.to.name}</b><span>{s.to.sub}</span></div>
          </div>
        )}
        {s.kind === 'three' && (
          <div className="sc-three">
            {s.cards.map((c, i) => (
              <div key={c.q} className="sc-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="sc-ring"><span>{i + 1}</span></span>
                <b>{c.q}</b>
                <span>{c.bar}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <figcaption className="sc-cap">{s.cap}</figcaption>
    </figure>
  )
}

/* ── 延伸段落 ── */
function Sec({ s }: { s: StorySec }) {
  return (
    <section className="st-sec">
      <h2>{s.h}</h2>
      {s.lead && <p className="st-lead">{s.lead}</p>}
      {s.paras?.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      {s.items && (
        <ol className="st-items">
          {s.items.map((it) => (
            <li key={it.k}>
              <h3>{it.k}</h3>
              <p dangerouslySetInnerHTML={{ __html: it.v }} />
              {it.src && <span className="st-src">{it.src}</span>}
            </li>
          ))}
        </ol>
      )}
      {s.note && <p className="st-note">{s.note}</p>}
    </section>
  )
}

/** Adds .on once the element scrolls into view (bars grow from zero). Shows at once without IntersectionObserver. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setOn(true); io.disconnect() } }, { rootMargin: '0px 0px -10% 0px', threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, on] as const
}

/* ── 4. 分析圖：HTML/CSS 長條，捲到才長出來 ── */
function GrowChart({ c }: { c: StoryChart }) {
  const [ref, on] = useInView<HTMLElement>()
  const pct = (v: number) => `${Math.max(0.8, Math.min(100, (v / c.max) * 100))}%`
  return (
    <figure ref={ref} className={`gc${on ? ' on' : ''}`} data-testid="gc">
      <figcaption>
        <h2>{c.h}</h2>
        {c.lead && <p className="st-lead">{c.lead}</p>}
      </figcaption>
      <div className="gc-rows">
        {c.line && (
          <div className="gc-line-wrap" aria-hidden>
            <span className="gc-line" style={{ left: pct(c.line.v) }}><span>{c.line.label}</span></span>
          </div>
        )}
        {c.rows.map((r: ChartRow, i) => (
          <div key={r.label} className={`gc-row${r.hl ? ' hl' : ''}`}>
            <span className="gc-l">{r.label}</span>
            <span className="gc-track"><span className="gc-fill" style={{ width: on ? pct(r.v) : '0%', transitionDelay: `${i * 0.09}s` }} /></span>
            <span className="gc-v">{r.show}</span>
          </div>
        ))}
      </div>
      <p className="st-note">{c.note}</p>
    </figure>
  )
}

/* ── 5. 投票：票數存在 worker，重整後看得到自己的選擇與比例 ── */
function visitorId() {
  try {
    let v = localStorage.getItem('trinity-vid')
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('trinity-vid', v) }
    return v
  } catch { return 'anon' + Math.random().toString(16).slice(2, 14) }
}

function Poll({ p, preview }: { p: StoryPoll; preview: boolean }) {
  const { lang } = useLang()
  const t = L[lang]
  const pid = preview ? p.id + '-pv' : p.id
  const key = 'trinity-poll-' + pid
  const [mine, setMine] = useState<string | null>(() => { try { return localStorage.getItem(key) } catch { return null } })
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`${POLL_URL}?id=${pid}`, { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json()).then((j) => { if (live && j.counts) setCounts(j.counts) })
      .catch(() => { if (live) setErr(true) })
    return () => { live = false }
  }, [pid])

  const vote = async (k: string) => {
    if (mine || busy) return
    setBusy(true)
    setMine(k)
    try { localStorage.setItem(key, k) } catch { /* ignore */ }
    if (!preview) trackCta(`poll:${p.id}:${k}`)
    try {
      const r = await fetch(POLL_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ id: pid, o: k, v: visitorId() }), signal: AbortSignal.timeout(6000) })
      const j = await r.json()
      if (j.counts) { setCounts(j.counts); setErr(false) } else setErr(true)
    } catch { setErr(true) }
    setBusy(false)
  }

  const shown = mine ? { ...(counts || {}) } : null
  // the visitor's own vote always shows, even before the counter answers
  if (shown && mine && !(shown[mine] > 0)) shown[mine] = 1
  const total = shown ? p.opts.reduce((n, o) => n + (shown[o.k] || 0), 0) : 0
  return (
    <section className="pl" data-testid="poll" data-poll={pid}>
      <div className="pl-kick">{t.pollKick}</div>
      <h2>{p.q}</h2>
      <div className="pl-opts" role="group" aria-label={p.q}>
        {p.opts.map((o) => {
          const n = shown ? shown[o.k] || 0 : 0
          const pc = total ? Math.round((n / total) * 100) : 0
          return (
            <button key={o.k} type="button" className={`pl-opt${mine ? ' done' : ''}${mine === o.k ? ' mine' : ''}`} onClick={() => vote(o.k)} disabled={!!mine} data-k={o.k} aria-pressed={mine === o.k}>
              {mine && <span className="pl-bar" style={{ width: `${pc}%` }} />}
              <span className="pl-t">{o.t}{mine === o.k && <em>{t.mine}</em>}</span>
              {mine && <span className="pl-pc" data-pc={pc}>{pc}%</span>}
            </button>
          )
        })}
      </div>
      {mine && (
        <>
          <p className="pl-n" data-testid="poll-n">{t.voteN(total)}</p>
          <p className="pl-after">{p.after}</p>
        </>
      )}
      {err && <p className="pl-err">{t.pollErr}</p>}
      {preview && <p className="pl-err">{t.pollPv}</p>}
    </section>
  )
}

function Sources({ a }: { a: StoryLang }) {
  return (
    <details className="st-srcs">
      <summary>{a.sourcesH} ({a.sources.length})</summary>
      <ol>
        {a.sources.map((s, i) => (
          <li key={i}>
            <p>{s.what}</p>
            <div>
              <span className={`ep-lv ${s.level === 'p' ? 'p' : 's'}`}>{a.levels[s.level]}</span>{' '}
              <a href={s.url} target="_blank" rel="noopener">{s.label}</a>
            </div>
          </li>
        ))}
      </ol>
      <p className="st-note">{a.srcNote}</p>
    </details>
  )
}

/* ── 7. 系列輪播：已發布的其他集；預覽模式另外列出其他有新版文章的預覽集 ── */
function Carousel({ cur, preview }: { cur: string; preview: boolean }) {
  const { lang } = useLang()
  const t = L[lang]
  const track = useRef<HTMLDivElement>(null)
  const list = EPISODES.filter((e) => e.slug !== cur && (e.published || (preview && hasStory(e.slug))))
  const open = (slug: string, pv: boolean) => (ev: React.MouseEvent) => {
    ev.preventDefault()
    routeTo('insight', '/' + slug + (pv ? '?preview=vs' : ''))
    window.scrollTo(0, 0)
  }
  const step = (d: number) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.cr-card') as HTMLElement | null
    el.scrollBy({ left: d * ((card?.offsetWidth || 260) + 16), behavior: 'smooth' })
  }
  return (
    <section className="cr" data-testid="carousel">
      <div className="cr-head">
        <h2>{t.moreH}</h2>
        <div className="cr-arrows">
          <button type="button" aria-label={t.prevA} onClick={() => step(-1)}>←</button>
          <button type="button" aria-label={t.nextA} onClick={() => step(1)}>→</button>
        </div>
      </div>
      <div className="cr-track" ref={track}>
        {list.map((e) => {
          const pv = !e.published
          const href = `/insight/${e.slug}${pv ? '?preview=vs' : ''}`
          return (
            <a key={e.slug} className="cr-card" href={href} onClick={open(e.slug, pv)} data-cta={pv ? undefined : 'carousel:' + e.slug}>
              <img src={`/ep/${e.slug}.jpg`} alt="" width={1080} height={1920} loading="lazy" decoding="async" />
              <span className="cr-b">
                <span className="cr-kick">EP {nn(e.n)}{pv && <i>{t.pv}</i>}</span>
                <span className="cr-t">{e[lang].title}</span>
              </span>
            </a>
          )
        })}
        <a className="cr-card cr-all" href="/insight" onClick={(ev) => { ev.preventDefault(); routeTo('insight', ''); window.scrollTo(0, 0) }}>
          <span className="cr-b">
            <span className="cr-kick">Insight</span>
            <span className="cr-t">{t.all} →</span>
            <span className="cr-sub">{t.allSub}</span>
          </span>
        </a>
      </div>
    </section>
  )
}
