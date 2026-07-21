import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export function Spinner({ className, size = 32 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={clsx('animate-spin text-violet-600 dark:text-violet-400', className)} />
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-violet-50 via-white to-fuchsia-50 dark:from-[#0b0a10] dark:via-[#100e18] dark:to-[#0b0a10]">
      <Spinner size={40} />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  )
}
