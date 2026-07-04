import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Home from './Home'
import Analyze from './Analyze'
import Insight from './Insight'
import Materials from './Materials'
import { LangProvider } from './i18n'

type View = 'home' | 'analyze' | 'insight' | 'materials'
const SUBVIEWS = ['analyze', 'insight', 'materials']
const viewFromHash = (): View => {
  const h = location.hash.replace(/^#\/?/, '')
  return SUBVIEWS.includes(h) ? (h as View) : 'home'
}

const EASE = [0.2, 0.7, 0.2, 1] as const

export default function App() {
  // view is mirrored in the URL hash so refresh / back-forward keep the page
  const [view, setView] = useState<View>(viewFromHash)

  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    if (view === 'home') {
      // clear only a sub-view hash; leave home section anchors (#celestial…) alone
      if (viewFromHash() !== 'home') history.replaceState(null, '', location.pathname + location.search)
    } else if (location.hash !== '#' + view) {
      location.hash = view
    }
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
          <Home onAnalyze={() => setView('analyze')} onInsight={() => setView('insight')} onMaterials={() => setView('materials')} />
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
          <Materials onBack={() => setView('home')} />
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
          <Insight onBack={() => setView('home')} onAnalyze={() => setView('analyze')} />
        </motion.div>
      )}
    </AnimatePresence>
    </LangProvider>
  )
}
