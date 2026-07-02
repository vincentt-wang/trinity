import { useEffect, useRef } from 'react'

const LENS_COLORS = ['#2563eb', '#64748b', '#d97706'] // earth / moon / sun
const LENS_COLORS_DARK = ['#93c5fd', '#cbd5e1', '#fcd34d'] // same lenses, tuned for dark bands

/**
 * Sui / Netflix-style living network: dimension nodes drift, link to nearby
 * neighbours with faint blue lines, with light pulses travelling along the
 * links and a mouse parallax. Light-theme friendly; honours reduced-motion.
 * `variant="ambient"` / `"ambient-dark"` render a low-density, low-opacity
 * constellation for section backgrounds.
 */
const amb2 = (v: string) => (v === 'hero' ? '' : ' amb')

export function HeroNetwork({ variant = 'hero' }: { variant?: 'hero' | 'ambient' | 'ambient-dark' }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const amb = variant !== 'hero'
    const dark = variant === 'ambient-dark'
    const palette = dark ? LENS_COLORS_DARK : LENS_COLORS
    const lineBase = dark ? '147,197,253' : '37,99,235'
    const lineA = amb ? (dark ? 0.16 : 0.12) : 0.26
    const nodeA = amb ? 0.4 : 0.85

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    type Node = { x: number; y: number; vx: number; vy: number; c: string; r: number }
    type Pulse = { a: number; b: number; t: number; spd: number; c: string }
    let nodes: Node[] = []
    let pulses: Pulse[] = []
    const LINK = 138

    const spawn = (): Pulse => {
      const a = (Math.random() * nodes.length) | 0
      // find a neighbour currently within link range, else any node
      const near: number[] = []
      for (let j = 0; j < nodes.length; j++) {
        if (j === a) continue
        const dx = nodes[a].x - nodes[j].x, dy = nodes[a].y - nodes[j].y
        if (dx * dx + dy * dy < LINK * LINK) near.push(j)
      }
      const b = near.length ? near[(Math.random() * near.length) | 0] : (a + 1) % nodes.length
      return { a, b, t: 0, spd: 0.006 + Math.random() * 0.01, c: nodes[a].c }
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = amb
        ? Math.max(12, Math.min(30, Math.floor((w * h) / 42000)))
        : Math.max(28, Math.min(70, Math.floor((w * h) / 15000)))
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        c: palette[i % 3],
        r: 1.5 + Math.random() * 2.4,
      }))
      pulses = reduce ? [] : Array.from({ length: amb ? Math.max(3, (count / 8) | 0) : Math.max(6, (count / 6) | 0) }, spawn)
    }
    build()

    const onResize = () => build()
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) / w - 0.5
      mouse.ty = (e.clientY - rect.top) / h - 0.5
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)

    const render = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      const ox = mouse.x * 26, oy = mouse.y * 26

      ctx.clearRect(0, 0, w, h)

      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy }
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(${lineBase},${(1 - dist / LINK) * lineA})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x + ox, a.y + oy)
            ctx.lineTo(b.x + ox, b.y + oy)
            ctx.stroke()
          }
        }
      }

      // travelling light pulses along links
      for (const p of pulses) {
        p.t += p.spd
        const a = nodes[p.a], b = nodes[p.b]
        if (p.t >= 1 || !a || !b) { Object.assign(p, spawn()); continue }
        const x = a.x + (b.x - a.x) * p.t + ox
        const y = a.y + (b.y - a.y) * p.t + oy
        const fade = Math.sin(p.t * Math.PI)
        ctx.globalAlpha = fade * (amb ? 0.55 : 1)
        ctx.fillStyle = p.c
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = fade * 0.25
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      for (const n of nodes) {
        ctx.globalAlpha = nodeA
        ctx.fillStyle = n.c
        ctx.beginPath()
        ctx.arc(n.x + ox, n.y + oy, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [variant])

  return <canvas ref={ref} className={`hero-net${amb2(variant)}`} aria-hidden />
}
