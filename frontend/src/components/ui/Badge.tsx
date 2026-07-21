import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  brand: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export function RoomCodeBadge({ code }: { code: string }) {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Room code
      </span>
      <span className="font-mono-tabular rounded-2xl border-2 border-dashed border-violet-400/60 bg-violet-50 px-6 py-2 text-3xl font-bold tracking-[0.3em] text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-300">
        {code}
      </span>
    </div>
  )
}
