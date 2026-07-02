// Single source of truth for the headline "track record" number.
// Sourced from B2B/Review: 9 single-company analyses + 2 batch briefs of 9 = 27.
// The canonical global number is bumped here in stats.ts with each real HITL
// report — the homepage stats band reads it directly, so one edit updates the
// live site on the next deploy.
export const STATS = {
  analyzed: 27,
}

/** Base + this visitor's own submissions (localStorage), so the number ticks up right after they run the engine. */
export function analyzedCount() {
  try { return STATS.analyzed + Number(localStorage.getItem('trinity-analyzed-bump') || 0) } catch { return STATS.analyzed }
}

/** Record one local submission (called when the Analyze intake is fired). */
export function bumpAnalyzed() {
  try { localStorage.setItem('trinity-analyzed-bump', String(Number(localStorage.getItem('trinity-analyzed-bump') || 0) + 1)) } catch { /* ignore */ }
}

/** Global live counter (Cloudflare Worker + KV, worker-counter/). Local base+bump is the offline fallback. */
export const COUNTER_URL = 'https://trinity-counter.comicbnb.workers.dev/'

/** Fetch the live global count; null when unreachable (caller falls back to analyzedCount()). */
export async function fetchAnalyzed(): Promise<number | null> {
  try {
    const r = await fetch(COUNTER_URL, { signal: AbortSignal.timeout(4000) })
    const j = (await r.json()) as { n?: unknown }
    return typeof j.n === 'number' && j.n > 0 ? j.n : null
  } catch { return null }
}

/** Fire-and-forget global increment (called alongside bumpAnalyzed on submit). */
export function postAnalyzed() {
  try { fetch(COUNTER_URL, { method: 'POST' }).catch(() => {}) } catch { /* ignore */ }
}
