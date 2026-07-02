import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Home from './Home'
import Analyze from './Analyze'
import Insight from './Insight'
import { LangProvider } from './i18n'

type View = 'home' | 'analyze' | 'insight'

const EASE = [0.2, 0.7, 0.2, 1] as const

export default function App() {
  const [view, setView] = useState<View>('home')

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
          <Home onAnalyze={() => setView('analyze')} onInsight={() => setView('insight')} />
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
