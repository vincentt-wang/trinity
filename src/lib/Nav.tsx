import { useEffect, useRef, useState } from 'react'
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

type Sub = { id: string; label: string }

/**
 * The one nav used everywhere (261117 PM):
 *   logo · Engine▾ · Dimensions · Evidence · Principles · Articles · [EN/中] [Analyze my idea]
 * Engine: hover opens the menu on desktop, a click on the word goes to the top of home,
 * a click outside (or Esc) closes. The five items share one column width so the row reads even.
 * Mobile: the same five rows in the burger menu; Engine expands in place.
 */
export function Nav({ sub = false, active = '', navDark = false }: { sub?: boolean; active?: string; navDark?: boolean }) {
  const { lang, setLang } = useLang()
  const n = COPY[lang].nav
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  const [mdrop, setMdrop] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!drop) return
    const off = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setDrop(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrop(false) }
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [drop])

  const close = () => { setOpen(false); setDrop(false); setMdrop(false) }
  const section = (id: string) => { if (sub) routeTo('home', '#' + id); else { scrollToId('#' + id, true); presentationResync() } close() }
  const viewTo = (v: View, q = '') => { window.dispatchEvent(new CustomEvent('trinity:navview', { detail: v })); routeTo(v, q); window.scrollTo(0, 0); close() }
  const home = () => { if (sub) routeTo('home'); else { scrollToTop(); presentationResync() } close() }

  const subs: Sub[] = ENGINE_SECTIONS.map((id) => ({ id, label: n.sec[id] }))
  const engineOn = (ENGINE_SECTIONS as readonly string[]).includes(active)
  const flat = [
    { key: 'dims', label: n.dims, href: '/#dims', on: active === 'dims', go: () => section('dims') },
    { key: 'stack', label: n.evidence, href: '/#stack', on: active === 'stack', go: () => section('stack') },
    { key: 'deck', label: n.principles, href: '/deck', on: false, go: () => viewTo('materials') },
    { key: 'insight', label: n.articles, href: '/insight', on: false, go: () => viewTo('insight') },
  ]
  const subLink = (s: Sub) => (
    <a key={s.id} href={'/#' + s.id} role="menuitem" className={active === s.id ? 'on' : ''} onClick={(e) => { e.preventDefault(); section(s.id) }}>{s.label}</a>
  )

  return (
    <nav ref={navRef} className={`nav${navDark ? ' on-dark' : ''}${open ? ' menu-open' : ''}`} lang={lang === 'zh' ? 'zh-Hant' : 'en'}>
      <div className="nav-in">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); home() }}>{LOGO} TRINITY</a>
        <div className="nav-links nav-center nav-row">
          <div className={`nav-dd${drop ? ' open' : ''}`} onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
            <a href="/" className={`nav-item nav-dd-btn${engineOn ? ' on' : ''}`} aria-haspopup="true" aria-expanded={drop}
              onFocus={() => setDrop(true)}
              onClick={(e) => { e.preventDefault(); home() }}>
              <span className="nav-lbl">{n.engine}<span className="nav-caret" aria-hidden>▾</span></span>
            </a>
            <div className="nav-dd-menu" role="menu">{subs.map(subLink)}</div>
          </div>
          {flat.map((it) => (
            <a key={it.key} href={it.href} className={`nav-item${it.on ? ' on' : ''}`} onFocus={() => setDrop(false)}
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
        <div className={`nav-mgroup${mdrop ? ' open' : ''}`}>
          <button type="button" className="nav-mgroup-btn" aria-expanded={mdrop} onClick={() => setMdrop((d) => !d)}>
            {n.engine}<span className="nav-caret" aria-hidden>▾</span>
          </button>
          <div className="nav-mgroup-list">
            <a href="/" onClick={(e) => { e.preventDefault(); home() }}>{n.top}</a>
            {subs.map(subLink)}
          </div>
        </div>
        {flat.map((it) => (
          <a key={it.key} href={it.href} onClick={(e) => { e.preventDefault(); it.go() }}>{it.label}</a>
        ))}
        <button className="nav-mobile-cta" data-cta="nav:analyze" onClick={() => viewTo('analyze')}>{n.cta}</button>
      </div>
    </nav>
  )
}
