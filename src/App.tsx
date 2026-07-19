import { Suspense, lazy, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Home from './Home'
import { LangProvider } from './i18n'
import { viewFromLocation, routeTo, type View } from './router'

// Home ships in the entry chunk (it is the landing view); the three sub-pages
// are split out so a first visit does not download them.
const Analyze = lazy(() => import('./Analyze'))
const Insight = lazy(() => import('./Insight'))
const Materials = lazy(() => import('./Materials'))

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Holds the viewport while a split chunk lands, so the page does not collapse to zero height. */
function ViewFallback() {
  return <div style={{ minHeight: '100svh', background: 'var(--bg)' }} aria-busy="true" />
}

export default function App() {
  // view lives in the URL path (/, /analyze, /insight, /deck) so every page is shareable + indexable
  const [view, setView] = useState<View>(viewFromLocation)

  useEffect(() => {
    const sync = () => setView(viewFromLocation())
    window.addEventListener('popstate', sync)
    window.addEventListener('trinity:route', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('trinity:route', sync) }
  }, [])
  useEffect(() => {
    if (view !== 'home') window.scrollTo(0, 0) // a sub-page always opens at the top
  }, [view])
  // Warm the split chunks once the landing view is idle, so the first
  // navigation is instant and the Suspense fallback never actually shows.
  useEffect(() => {
    const warm = () => { void import('./Analyze'); void import('./Insight'); void import('./Materials') }
    const ric = window.requestIdleCallback
    if (ric) { const id = ric(warm, { timeout: 3000 }); return () => window.cancelIdleCallback?.(id) }
    const t = setTimeout(warm, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <LangProvider>
    {/* Suspense sits OUTSIDE AnimatePresence on purpose: a lazy child that
        suspends while mounted inside AnimatePresence gets dropped from its
        child list and the tree renders empty (blank /deck on a direct load). */}
    <Suspense fallback={<ViewFallback />}>
    <AnimatePresence mode="wait" initial={false}>
      {view === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Home onAnalyze={() => routeTo('analyze')} onInsight={() => routeTo('insight')} onMaterials={() => routeTo('materials')} />
        </motion.div>
      )}
      {view === 'materials' && (
        <motion.div
          key="materials"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Materials />
        </motion.div>
      )}
      {view === 'analyze' && (
        <motion.div
          key="analyze"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Analyze onBack={() => setView('home')} />
        </motion.div>
      )}
      {view === 'insight' && (
        <motion.div
          key="insight"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Insight onBack={() => routeTo('home')} onAnalyze={() => routeTo('analyze')} />
        </motion.div>
      )}
    </AnimatePresence>
    </Suspense>
    </LangProvider>
  )
}
