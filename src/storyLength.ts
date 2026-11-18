// 文章閱讀時間（261118）。Vincent：「7 分鐘內要可以讀完，不要太冗長。」
// 頁面標題下的「約 N 分鐘」與 scripts/check_story_length.py 共用這一份算法，數字不手寫。
// 正文＝情境圖、影片回顧、延伸、數據圖標題與標籤、投票；不含出處清單與每條的出處標註。
// 中文：漢字一字算一，英數字一串算一，400 字／分鐘。英文：一個字算一，230 字／分鐘。
import type { StoryLang } from './epStories'

export const READ_RATE = { zh: 400, en: 230 } as const
export const READ_MAX_MIN = 7

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ')

export function storyText(a: StoryLang): string[] {
  const out: string[] = []
  const s = a.scene as Record<string, unknown>
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k !== 'kind' && k !== 'n') walk(x) })
  }
  walk(s)
  out.push(a.recapH, ...a.recap)
  for (const sec of a.sections) {
    out.push(sec.h)
    if (sec.lead) out.push(sec.lead)
    if (sec.paras) out.push(...sec.paras)
    if (sec.items) for (const it of sec.items) out.push(it.k, it.v)
    if (sec.note) out.push(sec.note)
  }
  out.push(a.chart.h)
  if (a.chart.lead) out.push(a.chart.lead)
  for (const r of a.chart.rows) out.push(r.label)
  out.push(a.poll.q, ...a.poll.opts.map((o) => o.t), a.poll.after)
  return out.map(strip)
}

export function countWords(a: StoryLang, lang: 'zh' | 'en'): number {
  const t = storyText(a).join('\n')
  if (lang === 'zh') {
    const han = (t.match(/[㐀-鿿豈-﫿]/g) || []).length
    const latin = (t.match(/[A-Za-z0-9][A-Za-z0-9.'’%-]*/g) || []).length
    return han + latin
  }
  return (t.match(/[A-Za-z0-9][A-Za-z0-9.'’%,-]*/g) || []).length
}

export function readMinutes(a: StoryLang, lang: 'zh' | 'en'): number {
  return Math.max(1, Math.ceil(countWords(a, lang) / READ_RATE[lang]))
}
