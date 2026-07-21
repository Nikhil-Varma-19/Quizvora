import type { ReactNode } from 'react'
import { clsx } from 'clsx'

export function GradientShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-10',
        'dark:from-[#0b0a10] dark:via-[#100e18] dark:to-[#140b1f]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-600/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-600/20"
      />
      <div className="relative z-10 flex w-full flex-1 flex-col items-center">{children}</div>
    </div>
  )
}
