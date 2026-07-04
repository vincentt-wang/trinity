import { useState } from 'react'
import { useLang } from '../i18n'
import { COPY } from '../copy'
import { scrollToId, scrollToTop } from './useLenis'
import { presentationResync } from './presentation'

const LOGO = (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="19" r="7.5" fill="#2563eb" />
    <circle cx="16" cy="13" r="5" fill="#475569" stroke="#fbfcff" strokeWidth="1.4" />
    <circle cx="16" cy="8" r="3" fill="#d97706" />
  </svg>
)

// order MUST match the home page's top-to-bottom flow: dims → engine → stack → fit
const SECTION_IDS = ['dims', 'engine', 'stack', 'fit'] as const

/**
 * The one nav used everywhere. On the home page section links smooth-scroll;
 * on a sub-page (sub=true) they set the URL hash so App routes back home and
 * Home scrolls to the section on mount. Sub-view links (deck / insight / analyze)
 * always drive the hash, so this works identically on every page.
 */
export function Nav({ sub = false, active = '', navDark = false }: { sub?: boolean; active?: string; navDark?: boolean }) {
  const { lang, setLang } = useLang()
  const c = COPY[lang]
  const [open, setOpen] = useState(false)
  const labels: Record<string, string> = { engine: c.nav.howItWorks, stack: c.nav.stack, dims: c.nav.dims, fit: c.nav.fit }
  // menu clicks jump straight to the section (no scrolling through / fast-forwarding pinned sections)
  const section = (id: string) => { if (sub) location.hash = id; else { scrollToId('#' + id, true); presentationResync() } setOpen(false) }
  const viewTo = (v: string) => { window.dispatchEvent(new CustomEvent('trinity:navview', { detail: v })); location.hash = v; window.scrollTo(0, 0); setOpen(false) }
  const home = () => { if (sub) location.hash = ''; else { scrollToTop(); presentationResync() } setOpen(false) }

  return (
    <nav className={`nav${navDark ? ' on-dark' : ''}${open ? ' menu-open' : ''}`}>
      <div className="nav-in">
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); home() }}>{LOGO} TRINITY</a>
        <div className="nav-links nav-center">
          {SECTION_IDS.map((id) => (
            <a key={id} className={active === id ? 'on' : ''} href={'#' + id} onClick={(e) => { e.preventDefault(); section(id) }}>{labels[id]}</a>
          ))}
          <a href="#insight" onClick={(e) => { e.preventDefault(); viewTo('insight') }}>{c.nav.insight}</a>
          <a href="#materials" onClick={(e) => { e.preventDefault(); viewTo('materials') }}>{c.nav.deck}</a>
        </div>
        <div className="nav-cta">
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">{lang === 'en' ? 'CH' : 'EN'}</button>
          <button className="btn btn-primary nav-analyze" onClick={() => viewTo('analyze')}>{c.nav.cta}</button>
          <button className={`nav-burger${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        {SECTION_IDS.map((id) => (
          <a key={id} href={'#' + id} onClick={(e) => { e.preventDefault(); section(id) }}>{labels[id]}</a>
        ))}
        <a href="#insight" onClick={(e) => { e.preventDefault(); viewTo('insight') }}>{c.nav.insight}</a>
        <a href="#materials" onClick={(e) => { e.preventDefault(); viewTo('materials') }}>{c.nav.deck}</a>
        <button className="nav-mobile-cta" onClick={() => viewTo('analyze')}>{c.nav.cta}</button>
      </div>
    </nav>
  )
}
