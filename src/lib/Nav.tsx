import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { COPY } from '../copy'
import { scrollToId, scrollToTop } from './useLenis'
import { presentationResync } from './presentation'
import { routeTo, type View } from '../router'
import { PERSONAL_SITE, EPISODES_URL, ONE_ON_ONE_NAV } from '../intake'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

// order MUST match the home page's top-to-bottom flow: dims → engine → stack → fit
const SECTION_IDS = ['dims', 'engine', 'stack', 'fit'] as const

type Item = { label: string; ext?: boolean; href: string; go?: () => void }
type Group = { id: string; label: string; items: Item[]; activeIds?: readonly string[] }

/**
 * The one nav used everywhere (261117: 4 top-level entries + the Analyze button).
 * Engine / How it thinks / Pricing are dropdowns (hover or click on desktop,
 * tap-to-expand accordions on mobile); Vincent is a plain outbound link.
 * On a sub-page (sub=true) section links route home with the hash and Home
 * scrolls there on mount.
 */
export function Nav({ sub = false, active = '', navDark = false }: { sub?: boolean; active?: string; navDark?: boolean }) {
  const { lang, setLang } = useLang()
  const c = COPY[lang]
  const n = c.nav
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState('')
  const [mdrop, setMdrop] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!drop) return
    const off = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setDrop('') }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrop('') }
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [drop])

  const close = () => { setOpen(false); setDrop(''); setMdrop('') }
  const section = (id: string) => { if (sub) routeTo('home', '#' + id); else { scrollToId('#' + id, true); presentationResync() } close() }
  const viewTo = (v: View, q = '') => { window.dispatchEvent(new CustomEvent('trinity:navview', { detail: v })); routeTo(v, q); window.scrollTo(0, 0); close() }
  const home = () => { if (sub) routeTo('home'); else { scrollToTop(); presentationResync() } close() }

  const secLabel: Record<string, string> = { dims: n.dims, engine: n.howItWorks, stack: n.stack, fit: n.fit }
  const groups: Group[] = [
    { id: 'engine', label: n.engine, activeIds: SECTION_IDS,
      items: SECTION_IDS.map((id) => ({ label: secLabel[id], href: '#' + id, go: () => section(id) })) },
    { id: 'thinks', label: n.insight, items: [
      { label: n.insightPage, href: '/insight', go: () => viewTo('insight') },
      { label: n.episodes, href: EPISODES_URL, ext: true },
    ] },
    { id: 'pricing', label: n.pricing, items: [
      { label: n.report, href: '/analyze?plan=report', go: () => viewTo('analyze', '?plan=report') },
      { label: n.deck, href: '/deck', go: () => viewTo('materials') },
      { label: n.oneOnOne, href: ONE_ON_ONE_NAV, ext: true },
    ] },
  ]

  const link = (it: Item, cls = '') => it.ext
    ? <a key={it.label} className={cls} href={it.href} target="_blank" rel="noopener" data-cta={'nav:' + it.label} onClick={close}>{it.label} ↗</a>
    : <a key={it.label} className={cls} href={it.href} onClick={(e) => { e.preventDefault(); it.go?.() }}>{it.label}</a>

  return (
    <nav ref={navRef} className={`nav${navDark ? ' on-dark' : ''}${open ? ' menu-open' : ''}`}>
      <div className="nav-in">
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); home() }}>{LOGO} TRINITY</a>
        <div className="nav-links nav-center">
          {groups.map((g) => (
            <div className={`nav-dd${drop === g.id ? ' open' : ''}`} key={g.id}
              onMouseEnter={() => setDrop(g.id)} onMouseLeave={() => setDrop((d) => (d === g.id ? '' : d))}>
              <button type="button" className={`nav-dd-btn${g.activeIds?.includes(active as never) ? ' on' : ''}`}
                aria-expanded={drop === g.id} aria-haspopup="true"
                onClick={() => setDrop((d) => (d === g.id ? '' : g.id))}>
                {g.label}<span className="nav-caret" aria-hidden>▾</span>
              </button>
              <div className="nav-dd-menu" role="menu">
                {g.items.map((it) => link(it))}
              </div>
            </div>
          ))}
          <a href={PERSONAL_SITE} target="_blank" rel="noopener" className="nav-ext" data-cta="nav:vincent">{n.vincent} ↗</a>
        </div>
        <div className="nav-cta">
          {/* the label names the language you switch TO */}
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label={lang === 'en' ? '切換到中文' : 'Switch to English'} lang={lang === 'en' ? 'zh-Hant' : 'en'}>{lang === 'en' ? '中文' : 'EN'}</button>
          <button className="btn btn-primary nav-analyze" data-cta="nav:analyze" onClick={() => viewTo('analyze')}>{n.cta}</button>
          <button className={`nav-burger${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        {groups.map((g) => (
          <div className={`nav-mgroup${mdrop === g.id ? ' open' : ''}`} key={g.id}>
            <button type="button" className="nav-mgroup-btn" aria-expanded={mdrop === g.id}
              onClick={() => setMdrop((d) => (d === g.id ? '' : g.id))}>
              {g.label}<span className="nav-caret" aria-hidden>▾</span>
            </button>
            <div className="nav-mgroup-list">
              {g.items.map((it) => link(it))}
            </div>
          </div>
        ))}
        <a href={PERSONAL_SITE} target="_blank" rel="noopener" data-cta="nav:vincent" onClick={close}>{n.vincent} ↗</a>
        <button className="nav-mobile-cta" data-cta="nav:analyze" onClick={() => viewTo('analyze')}>{n.cta}</button>
      </div>
    </nav>
  )
}
