import { Mail } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-10 flex w-full max-w-5xl flex-col items-center gap-2 border-t border-slate-200/70 px-2 pt-6 pb-2 text-center text-xs text-slate-500 sm:flex-row sm:justify-between dark:border-white/10 dark:text-slate-400">
      <p>&copy; {year} Quizvora. All rights reserved.</p>
      <a
        href="mailto:nikhilkumarvarma@gmail.com"
        className="inline-flex items-center gap-1.5 font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
      >
        <Mail size={14} /> Contact us
      </a>
    </footer>
  )
}
