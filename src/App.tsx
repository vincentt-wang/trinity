import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Home from './Home'
import Analyze from './Analyze'
import Insight from './Insight'
import Materials from './Materials'
import { LangProvider } from './i18n'
import { viewFromLocation, routeTo, type View } from './router'

const EASE = [0.2, 0.7, 0.2, 1] as const

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

  return (
    <LangProvider>
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
    </LangProvider>
  )
}
