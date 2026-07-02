import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Thin decorative orbit lines that draw themselves in (pathLength) as the
 * section scrolls into view. transform/opacity/stroke only, zero layout work.
 */
export function DrawArcs({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  const c1 = tone === 'light' ? 'rgba(147,197,253,.22)' : 'rgba(37,99,235,.15)'
  const c2 = tone === 'light' ? 'rgba(196,181,253,.18)' : 'rgba(124,58,237,.12)'
  const c3 = tone === 'light' ? 'rgba(252,211,77,.16)' : 'rgba(217,119,6,.12)'
  const arcs = [
    { d: 'M -60 700 Q 720 430 1500 660', c: c1, dur: 1.5, del: 0.05 },
    { d: 'M -60 210 Q 720 40 1500 250', c: c2, dur: 1.7, del: 0.22 },
    { d: 'M -60 470 Q 720 280 1500 420', c: c3, dur: 1.9, del: 0.4 },
  ]
  return (
    <svg className="amb-arcs" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {arcs.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.c}
          strokeWidth="1.4"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-18% 0px' }}
          transition={{ duration: p.dur, delay: p.del, ease: EASE }}
        />
      ))}
    </svg>
  )
}

/**
 * Two faint ring outlines drifting at different speeds while the section
 * scrolls past (soft parallax). Transform-only.
 */
export function ParallaxRings() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80])
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 60])
  const r = useTransform(scrollYProgress, [0, 1], [-8, 8])
  return (
    <div ref={ref} className="amb-rings" aria-hidden>
      <motion.span className="amb-ring r1" style={{ y: y1, rotate: r }} />
      <motion.span className="amb-ring r2" style={{ y: y2 }} />
    </div>
  )
}
