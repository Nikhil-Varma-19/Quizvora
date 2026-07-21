import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur shadow-xl shadow-slate-900/5',
        'dark:border-white/10 dark:bg-white/5 dark:shadow-black/20',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('p-6', className)} {...rest}>
      {children}
    </div>
  )
}
