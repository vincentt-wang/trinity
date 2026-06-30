import { useEffect, useRef } from 'react'

const LENS_COLORS = ['#2563eb', '#64748b', '#d97706'] // earth / moon / sun

/**
 * Sui / Netflix-style living network: dimension nodes drift, link to nearby
 * neighbours with faint blue lines, and the whole field parallaxes to the mouse.
 * Light-theme friendly; honours prefers-reduced-motion.
 */
export function HeroNetwork() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    type Node = { x: number; y: number; vx: number; vy: number; c: string; r: number }
    let nodes: Node[] = []

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(28, Math.min(70, Math.floor((w * h) / 15000)))
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        c: LENS_COLORS[i % 3],
        r: 1.5 + Math.random() * 2.4,
      }))
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

    const LINK = 138
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
            ctx.strokeStyle = `rgba(37,99,235,${(1 - dist / LINK) * 0.26})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x + ox, a.y + oy)
            ctx.lineTo(b.x + ox, b.y + oy)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.globalAlpha = 0.85
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
  }, [])

  return <canvas ref={ref} className="hero-net" aria-hidden />
}
