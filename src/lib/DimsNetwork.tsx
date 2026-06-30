import { useEffect, useRef } from 'react'
import { DIMENSIONS } from '../copy'
import type { Lang } from '../i18n'

type LensK = 'e' | 'm' | 's'
type Dim = { en: string; zh: string; de: string; dz: string }
const COL: Record<LensK, string> = { e: '#2563eb', m: '#64748b', s: '#d97706' }
const RGB: Record<LensK, [number, number, number]> = { e: [37, 99, 235], m: [100, 116, 139], s: [217, 119, 6] }

/**
 * EvoScale-style orbital network, retuned for Trinity's light theme and three
 * lenses. 3 tilted rings (one per lens) orbit at different speeds; nodes link to
 * their nearest neighbours with pulsing lines; a glowing core radiates spokes; a
 * cool light drifts toward the cursor; hovering a node sticks it and surfaces it.
 */
export function DimsNetwork({ activeLens, lang, onHover, onPick }: {
  activeLens: LensK
  lang: Lang
  onHover: (h: { k: LensK; d: Dim } | null) => void
  onPick: (k: LensK) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const live = useRef({ activeLens, lang, onHover, onPick })
  live.current = { activeLens, lang, onHover, onPick }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0, raf = 0, frame = 0, mx = -9999, my = -9999, hovI = -1, prevHov = -2
    let CX = 0, CY = 0, sunX = 0, sunY = 0

    type Node = { k: LensK; di: number; ring: number; angle: number; x: number; y: number; r: number; stickX: number | null; stickY: number | null }
    const RINGS = [
      { k: 's' as LensK, speed: 0.0011, tilt: 0.30, dir: 1, R: 0, Ry: 0 },
      { k: 'm' as LensK, speed: 0.0015, tilt: -0.22, dir: -1, R: 0, Ry: 0 },
      { k: 'e' as LensK, speed: 0.0019, tilt: 0.26, dir: 1, R: 0, Ry: 0 },
    ]
    let nodes: Node[] = []

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      CX = W / 2; CY = H / 2
      const base = Math.min(W, H) * 0.40
      RINGS[0].R = base * 1.0; RINGS[1].R = base * 0.72; RINGS[2].R = base * 0.46
      RINGS.forEach((r) => { r.Ry = r.R })
      nodes = []
      RINGS.forEach((ring, ri) => {
        const list = DIMENSIONS[ring.k]
        list.forEach((_, di) => {
          nodes.push({ k: ring.k, di, ring: ri, angle: di * (Math.PI * 2 / list.length) + ri * 0.6, x: 0, y: 0, r: W < 600 ? 8 : 11, stickX: null, stickY: null })
        })
      })
      if (sunX === 0) { sunX = CX; sunY = CY }
    }
    build()
    const onResize = () => build()
    window.addEventListener('resize', onResize)
    const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height) }
    const onLeave = () => { mx = -9999; my = -9999 }
    const onClick = () => { if (hovI >= 0) live.current.onPick(nodes[hovI].k) }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)

    const CD = 150
    const loop = () => {
      raf = requestAnimationFrame(loop)
      frame++
      ctx.clearRect(0, 0, W, H)
      const act = live.current.activeLens

      // cool drifting light, lags toward cursor
      const inN = mx > -9000
      const stx = inN ? mx : CX + Math.cos(frame * 0.004) * W * 0.3 + Math.cos(frame * 0.0018 + 1.3) * W * 0.1
      const sty = inN ? my : CY + Math.sin(frame * 0.0034 + 0.6) * H * 0.28 + Math.sin(frame * 0.0025 + 2.1) * H * 0.1
      sunX += (stx - sunX) * 0.025; sunY += (sty - sunY) * 0.025
      const sr = W < 600 ? 300 : 420
      const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sr)
      sg.addColorStop(0, 'rgba(96,165,250,0.16)')
      sg.addColorStop(0.4, 'rgba(124,58,237,0.07)')
      sg.addColorStop(1, 'rgba(124,58,237,0)')
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H)

      // positions
      nodes.forEach((nd, i) => {
        const ring = RINGS[nd.ring]
        if (i === hovI && inN) {
          const sx0 = nd.stickX ?? nd.x, sy0 = nd.stickY ?? nd.y
          const nx = sx0 + (mx - sx0) * 0.12, ny = sy0 + (my - sy0) * 0.12
          nd.stickX = nx; nd.stickY = ny; nd.x = nx; nd.y = ny
        } else {
          nd.stickX = null
          if (!reduce) nd.angle += ring.speed * ring.dir
          nd.x = CX + ring.R * Math.cos(nd.angle)
          nd.y = CY + ring.Ry * Math.sin(nd.angle) * Math.cos(ring.tilt)
        }
      })

      // hover detection
      hovI = -1; let mD = 9999
      nodes.forEach((nd, i) => { const dx = nd.x - mx, dy = nd.y - my, d = Math.sqrt(dx * dx + dy * dy); if (d < nd.r * 3.4 && d < mD) { mD = d; hovI = i } })
      if (hovI !== prevHov) {
        prevHov = hovI
        const h = hovI >= 0 ? { k: nodes[hovI].k, d: DIMENSIONS[nodes[hovI].k][nodes[hovI].di] } : null
        live.current.onHover(h)
      }

      // connection lines (range based) — pulsing, lens-tinted near hover
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < CD) {
            const near = i === hovI || j === hovI
            const pulse = 0.5 + 0.5 * Math.sin(frame * 0.018 + i * 0.8 + j * 0.5)
            if (near) {
              const c = RGB[nodes[hovI].k]
              ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.5)`
              ctx.lineWidth = 1.6
            } else {
              ctx.strokeStyle = `rgba(37,99,235,${(pulse * 0.10 + 0.03).toFixed(3)})`
              ctx.lineWidth = 0.7
            }
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke()
          }
        }
      }

      // core glow + spokes + disk
      const hubR = W < 600 ? 40 : 48
      for (let hi = 0; hi < nodes.length; hi++) {
        const nd = nodes[hi]
        const dxs = nd.x - CX, dys = nd.y - CY, ds = Math.sqrt(dxs * dxs + dys * dys) || 1
        const ux = dxs / ds, uy = dys / ds
        const sx = CX + ux * hubR, sy = CY + uy * hubR
        const ex = nd.x - ux * nd.r, ey = nd.y - uy * nd.r
        const isHn = hi === hovI
        const flow = 0.5 + 0.5 * Math.sin(frame * 0.02 - ds * 0.012 + hi * 0.6)
        const grad = ctx.createLinearGradient(sx, sy, ex, ey)
        if (isHn) {
          const c = RGB[nd.k]
          grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.5)`)
          grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0.08)`)
          ctx.lineWidth = 1.6
        } else {
          grad.addColorStop(0, `rgba(99,102,241,${(0.05 + flow * 0.07).toFixed(3)})`)
          grad.addColorStop(1, 'rgba(99,102,241,0)')
          ctx.lineWidth = 0.7
        }
        ctx.strokeStyle = grad
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
      }
      const br = 0.5 + 0.5 * Math.sin(frame * 0.02)
      const gR = W < 600 ? 150 : 200
      const glow = ctx.createRadialGradient(CX, CY, hubR * 0.3, CX, CY, gR)
      glow.addColorStop(0, `rgba(124,58,237,${(0.22 + br * 0.06).toFixed(3)})`)
      glow.addColorStop(0.4, `rgba(96,165,250,${(0.1 + br * 0.03).toFixed(3)})`)
      glow.addColorStop(1, 'rgba(96,165,250,0)')
      ctx.beginPath(); ctx.arc(CX, CY, gR, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill()
      // rotating dashed ring
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(frame * 0.0018)
      ctx.beginPath(); ctx.arc(0, 0, hubR + 10, 0, Math.PI * 2)
      ctx.setLineDash([3, 8]); ctx.strokeStyle = 'rgba(124,58,237,0.4)'; ctx.lineWidth = 1.2; ctx.stroke()
      ctx.setLineDash([]); ctx.restore()
      // core disk
      const disk = ctx.createRadialGradient(CX, CY - hubR * 0.5, hubR * 0.15, CX, CY, hubR * 1.02)
      disk.addColorStop(0, '#a9c2ff'); disk.addColorStop(0.5, '#5b7cf0'); disk.addColorStop(1, '#6d28d9')
      ctx.beginPath(); ctx.arc(CX, CY, hubR, 0, Math.PI * 2); ctx.fillStyle = disk; ctx.fill()
      ctx.beginPath(); ctx.arc(CX, CY, hubR - 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'; ctx.font = `700 ${W < 600 ? 26 : 32}px "Space Grotesk", sans-serif`
      ctx.fillText('55', CX, CY - (W < 600 ? 5 : 6))
      ctx.fillStyle = 'rgba(224,231,255,0.95)'; ctx.font = `600 ${W < 600 ? 8 : 9}px "Inter", sans-serif`
      ctx.fillText('DIMENSIONS', CX, CY + (W < 600 ? 11 : 13))
      ctx.restore()

      // nodes
      nodes.forEach((nd, i) => {
        const isH = i === hovI
        const hot = nd.k === act
        const c = COL[nd.k]
        const baseAlpha = hot ? 1 : 0.42
        const dotR = isH ? nd.r * 1.3 : nd.r
        // soft halo
        ctx.globalAlpha = isH ? 0.34 : hot ? 0.18 : 0.09
        ctx.fillStyle = c
        ctx.beginPath(); ctx.arc(nd.x, nd.y, isH ? nd.r * 2.8 : nd.r * 1.9, 0, Math.PI * 2); ctx.fill()
        // dot
        ctx.globalAlpha = isH ? 1 : baseAlpha
        if (isH) { ctx.shadowColor = c; ctx.shadowBlur = 20 }
        ctx.fillStyle = isH ? '#fff' : c
        ctx.beginPath(); ctx.arc(nd.x, nd.y, dotR, 0, Math.PI * 2); ctx.fill()
        if (isH) { ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(nd.x, nd.y, dotR, 0, Math.PI * 2); ctx.stroke() }
        // subtle inner sheen on every dot for a glossier look
        else if (hot) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(nd.x - dotR * 0.3, nd.y - dotR * 0.3, dotR * 0.32, 0, Math.PI * 2); ctx.fill() }
        ctx.globalAlpha = 1
      })

      // hovered label
      if (hovI >= 0) {
        const nd = nodes[hovI]
        const label = live.current.lang === 'en' ? DIMENSIONS[nd.k][nd.di].en : DIMENSIONS[nd.k][nd.di].zh
        ctx.font = `600 13px "Inter","Noto Sans TC",sans-serif`
        const tw = ctx.measureText(label).width
        const px = Math.min(Math.max(nd.x, tw / 2 + 14), W - tw / 2 - 14)
        const py = nd.y - 20
        ctx.fillStyle = 'rgba(14,18,48,0.92)'
        const pad = 9
        roundRect(ctx, px - tw / 2 - pad, py - 13, tw + pad * 2, 24, 7)
        ctx.fill()
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, px, py - 1)
        ctx.textAlign = 'start'
      }
    }
    const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r)
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath()
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  return <canvas ref={ref} className="dims-net" />
}
