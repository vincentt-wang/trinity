import { useState } from 'react'
import { useLang } from '../i18n'
import { COPY } from '../copy'
import { scrollToId, scrollToTop } from './useLenis'
import { presentationResync } from './presentation'
import { routeTo, type View } from '../router'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

/** Home sections listed under "Engine", in page order (261117 PM). */
export const ENGINE_SECTIONS = ['celestial', 'engine', 'why', 'ba', 'founder'] as const
/** Every home section the nav can light up (scrollspy). */
export const NAV_SECTIONS = ['celestial', 'dims', 'engine', 'stack', 'why', 'ba', 'founder'] as const


/**
 * The one nav used everywhere (261117 late): five flat items, no dropdown.
 *   logo · Engine · Dimensions · Evidence · Principles · Articles · [EN/中] [Analyze my idea]
 * On home, a click glides to the section (eased scroll, never a jump).
 */
export function Nav({ sub = false, active = '', navDark = false }: { sub?: boolean; active?: string; navDark?: boolean }) {
  const { lang, setLang } = useLang()
  const n = COPY[lang].nav
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)
  // same page: glide there (no jump); from a sub-page: route home, Home scrolls to the hash
  const section = (id: string) => { if (sub) routeTo('home', '#' + id); else { scrollToId('#' + id); presentationResync() } close() }
  const viewTo = (v: View, q = '') => { window.dispatchEvent(new CustomEvent('trinity:navview', { detail: v })); routeTo(v, q); window.scrollTo(0, 0); close() }
  const home = () => { if (sub) routeTo('home'); else { scrollToTop(false); presentationResync() } close() }

  const engineOn = (ENGINE_SECTIONS as readonly string[]).includes(active)
  const items = [
    { key: 'engine', label: n.engine, href: '/', on: engineOn, go: home },
    { key: 'dims', label: n.dims, href: '/#dims', on: active === 'dims', go: () => section('dims') },
    { key: 'stack', label: n.evidence, href: '/#stack', on: active === 'stack', go: () => section('stack') },
    { key: 'deck', label: n.principles, href: '/deck', on: false, go: () => viewTo('materials') },
    { key: 'insight', label: n.articles, href: '/insight', on: false, go: () => viewTo('insight') },
  ]

  return (
    <nav className={`nav${navDark ? ' on-dark' : ''}${open ? ' menu-open' : ''}`} lang={lang === 'zh' ? 'zh-Hant' : 'en'}>
      <div className="nav-in">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); home() }}>{LOGO} TRINITY</a>
        <div className="nav-links nav-center nav-row">
          {items.map((it) => (
            <a key={it.key} href={it.href} className={`nav-item${it.on ? ' on' : ''}`}
              onClick={(e) => { e.preventDefault(); it.go() }}>{it.label}</a>
          ))}
        </div>
        <div className="nav-cta">
          {/* the label names the language you switch TO */}
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label={lang === 'en' ? '切換到中文' : 'Switch to English'} lang={lang === 'en' ? 'zh-Hant' : 'en'}>{lang === 'en' ? '中' : 'EN'}</button>
          <button className="btn btn-primary nav-analyze" data-cta="nav:analyze" onClick={() => viewTo('analyze')}>{n.cta}</button>
          <button className={`nav-burger${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        {items.map((it) => (
          <a key={it.key} href={it.href} onClick={(e) => { e.preventDefault(); it.go() }}>{it.label}</a>
        ))}
        <button className="nav-mobile-cta" data-cta="nav:analyze" onClick={() => viewTo('analyze')}>{n.cta}</button>
      </div>
    </nav>
  )
}
