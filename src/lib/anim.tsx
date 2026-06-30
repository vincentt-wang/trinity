import { motion, useInView, animate } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Count a number up to `to` once it scrolls into view (Sui-style stat). */
export function CountUp({ to, duration = 1.7 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, duration])
  return <span ref={ref}>{val}</span>
}

/** Heading whose lines slide up from behind a mask, line by line (plays on mount). */
export function MaskLines({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <span className={className} style={{ display: 'block' }}>
      {lines.map((ln, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '.06em' }}>
          <motion.span
            style={{ display: 'block' }}
            initial={{ y: '108%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.15 + i * 0.11, ease: EASE }}
          >
            {ln}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** Staggered container: children rise + fade in sequence. */
export function Stagger({
  children,
  gap = 0.09,
  className,
}: {
  children: ReactNode[]
  gap?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px' }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children.map((c, i) => (
        <motion.div
          key={i}
          variants={{
            hide: { opacity: 0, y: 34, scale: 0.97 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
          }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  )
}
