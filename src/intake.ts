/**
 * The one client for every form on the site → POST /api/intake (worker/index.js).
 * Same-origin in production (Worker route trinity.easeai.com.tw/api/*); the Vite dev
 * server proxies /api to wrangler dev on :8787. Errors are thrown, never swallowed:
 * the page that called us decides how to show "not sent" and keeps the user's answers.
 */
export type IntakeKind = 'analyze' | 'waitlist'
export type MailStatus = { confirm: string; notify: string }
export type IntakeOk = { ok: true; id: string; mail: MailStatus }

export class IntakeError extends Error {
  code: string
  constructor(code: string) { super(code); this.code = code }
}

import { source } from './lib/track'

const API_BASE = (import.meta.env.VITE_INTAKE_API as string | undefined) || ''
export const PUBLIC_EMAIL = 'vincent@easeai.com.tw'
export const PERSONAL_SITE = 'https://vincent.easeai.com.tw/?s=trinity-nav'
export const ABOUT_URL = 'https://vincent.easeai.com.tw/?s=trinity-about'
export const ONE_ON_ONE_NAV = 'https://vincent.easeai.com.tw/contact/?s=trinity-nav'
export const ONE_ON_ONE_PROD = 'https://vincent.easeai.com.tw/contact/?s=trinity-prod'
export const EPISODES_URL = 'https://venturerelations.pages.dev/?s=trinity-nav'
export const FOLLOW = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/vincent-wang-yuyu' },
  { name: 'YouTube', href: 'https://www.youtube.com/@venturerelations' },
  { name: 'Instagram', href: 'https://www.instagram.com/venturerelations/' },
  { name: 'Threads', href: 'https://www.threads.net/@venturerelations' },
] as const
export const CONTACT_URL = 'https://vincent.easeai.com.tw/contact/?s=trinity'

export async function submitIntake(kind: IntakeKind, lang: 'en' | 'zh', answers: Record<string, unknown>): Promise<IntakeOk> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000)
  try {
    const r = await fetch(`${API_BASE}/api/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, lang, answers: { ...answers, s: source() }, s: source() }),
      signal: ctrl.signal,
    })
    let j: Partial<IntakeOk> & { error?: string } | null = null
    try { j = await r.json() } catch { j = null }
    if (!r.ok || !j || j.ok !== true || !j.id) throw new IntakeError((j && j.error) || `http_${r.status}`)
    return { ok: true, id: j.id, mail: j.mail || { confirm: 'unknown', notify: 'unknown' } }
  } catch (e) {
    if (e instanceof IntakeError) throw e
    throw new IntakeError((e as { name?: string })?.name === 'AbortError' ? 'timeout' : 'network')
  } finally { clearTimeout(timer) }
}

/** mailto: fallback when the API is down. Body carries everything the user typed. */
export function mailtoFallback(subject: string, lines: string[]): string {
  return `mailto:${PUBLIC_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}
