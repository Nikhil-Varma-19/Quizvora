import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface CountdownProps {
  /** Timestamp (ms) the question was shown at, e.g. `Date.now()` when `question:show` arrived. */
  startedAt: number
  durationSeconds: number
  className?: string
}

/**
 * Purely client-side countdown for "glanceability" - the backend doesn't
 * push a per-second timer event, so this just derives remaining time from
 * when the current question was shown and how long it's supposed to last.
 */
export function Countdown({ startedAt, durationSeconds, className }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  if (!durationSeconds || durationSeconds <= 0) return null

  const elapsed = (now - startedAt) / 1000
  const remaining = Math.max(0, Math.ceil(durationSeconds - elapsed))
  const isLow = remaining <= 5

  return (
    <span
      className={clsx(
        'font-mono-tabular inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-bold',
        isLow
          ? 'border-rose-500 text-rose-500 animate-pulse'
          : 'border-violet-400 text-violet-600 dark:text-violet-300',
        className,
      )}
    >
      {remaining}
    </span>
  )
}
