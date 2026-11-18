import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './lib/Reveal'
import { Aurora } from './lib/Aurora'
import { HeroNetwork } from './lib/HeroNetwork'
import { CountUp, MaskLines } from './lib/anim'
import { useLang, type Lang } from './i18n'
import { Nav } from './lib/Nav'
import { COPY } from './copy'
import { ARTICLE_PROSE, type ProseSection } from './insightArticles'
import { EpisodeList, EpisodeDetail, EpisodeNotPublished } from './Episodes'
import { EPISODES } from './episodeData'
import { epSlugFromLocation } from './router'

const EASE = [0.2, 0.7, 0.2, 1] as const
const EARTH = '#2563eb'
const MOON = '#475569'
const SUN = '#d97706'
const LENS_COLORS = [EARTH, MOON, SUN]
const LENS_SOFT = ['#dbeafe', '#e2e8f0', '#fef3c7']

const ARROW_R = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const LENS = new Set(['e', 'm', 's'])
const lensOf = (l: string) => (LENS.has(l) ? l : 'e')

type Table = { head: string[]; rows: string[][] }
type Ins = (typeof COPY)[Lang]['insight']
type Det = Ins['details']
type Shared = Det['shared']
type LS = 'p' | 'v' | 'f'
type VKey = 'strong' | 'cond' | 'keep' | 'pass'
type RKey = VKey | 'vfail' | 'ffail'

const VC: Record<VKey, string> = { strong: 'v-strong', cond: 'v-cond', keep: 'v-keep', pass: 'v-pass' }

const stateOf = (n: number): LS => (n >= 75 ? 'p' : n >= 50 ? 'v' : 'f')

/* The real synthesis matrix: D is the gate. */
function verdictOf(d: LS, f: LS, v: LS): { key: VKey; reason: RKey } {
  if (d === 'f') return { key: 'pass', reason: 'pass' }
  if (d === 'v') return { key: 'keep', reason: 'keep' }
  if (f === 'f') return { key: 'pass', reason: 'ffail' }
  if (v === 'f') return { key: 'pass', reason: 'vfail' }
  if (f === 'p' && v === 'p') return { key: 'strong', reason: 'strong' }
  return { key: 'cond', reason: 'cond' }
}

function fmtShort(n: number, lang: Lang, f: { big: string; mid: string; small: string }): string {
  const one = (x: number) => (x >= 100 ? Math.round(x).toLocaleString('en-US') : String(Math.round(x * 10) / 10))
  if (lang === 'zh') {
    if (n >= 1e8) return one(n / 1e8) + f.big
    if (n >= 1e4) return one(n / 1e4) + f.mid
    return Math.round(n).toLocaleString('en-US')
  }
  if (n >= 1e9) return one(n / 1e9) + f.big
  if (n >= 1e6) return one(n / 1e6) + f.mid
  if (n >= 1e3) return one(n / 1e3) + f.small
  return Math.round(n).toLocaleString('en-US')
}

function InsightTable({ t }: { t: Table }) {
  const cols = t.head.length
  return (
    <div className="insight-table" style={{ ['--cols' as string]: cols }}>
      <div className="insight-tr insight-thead">
        {t.head.map((h, i) => (
          <span key={i} className="insight-th">{h}</span>
        ))}
      </div>
      {t.rows.map((row, ri) => (
        <div className="insight-tr" key={ri}>
          {row.map((cell, ci) => (
            <span key={ci} className={`insight-td${ci === 0 ? ' lead-cell' : ''}`}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ===== detail scaffolding ===== */

function Sec({ label, cap, children }: { label: string; cap: string; children: ReactNode }) {
  return (
    <Reveal>
      <section className="id-sec">
        <div className="id-label">{label}</div>
        <div className="id-fig">{children}</div>
        <p className="id-cap">{cap}</p>
      </section>
    </Reveal>
  )
}

function Tool({ label, title, note, children }: { label: string; title: string; note: string; children: ReactNode }) {
  return (
    <Reveal>
      <section className="id-sec">
        <div className="id-label">{label}</div>
        <div className="id-tool">
          <div className="id-tool-t">{title}</div>
          <p className="id-tool-n">{note}</p>
          {children}
        </div>
      </section>
    </Reveal>
  )
}

function Chips({ items, sel, onSel }: { items: string[]; sel: number; onSel: (i: number) => void }) {
  return (
    <div className="id-chips">
      {items.map((x, i) => (
        <button key={i} type="button" className="id-chip" aria-pressed={sel === i} onClick={() => onSel(i)}>{x}</button>
      ))}
    </div>
  )
}

function VerdictRow({ v, sh }: { v: { key: VKey; reason: RKey }; sh: Shared }) {
  return (
    <div className="id-verdict">
      <span className={`v-chip ${VC[v.key]}`}>{sh.verdicts[v.key]}</span>
      <span className="id-reason">{sh.reasons[v.reason]}</span>
    </div>
  )
}

/* ===== SVG visuals (all inline, no libs) ===== */

function SvgBlindLenses({ ideaLabel, names }: { ideaLabel: string; names: string[] }) {
  const ys = [45, 125, 205]
  return (
    <svg viewBox="0 0 560 250" aria-hidden>
      <circle cx="80" cy="125" r="30" fill="#eef2ff" stroke={EARTH} strokeWidth="1.6" />
      <circle cx="80" cy="125" r="6" fill={EARTH} />
      <text x="80" y="186" textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{ideaLabel}</text>
      {ys.map((cy) => (
        <path key={cy} d={`M112 125 C 200 125 230 ${cy} 304 ${cy}`} fill="none" stroke="#cbd5e1" strokeWidth="1.6" />
      ))}
      {ys.map((cy, i) => (
        <g key={i}>
          <rect x="310" y={cy - 35} width="235" height="70" rx="14" fill="#fff" stroke="#d4d9e8" strokeWidth="1.4" strokeDasharray="6 5" />
          <circle cx="350" cy={cy} r="24" fill={LENS_SOFT[i]} stroke={LENS_COLORS[i]} strokeWidth="1.6" />
          <text x="350" y={cy + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={LENS_COLORS[i]}>{'DFV'[i]}</text>
          <text x="388" y={cy + 6} fontSize="16" fontWeight="600" fill="#0e1230">{names[i]}</text>
        </g>
      ))}
    </svg>
  )
}

function SvgRadar({ names }: { names: string[] }) {
  const cx = 210, cy = 180, R = 130
  const dirs = [[0, -1], [-0.866, 0.5], [0.866, 0.5]]
  const pt = (i: number, t: number) => `${cx + dirs[i][0] * R * t},${cy + dirs[i][1] * R * t}`
  const grid = [1 / 3, 2 / 3, 1].map((t) => [pt(0, t), pt(1, t), pt(2, t)].join(' '))
  const data = [0.8, 0.55, 0.65]
  const dataPts = data.map((t, i) => pt(i, t)).join(' ')
  const labelPos = [[210, 30], [92, 274], [328, 274]]
  return (
    <svg viewBox="0 0 420 310" aria-hidden>
      {grid.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="#e6e9f2" strokeWidth="1.4" />
      ))}
      {dirs.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i, 1).split(',')[0]} y2={pt(i, 1).split(',')[1]} stroke="#e6e9f2" strokeWidth="1.2" />
      ))}
      <polygon points={dataPts} fill="rgba(37,99,235,.14)" stroke={EARTH} strokeWidth="2" />
      {data.map((t, i) => {
        const [x, y] = pt(i, t).split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="6" fill={LENS_COLORS[i]} />
      })}
      {labelPos.map(([x, y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" fontSize="16" fontWeight="600" fill={LENS_COLORS[i]}>{names[i]}</text>
      ))}
    </svg>
  )
}

function SvgPipeline() {
  const nums = ['01', '02', '03', '04', '05', '06', '07']
  return (
    <svg viewBox="0 0 640 100" aria-hidden>
      <line x1="40" y1="50" x2="604" y2="50" stroke="#e6e9f2" strokeWidth="2" />
      {nums.map((n, i) => {
        const x = 68 + i * 84
        const hot = i === 4
        return (
          <g key={n}>
            <circle cx={x} cy="50" r="21" fill={hot ? '#dbeafe' : '#fff'} stroke={hot ? EARTH : '#d4d9e8'} strokeWidth="1.6" />
            <text x={x} y="56" textAnchor="middle" fontSize="16" fontWeight="700" fill={hot ? EARTH : '#3f4663'}>{n}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SvgCrossLinks({ names }: { names: string[] }) {
  const nodes = [[210, 64], [96, 262], [324, 262]]
  const arrows: [string, number][] = [
    ['M186 84 Q120 150 102 230', 0],
    ['M120 242 Q176 178 202 96', 1],
    ['M130 276 Q210 306 290 276', 1],
    ['M292 250 Q210 228 130 250', 2],
    ['M318 234 Q298 148 234 86', 2],
    ['M226 96 Q252 178 300 240', 0],
  ]
  const mk = ['mkE', 'mkM', 'mkS']
  return (
    <svg viewBox="0 0 420 336" aria-hidden>
      <defs>
        {mk.map((id, i) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill={LENS_COLORS[i]} />
          </marker>
        ))}
      </defs>
      {arrows.map(([p, ci], i) => (
        <path key={i} d={p} fill="none" stroke={LENS_COLORS[ci]} strokeWidth="1.8" markerEnd={`url(#${mk[ci]})`} opacity=".85" />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="30" fill={LENS_SOFT[i]} stroke={LENS_COLORS[i]} strokeWidth="1.8" />
          <text x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="700" fill={LENS_COLORS[i]}>{'DFV'[i]}</text>
          <text x={x} y={i === 0 ? y - 44 : y + 58} textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{names[i]}</text>
        </g>
      ))}
    </svg>
  )
}

function SvgGate({ names }: { names: string[] }) {
  return (
    <svg viewBox="0 0 560 230" aria-hidden>
      <circle cx="66" cy="115" r="24" fill="#eef2ff" stroke="#cbd5e1" strokeWidth="1.6" />
      <circle cx="66" cy="115" r="5" fill="#71789a" />
      <line x1="96" y1="115" x2="164" y2="115" stroke="#cbd5e1" strokeWidth="1.8" />
      <path d="M158 109l12 6-12 6z" fill="#cbd5e1" />
      <rect x="229" y="12" width="14" height="60" rx="4" fill="#e2e8f0" />
      <rect x="229" y="158" width="14" height="60" rx="4" fill="#e2e8f0" />
      <rect x="176" y="74" width="120" height="82" rx="16" fill="#dbeafe" stroke={EARTH} strokeWidth="1.8" />
      <text x="236" y="110" textAnchor="middle" fontSize="22" fontWeight="700" fill={EARTH}>D</text>
      <text x="236" y="138" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1e40af">{names[0]}</text>
      <path d="M300 115 C 344 115 356 60 386 60" fill="none" stroke="#cbd5e1" strokeWidth="1.8" />
      <path d="M300 115 C 344 115 356 170 386 170" fill="none" stroke="#cbd5e1" strokeWidth="1.8" />
      <circle cx="416" cy="60" r="24" fill={LENS_SOFT[1]} stroke={MOON} strokeWidth="1.6" />
      <text x="416" y="66" textAnchor="middle" fontSize="17" fontWeight="700" fill={MOON}>F</text>
      <text x="452" y="66" fontSize="16" fontWeight="600" fill="#0e1230">{names[1]}</text>
      <circle cx="416" cy="170" r="24" fill={LENS_SOFT[2]} stroke={SUN} strokeWidth="1.6" />
      <text x="416" y="176" textAnchor="middle" fontSize="17" fontWeight="700" fill={SUN}>V</text>
      <text x="452" y="176" fontSize="16" fontWeight="600" fill="#0e1230">{names[2]}</text>
    </svg>
  )
}

function SvgTimeline({ labels }: { labels: string[] }) {
  return (
    <svg viewBox="0 0 640 110" aria-hidden>
      <line x1="40" y1="46" x2="598" y2="46" stroke="#e6e9f2" strokeWidth="2" />
      <path d="M594 40l14 6-14 6z" fill="#cbd5e1" />
      {labels.map((l, i) => {
        const x = 68 + i * 126
        return (
          <g key={i}>
            <circle cx={x} cy="46" r={6 + i * 1.6} fill={i === labels.length - 1 ? SUN : EARTH} opacity={0.55 + i * 0.11} />
            <text x={x} y="90" textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{l}</text>
          </g>
        )
      })}
    </svg>
  )
}

const STAGE_WEIGHTS = [
  [35, 45, 20],
  [45, 25, 30],
  [25, 25, 50],
  [20, 20, 60],
]

function SvgStageBars({ stages, names }: { stages: string[]; names: string[] }) {
  const base = 250
  return (
    <svg viewBox="0 0 560 300" aria-hidden>
      {names.map((n, i) => (
        <g key={i}>
          <rect x={56 + i * 172} y="14" width="14" height="14" rx="4" fill={LENS_COLORS[i]} />
          <text x={76 + i * 172} y="26" fontSize="16" fontWeight="600" fill="#3f4663">{n}</text>
        </g>
      ))}
      <line x1="40" y1={base} x2="550" y2={base} stroke="#e6e9f2" strokeWidth="1.6" />
      {STAGE_WEIGHTS.map((w, g) => {
        const x0 = 62 + g * 126
        return (
          <g key={g}>
            {w.map((v, b) => {
              const h = v * 3
              const x = x0 + b * 32
              return (
                <g key={b}>
                  <rect x={x} y={base - h} width="24" height={h} rx="6" fill={LENS_COLORS[b]} opacity=".82" />
                  <text x={x + 12} y={base - h - 8} textAnchor="middle" fontSize="16" fontWeight="600" fill="#71789a">{v}</text>
                </g>
              )
            })}
            <text x={x0 + 44} y={base + 30} textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{stages[g]}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SvgSpectrum({ founderLabel, spectrum }: { founderLabel: string; spectrum: string[] }) {
  const radii = [13, 16, 19, 22, 26]
  const strokes = [EARTH, EARTH, MOON, SUN, SUN]
  return (
    <svg viewBox="0 0 675 190" aria-hidden>
      <circle cx="66" cy="84" r="26" fill="#eef2ff" stroke={EARTH} strokeWidth="1.8" />
      <circle cx="66" cy="84" r="5.5" fill={EARTH} />
      <text x="66" y="136" textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{founderLabel}</text>
      {spectrum.map((s, i) => {
        const x = 235 + i * 92
        return (
          <g key={i}>
            <line x1="94" y1="84" x2={x - radii[i] - 4} y2="84" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx={x} cy="84" r={radii[i]} fill="#fff" stroke={strokes[i]} strokeWidth="1.8" />
            <text x={x} y={i % 2 === 0 ? 138 : 164} textAnchor="middle" fontSize="16" fontWeight="600" fill="#3f4663">{s}</text>
          </g>
        )
      })}
    </svg>
  )
}

const HEAT = [
  [2, 1, 0, 0],
  [2, 2, 0, 0],
  [2, 1, 0, 0],
  [1, 2, 1, 0],
  [0, 1, 2, 2],
  [0, 0, 1, 2],
]

function SvgHeatmap({ rows, cols, sel }: { rows: string[]; cols: string[]; sel: number }) {
  const x0 = 180, cw = 100, step = 108, y0 = 40, ch = 40, ystep = 46
  return (
    <svg viewBox="0 0 620 310" aria-hidden>
      {cols.map((c, i) => (
        <text key={i} x={x0 + i * step + cw / 2} y="24" textAnchor="middle" fontSize="16" fontWeight="700" fill={sel === i ? '#0e1230' : '#71789a'}>{c}</text>
      ))}
      {HEAT.map((row, r) => (
        <g key={r}>
          <text x="168" y={y0 + r * ystep + 26} textAnchor="end" fontSize="16" fontWeight="600" fill="#3f4663">{rows[r]}</text>
          {row.map((v, cI) => (
            <rect
              key={cI}
              x={x0 + cI * step}
              y={y0 + r * ystep}
              width={cw}
              height={ch}
              rx="9"
              fill={v === 2 ? EARTH : v === 1 ? EARTH : '#eef1f7'}
              opacity={v === 2 ? 0.88 : v === 1 ? 0.3 : 1}
            />
          ))}
        </g>
      ))}
      <rect x={x0 + sel * step - 5} y={y0 - 5} width={cw + 10} height={6 * ystep - 6 + 10} rx="12" fill="none" stroke={SUN} strokeWidth="2.4" />
    </svg>
  )
}

function SvgPyramid({ pyr }: { pyr: string[] }) {
  const widths = [430, 340, 250, 180, 120]
  const fills = ['#dbeafe', '#c7d2fe', '#e2e8f0', '#fef3c7']
  const strokes = ['#93c5fd', '#a5b4fc', '#cbd5e1', '#fcd34d']
  const cx = 240
  return (
    <svg viewBox="0 0 480 300" aria-hidden>
      {pyr.map((l, i) => {
        const y = 12 + i * 70
        const wt = widths[i], wb = widths[i + 1]
        const pts = `${cx - wt / 2},${y} ${cx + wt / 2},${y} ${cx + wb / 2},${y + 60} ${cx - wb / 2},${y + 60}`
        return (
          <g key={i}>
            <polygon points={pts} fill={fills[i]} stroke={strokes[i]} strokeWidth="1.4" />
            <text x={cx} y={y + 36} textAnchor="middle" fontSize="16" fontWeight="600" fill="#0e1230">{l}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SvgLognormal() {
  const curve = 'M40 210 C70 208 92 62 142 62 C192 62 250 152 330 182 C410 202 480 208 540 209'
  const marks: [number, number, string][] = [[90, 108, 'P10'], [190, 118, 'P50'], [400, 190, 'P90']]
  return (
    <svg viewBox="0 0 560 260" aria-hidden>
      <path d={`${curve} L540 210 L40 210 Z`} fill="rgba(37,99,235,.10)" stroke="none" />
      <path d={curve} fill="none" stroke={EARTH} strokeWidth="2" />
      <line x1="40" y1="210" x2="540" y2="210" stroke="#d4d9e8" strokeWidth="1.6" />
      {marks.map(([x, y, l]) => (
        <g key={l}>
          <line x1={x} y1="210" x2={x} y2={y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5" />
          <text x={x} y={y - 10} textAnchor="middle" fontSize="16" fontWeight="700" fill={l === 'P10' ? SUN : '#3f4663'}>{l}</text>
        </g>
      ))}
    </svg>
  )
}

function StateDot({ s, color }: { s: LS; color: string }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <circle cx="9" cy="9" r="7" fill={s === 'p' ? color : 'none'} stroke={color} strokeWidth="2" />
      {s === 'v' && <path d="M9 2 A7 7 0 0 1 9 16 Z" fill={color} />}
    </svg>
  )
}

/* ===== the six detail bodies ===== */

function Detail1({ d, sh, prose }: { d: Det['d1']; sh: Shared; prose: ProseSection[] }) {
  const [vals, setVals] = useState([85, 40, 62])
  const names = [sh.lens.d, sh.lens.f, sh.lens.v]
  const v = verdictOf(stateOf(vals[0]), stateOf(vals[1]), stateOf(vals[2]))
  const weak = names[vals.indexOf(Math.min(...vals))]
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}><SvgBlindLenses ideaLabel={d.ideaLabel} names={names} /></Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Sec label={sh.analysis} cap={d.chartCap}><SvgRadar names={names} /></Sec>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <div className="id-sliders">
          {vals.map((val, i) => (
            <div className="id-srow" key={i}>
              <div className="id-sl"><span style={{ color: LENS_COLORS[i] }}>{names[i]}</span><span>{val}</span></div>
              <input
                type="range" min={0} max={100} value={val}
                style={{ accentColor: LENS_COLORS[i] }}
                onChange={(e) => setVals(vals.map((x, j) => (j === i ? Number(e.target.value) : x)))}
              />
              <div className="id-bar"><span style={{ width: `${val}%`, background: LENS_COLORS[i] }} /></div>
            </div>
          ))}
        </div>
        <VerdictRow v={v} sh={sh} />
        <p className="id-note">{d.weakest}: <strong>{weak}</strong></p>
      </Tool>
    </>
  )
}

function Detail2({ d, sh, points, prose }: { d: Det['d2']; sh: Shared; points: string[]; prose: ProseSection[] }) {
  const [pi, setPi] = useState(0)
  const names = [sh.lens.d, sh.lens.f, sh.lens.v]
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}>
        <SvgPipeline />
        <ul className="insight-list id-steps">
          {points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Sec label={sh.analysis} cap={d.chartCap}><SvgCrossLinks names={names} /></Sec>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <Chips items={d.presets.map((p) => p.label)} sel={pi} onSel={setPi} />
        <div className="id-read">{d.presets[pi].read}</div>
      </Tool>
    </>
  )
}

function Detail3({ d, sh, table, prose }: { d: Det['d3']; sh: Shared; table: Table | null; prose: ProseSection[] }) {
  const [st, setSt] = useState<LS[]>(['p', 'v', 'p'])
  const names = [sh.lens.d, sh.lens.f, sh.lens.v]
  const cycle = (i: number) => setSt(st.map((s, j) => (j === i ? (s === 'p' ? 'v' : s === 'v' ? 'f' : 'p') : s)) as LS[])
  const v = verdictOf(st[0], st[1], st[2])
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}><SvgGate names={names} /></Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Reveal>
        <section className="id-sec">
          <div className="id-label">{sh.analysis}</div>
          {table && <InsightTable t={table} />}
          <p className="id-cap">{d.chartCap}</p>
        </section>
      </Reveal>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <div className="id-chips">
          {names.map((n, i) => (
            <button key={i} type="button" className="id-tri" onClick={() => cycle(i)}>
              <StateDot s={st[i]} color={LENS_COLORS[i]} />
              <span>{n}</span>
              <span className="id-tri-s">{d.states[st[i]]}</span>
            </button>
          ))}
        </div>
        <VerdictRow v={v} sh={sh} />
      </Tool>
    </>
  )
}

function Detail4({ d, sh, prose }: { d: Det['d4']; sh: Shared; prose: ProseSection[] }) {
  const [si, setSi] = useState(0)
  const names = [sh.lens.d, sh.lens.f, sh.lens.v]
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}><SvgTimeline labels={d.stages.map((s) => s.label)} /></Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Sec label={sh.analysis} cap={d.chartCap}><SvgStageBars stages={d.chartStages} names={names} /></Sec>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <Chips items={d.stages.map((s) => s.label)} sel={si} onSel={setSi} />
        <div className="id-duo">
          <div className="id-cell">
            <div className="id-cell-k">{d.proveL}</div>
            <div className="id-cell-v">{d.stages[si].prove}</div>
          </div>
          <div className="id-cell id-cell-bad">
            <div className="id-cell-k">{d.gapL}</div>
            <div className="id-cell-v">{d.stages[si].gap}</div>
          </div>
        </div>
      </Tool>
    </>
  )
}

function Detail5({ d, sh, prose }: { d: Det['d5']; sh: Shared; prose: ProseSection[] }) {
  const [si, setSi] = useState(1)
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}><SvgSpectrum founderLabel={d.founderLabel} spectrum={d.spectrum} /></Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Sec label={sh.analysis} cap={d.chartCap}><SvgHeatmap rows={d.heatRows} cols={d.heatCols} sel={si} /></Sec>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <Chips items={d.heatCols} sel={si} onSel={setSi} />
        <div className="id-cell id-doors-cell">
          <div className="id-cell-k">{d.doorsL}</div>
          <ul className="id-doors">
            {d.doors[si].map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
        <p className="id-note">{d.doorsNote}</p>
      </Tool>
    </>
  )
}

function Detail6({ d, sh, lang, prose }: { d: Det['d6']; sh: Shared; lang: Lang; prose: ProseSection[] }) {
  const [exp, setExp] = useState(5)
  const [pen, setPen] = useState(5)
  const [arpu, setArpu] = useState(12000)
  const [freq, setFreq] = useState(1)
  const [sc, setSc] = useState(1)
  const K = [0.8, 1, 1.15]
  const aud = 10 ** exp
  const tam = aud * (pen / 100) * arpu * freq * K[sc]
  const rows: { l: string; val: string; min: number; max: number; step: number; get: number; set: (n: number) => void }[] = [
    { l: d.audL, val: fmtShort(aud, lang, d.fmt), min: 3, max: 8, step: 1, get: exp, set: setExp },
    { l: d.penL, val: `${pen}%`, min: 1, max: 40, step: 1, get: pen, set: setPen },
    { l: d.arpuL, val: `NT$${arpu.toLocaleString('en-US')}`, min: 1000, max: 30000, step: 500, get: arpu, set: setArpu },
    { l: d.freqL, val: `${freq}x`, min: 1, max: 12, step: 1, get: freq, set: setFreq },
  ]
  return (
    <>
      {prose[0] && <ProseSec s={prose[0]} />}
      <Sec label={sh.scenario} cap={d.scenarioCap}><SvgPyramid pyr={d.pyr} /></Sec>
      {prose[1] && <ProseSec s={prose[1]} />}
      <Sec label={sh.analysis} cap={d.chartCap}><SvgLognormal /></Sec>
      {prose[2] && <ProseSec s={prose[2]} />}
      <Tool label={sh.tool} title={d.toolTitle} note={d.toolNote}>
        <div className="id-sliders">
          {rows.map((r, i) => (
            <div className="id-srow" key={i}>
              <div className="id-sl"><span>{r.l}</span><span>{r.val}</span></div>
              <input
                type="range" min={r.min} max={r.max} step={r.step} value={r.get}
                style={{ accentColor: EARTH }}
                onChange={(e) => r.set(Number(e.target.value))}
              />
            </div>
          ))}
        </div>
        <div className="id-scen">
          <div className="id-cell-k">{d.scenT}</div>
          <div className="id-chips">
            {d.scens.map((s, i) => (
              <button key={i} type="button" className="id-chip" aria-pressed={sc === i} onClick={() => setSc(i)}>{s} x{K[i]}</button>
            ))}
          </div>
        </div>
        <div className="id-tam">
          <span className="id-tam-l">{d.tamL}</span>
          <span className="id-tam-v">NT${fmtShort(tam, lang, d.fmt)}</span>
          <span className="id-tam-l">{d.fmt.per}</span>
        </div>
      </Tool>
    </>
  )
}

/* ===== featured article (the flagship template) ===== */

type Feat = Ins['featured']
type FVKey = 'pass' | 'cond' | 'risk'

/* CB Insights, startup failure post-mortems, 2019-2024. Do not alter. */
const FEAT_VALS = [70, 43, 29, 19]
const FEAT_COLS = ['#71789a', EARTH, MOON, SUN]
const FEAT_INKS = ['#1e40af', '#334155', '#92400e']
const FV_CHIP: Record<FVKey, string> = { pass: 'v-strong', cond: 'v-cond', risk: 'v-pass' }

const WAVE = (() => {
  let d = 'M-160 0 Q -140 -7 -120 0'
  for (let x = -80; x <= 760; x += 40) d += ` T ${x} 0`
  return d
})()

function SvgIceberg({ ice }: { ice: Feat['iceberg'] }) {
  const strata: { pts: string; fill: string; stroke: string; y: number; leadX: number }[] = [
    { pts: '160,118 270,118 322,196 106,196', fill: 'rgba(37,99,235,.18)', stroke: EARTH, y: 162, leadX: 300 },
    { pts: '106,196 322,196 298,266 124,266', fill: 'rgba(71,85,105,.16)', stroke: MOON, y: 236, leadX: 310 },
    { pts: '124,266 298,266 244,330 172,330', fill: 'rgba(217,119,6,.15)', stroke: SUN, y: 302, leadX: 272 },
  ]
  return (
    <svg viewBox="0 0 640 352" aria-hidden>
      <rect x="0" y="118" width="640" height="234" fill="rgba(37,99,235,.06)" />
      {strata.map((s, i) => (
        <g key={i}>
          <polygon points={s.pts} fill={s.fill} stroke={s.stroke} strokeWidth="1.3" />
          <line x1={s.leadX} y1={s.y - 5} x2="344" y2={s.y - 5} stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="352" y={s.y} fontSize="16" fontWeight="700" fill={FEAT_INKS[i]}>{ice.strata[i]}</text>
        </g>
      ))}
      <polygon points="160,118 184,50 212,76 240,40 270,118" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.6" />
      <line x1="252" y1="78" x2="344" y2="62" stroke="#94a3b8" strokeWidth="1.2" />
      <text x="352" y="67" fontSize="16" fontWeight="700" fill="#0e1230">{ice.symptom}</text>
      <g transform="translate(0 118)">
        <path d={WAVE} fill="none" stroke={EARTH} strokeWidth="2" opacity=".45">
          <animateTransform attributeName="transform" type="translate" values="0 0;-80 0" dur="7s" repeatCount="indefinite" />
        </path>
        <g transform="translate(46 5)">
          <path d={WAVE} fill="none" stroke={EARTH} strokeWidth="1.6" opacity=".22">
            <animateTransform attributeName="transform" type="translate" values="0 0;-80 0" dur="11s" repeatCount="indefinite" />
          </path>
        </g>
      </g>
    </svg>
  )
}

function FeatChart({ ch }: { ch: Feat['chart'] }) {
  const rows = FEAT_VALS.map((v, i) => ({ v, label: ch.bars[i], c: FEAT_COLS[i] }))
  const tops = [62, 188, 254, 320]
  return (
    <svg viewBox="0 0 640 356" aria-hidden>
      <text x="0" y="20" fontSize="16" fontWeight="700" letterSpacing="1.5" fill="#71789a">{ch.symptomTag}</text>
      <line x1="0" y1="122" x2="640" y2="122" stroke="#e6e9f2" strokeWidth="1.4" />
      <text x="0" y="150" fontSize="16" fontWeight="700" letterSpacing="1.5" fill="#71789a">{ch.rootsTag}</text>
      {rows.map((r, i) => {
        const y = tops[i]
        const w = r.v * 5.2
        return (
          <g key={i}>
            <text x="0" y={y - 10} fontSize="17" fontWeight="600" fill="#0e1230">{r.label}</text>
            <motion.rect
              x="0" y={y} height="22" rx="6" fill={r.c} opacity={i === 0 ? 0.75 : 0.88}
              initial={{ width: 0 }}
              whileInView={{ width: w }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.14, ease: EASE }}
            />
            <motion.text
              x={w + 14} y={y + 17} fontSize="17" fontWeight="700" fill={r.c}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.14, ease: EASE }}
            >{r.v}%</motion.text>
          </g>
        )
      })}
    </svg>
  )
}

/* Renders **marked** key phrases as lens-colored <strong>. */
function Hl({ t, c }: { t: string; c: string }) {
  const parts = t.split('**')
  return <>{parts.map((s, i) => (i % 2 === 1 ? <strong key={i} style={{ color: c }}>{s}</strong> : s))}</>
}

function ProseSec({ s }: { s: { h: string; ps: { t: string; l: number }[] } }) {
  return (
    <Reveal>
      <section className="id-sec if-prose">
        <h2 className="if-prose-h">{s.h}</h2>
        {s.ps.map((p, i) => (
          <p key={i} className="if-prose-p"><Hl t={p.t} c={FEAT_INKS[p.l]} /></p>
        ))}
      </section>
    </Reveal>
  )
}

function FeatTool({ f, sh }: { f: Feat; sh: Shared }) {
  const [ans, setAns] = useState<(boolean | null)[]>([null, null, null, null, null])
  const yes = ans.filter((a) => a === true).length
  const no = ans.filter((a) => a === false).length
  const done = yes + no === 5
  let v: FVKey | null = null
  if (no >= 3) v = 'risk'
  else if (done) v = yes === 5 ? 'pass' : 'cond'
  else if (yes + no > 0) v = 'cond'
  const set = (i: number, val: boolean) => setAns((prev) => prev.map((a, j) => (j === i ? val : a)))
  return (
    <Tool label={sh.tool} title={f.toolTitle} note={f.toolNote}>
      <div className="if-qs">
        {f.questions.map((q, i) => (
          <div key={i} className={`if-q${ans[i] === true ? ' if-q-y' : ans[i] === false ? ' if-q-n' : ''}`}>
            <span className="if-q-idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="if-q-t">{q}</span>
            <div className="if-q-btns">
              <button type="button" className="id-chip if-yes" aria-pressed={ans[i] === true} onClick={() => set(i, true)}>{f.yes}</button>
              <button type="button" className="id-chip if-no" aria-pressed={ans[i] === false} onClick={() => set(i, false)}>{f.no}</button>
            </div>
          </div>
        ))}
      </div>
      {v && (
        <motion.div key={v} className="id-verdict" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <span className={`v-chip ${FV_CHIP[v]}`}>{f.verdicts[v].chip}</span>
          <span className="id-reason">{f.verdicts[v].line}</span>
        </motion.div>
      )}
    </Tool>
  )
}

function FeaturedDetail({ c, onList, onAnalyze }: { c: Ins; onList: () => void; onAnalyze: () => void }) {
  const f = c.featured
  const sh = c.details.shared
  return (
    <div className="insight-detail" data-lens="e">
      <button className="id-back" onClick={onList}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        {sh.back}
      </button>
      <header className="id-head">
        <div className="insight-card-head">
          <span className="insight-tag if-dtag">{f.tag}</span>
        </div>
        <h1 className="id-title">{f.title}</h1>
        <p className="if-meta">{f.meta}</p>
        <p className="if-standfirst">{f.standfirst}</p>
        <p className="id-lead">{f.lead}</p>
        <div className="if-stat">
          <div className="if-stat-n"><CountUp to={FEAT_VALS[0]} />%</div>
          <p className="if-stat-l">{f.statLine}</p>
          <motion.p
            className="if-twist"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 2.1, ease: EASE }}
          >
            {f.twistPre}<strong>{f.twistHl}</strong>{f.twistPost}
          </motion.p>
        </div>
      </header>
      <ProseSec s={f.sections[0]} />
      <ProseSec s={f.sections[1]} />
      <Sec label={sh.scenario} cap={f.iceberg.cap}><SvgIceberg ice={f.iceberg} /></Sec>
      <ProseSec s={f.sections[2]} />
      <Reveal>
        <section className="id-sec">
          <div className="id-label">{sh.analysis}</div>
          <div className="id-fig">
            <FeatChart ch={f.chart} />
            <div className="if-anno">
              <p className="if-anno-t">{f.chart.annotation}</p>
              <div className="if-anno-map">
                {f.chart.map.map((m, i) => <span key={i} style={{ color: FEAT_INKS[i] }}>{m}</span>)}
              </div>
            </div>
          </div>
          <p className="id-cap">{f.chart.cap}</p>
          <p className="id-cap">{f.chart.note}</p>
        </section>
      </Reveal>
      <ProseSec s={f.sections[3]} />
      <FeatTool f={f} sh={sh} />
      <ProseSec s={f.sections[4]} />
      <Reveal>
        <div className="id-cta">
          <p>{f.ctaLine}</p>
          <button className="btn btn-ghost" onClick={onAnalyze}>{sh.ctaBtn} {ARROW_R}</button>
        </div>
      </Reveal>
    </div>
  )
}

/* ===== detail shell ===== */

/* Read next: two sibling articles to keep people moving through the cluster (SEO/GEO internal links) */
function ReadNext({ c, idx, onOpen }: { c: Ins; idx: number; onOpen: (i: number) => void }) {
  const sh = c.details.shared
  const picks = [(idx + 1) % c.articles.length, (idx + 2) % c.articles.length]
  return (
    <Reveal>
      <section className="id-readnext">
        <div className="id-label">{sh.readNext}</div>
        <div className="id-rn-grid">
          {picks.map((i) => {
            const a = c.articles[i]
            return (
              <button key={i} className="id-rn-card" data-lens={lensOf(a.lens)} onClick={() => onOpen(i)}>
                <span className="id-rn-top"><span className="id-rn-no">{a.no}</span><span className="id-rn-tag">{a.tag}</span></span>
                <span className="id-rn-title">{a.title}</span>
                <span className="id-rn-go">{sh.read} {ARROW_R}</span>
              </button>
            )
          })}
        </div>
      </section>
    </Reveal>
  )
}

function ArticleDetail({ c, idx, lang, onList, onAnalyze, onOpen }: { c: Ins; idx: number; lang: Lang; onList: () => void; onAnalyze: () => void; onOpen: (i: number) => void }) {
  const a = c.articles[idx]
  const p = ARTICLE_PROSE[lang][idx]
  const det = c.details
  const sh = det.shared
  const ctas = [det.d1.ctaLine, det.d2.ctaLine, det.d3.ctaLine, det.d4.ctaLine, det.d5.ctaLine, det.d6.ctaLine]
  // prose is woven THROUGH the figures (scenario → analysis → interactive tool), not dumped after
  const pr = p?.sections ?? []
  let body: ReactNode = null
  if (idx === 0) body = <Detail1 d={det.d1} sh={sh} prose={pr} />
  else if (idx === 1) body = <Detail2 d={det.d2} sh={sh} points={a.points} prose={pr} />
  else if (idx === 2) body = <Detail3 d={det.d3} sh={sh} table={a.table} prose={pr} />
  else if (idx === 3) body = <Detail4 d={det.d4} sh={sh} prose={pr} />
  else if (idx === 4) body = <Detail5 d={det.d5} sh={sh} prose={pr} />
  else body = <Detail6 d={det.d6} sh={sh} lang={lang} prose={pr} />

  return (
    <article className="insight-detail" data-lens={lensOf(a.lens)}>
      <button className="id-back" onClick={onList}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
        {sh.back}
      </button>
      <header className="id-head">
        <div className="insight-card-head">
          <span className="insight-no">{a.no}</span>
          <span className="insight-tag">{a.tag}</span>
        </div>
        <h1 className="id-title">{a.title}</h1>
        {p?.meta && <p className="if-meta">{p.meta}</p>}
        {p?.standfirst && <p className="if-standfirst">{p.standfirst}</p>}
        <p className="id-lead">{a.body}</p>
        {p?.stat && (
          <div className="if-stat">
            <div className="if-stat-n"><CountUp to={p.stat.n} />{p.stat.unit}</div>
            <p className="if-stat-l">{p.stat.label}</p>
            <p className="if-stat-src">{p.stat.source}</p>
          </div>
        )}
      </header>
      {body}
      {pr.slice(3).map((s, i) => <ProseSec key={`tail-${i}`} s={s} />)}
      <ReadNext c={c} idx={idx} onOpen={onOpen} />
      <Reveal>
        <div className="id-cta">
          <p>{ctas[idx]}</p>
          <button className="btn btn-ghost" onClick={onAnalyze}>{sh.ctaBtn} {ARROW_R}</button>
        </div>
      </Reveal>
    </article>
  )
}

/* ===== page ===== */

export default function Insight({ onBack, onAnalyze }: { onBack: () => void; onAnalyze: () => void }) {
  const { lang } = useLang()
  const c = COPY[lang].insight
  const [open, setOpen] = useState<number | null>(null)
  const [epSlug, setEpSlug] = useState<string | null>(epSlugFromLocation)
  useEffect(() => {
    const sync = () => { setEpSlug(epSlugFromLocation()); setOpen(null) }
    window.addEventListener('popstate', sync)
    window.addEventListener('trinity:route', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('trinity:route', sync) }
  }, [])
  const ep = epSlug ? EPISODES.find((e) => e.slug === epSlug) || null : null
  // /insight#notes (method articles) scrolls past the episodes to the engine articles
  useEffect(() => {
    if (ep || open !== null || location.hash !== '#notes') return
    const t = setTimeout(() => document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth' }), 500)
    return () => clearTimeout(t)
  }, [ep, open, epSlug])

  useEffect(() => { window.scrollTo(0, 0) }, [open, epSlug])
  // clicking "Insight" in the nav while reading an article returns to the list
  useEffect(() => {
    const h = (e: Event) => { if ((e as CustomEvent).detail === 'insight') { setOpen(null); window.scrollTo(0, 0) } }
    window.addEventListener('trinity:navview', h)
    return () => window.removeEventListener('trinity:navview', h)
  }, [])
  // per-article title + description so each article is its own crawlable/citeable page (SEO/GEO)
  useEffect(() => {
    if (ep) return
    const base = 'Trinity Check'
    let title = lang === 'zh' ? '文章 · 怎麼看一個創業點子' : 'Articles · How to read a startup idea'
    let desc = c.hero.lead
    if (open === -1) { title = c.featured.title; desc = c.featured.standfirst }
    else if (open !== null) { const a = c.articles[open]; title = a.title; desc = ARTICLE_PROSE[lang][open]?.standfirst || a.body }
    document.title = `${title} · ${base}`
    let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = desc
    return () => { document.title = base }
  }, [open, lang, c, ep])

  const sh = c.details.shared

  return (
    <div className="insight-page">
      <Aurora tone="mixed" />
      <motion.div className="ins-amb" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: EASE }}>
        <div className={`ins-amb-in${open !== null ? ' faint' : ''}`}>
          <HeroNetwork variant="ambient" />
        </div>
      </motion.div>

      <Nav sub />

      <AnimatePresence mode="wait">
        {ep ? (
          <motion.div
            key={`ep-${ep.slug}-${lang}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            {ep.published || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'vs') ? <EpisodeDetail ep={ep} /> : <EpisodeNotPublished />}
          </motion.div>
        ) : open === null ? (
          <motion.div
            key={`list-${lang}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            <header className="insight-hero">
              <Reveal><div className="eyebrow eyebrow-center">{c.hero.eyebrow}</div></Reveal>
              <h1 className="insight-h1" key={lang}>
                <MaskLines lines={[<>{c.hero.title}</>]} />
              </h1>
              <Reveal delay={0.35}><p className="insight-lead">{c.hero.lead}</p></Reveal>
            </header>

            <EpisodeList />

            <div className="wrap ins-notes-head" id="notes">
              <div className="eyebrow">{c.hero.methods}</div>
              <h2 className="ep-list-h">{c.hero.methodsH}</h2>
            </div>
            <div className="insight-articles wrap">
              <Reveal className="if-span">
                <motion.article
                  className="insight-card insight-featured"
                  data-lens="e"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  onClick={() => setOpen(-1)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(-1) } }}
                >
                  <div className="if-grid">
                    <div className="if-main">
                      <div className="insight-card-head">
                        <span className="insight-tag if-tag">{c.featured.tag}</span>
                      </div>
                      <h2 className="insight-title if-title">{c.featured.title}</h2>
                      <p className="insight-body">{c.featured.lead}</p>
                      <span className="insight-read">{sh.read} {ARROW_R}</span>
                    </div>
                    <div className="if-side">
                      <span className="if-big">{FEAT_VALS[0]}%</span>
                      <span className="if-side-l">{c.featured.statLine}</span>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
              {c.articles.map((a, i) => (
                <Reveal key={a.no} delay={i % 2 === 0 ? 0 : 0.06}>
                  <motion.article
                    className="insight-card"
                    data-lens={lensOf(a.lens)}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    onClick={() => setOpen(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(i) } }}
                  >
                    <div className="insight-card-head">
                      <span className="insight-no">{a.no}</span>
                      <span className="insight-tag">{a.tag}</span>
                    </div>
                    <h2 className="insight-title">{a.title}</h2>
                    <p className="insight-body">{a.body}</p>
                    {a.points.length > 0 && (
                      <ul className="insight-list">
                        {a.points.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    )}
                    {a.table && <InsightTable t={a.table} />}
                    <span className="insight-read">{sh.read} {ARROW_R}</span>
                  </motion.article>
                </Reveal>
              ))}
            </div>

            <div className="insight-foot wrap">
              <button className="btn btn-primary" onClick={onAnalyze}>{c.cta}</button>
              <button className="btn btn-ghost" onClick={onBack}>{c.back}</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`detail-${open}-${lang}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            {open === -1
              ? <FeaturedDetail c={c} onList={() => setOpen(null)} onAnalyze={onAnalyze} />
              : <ArticleDetail c={c} idx={open} lang={lang} onList={() => setOpen(null)} onAnalyze={onAnalyze} onOpen={setOpen} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
