import { clsx } from 'clsx'

interface ProgressBarProps {
  percentage: number
  label?: string
  count?: number
  colorClassName?: string
  className?: string
}

export function ProgressBar({ percentage, label, count, colorClassName, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {(label || count !== undefined) && (
        <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
          <span className="truncate">{label}</span>
          <span className="font-mono-tabular shrink-0 pl-2">
            {count !== undefined ? `${count} · ` : ''}
            {clamped}%
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={clsx('animate-progress-grow h-full rounded-full transition-[width] duration-500 ease-out', colorClassName ?? 'bg-violet-600')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
