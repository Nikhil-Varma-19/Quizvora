import type { HTMLAttributes } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { clsx } from 'clsx'

type Tone = 'error' | 'success' | 'info'

const toneConfig: Record<Tone, { classes: string; Icon: typeof Info }> = {
  error: {
    classes: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300',
    Icon: AlertTriangle,
  },
  success: {
    classes:
      'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  info: {
    classes: 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-300',
    Icon: Info,
  },
}

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
}

export function Alert({ tone = 'info', className, children, ...rest }: AlertProps) {
  const { classes, Icon } = toneConfig[tone]
  return (
    <div
      className={clsx('flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium', classes, className)}
      {...rest}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
