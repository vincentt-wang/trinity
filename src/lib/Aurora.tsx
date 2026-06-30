/** Drifting soft colour blobs behind a section. Pure CSS animation. */
export function Aurora({ tone = 'cool' }: { tone?: 'cool' | 'warm' | 'mixed' }) {
  return (
    <div className={`aurora ${tone}`} aria-hidden>
      <span className="aurora-blob a" />
      <span className="aurora-blob b" />
      <span className="aurora-blob c" />
    </div>
  )
}
