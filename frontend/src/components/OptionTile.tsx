import type { ButtonHTMLAttributes } from 'react'
import { Circle, Diamond, Square, Star, Triangle } from 'lucide-react'
import { clsx } from 'clsx'

const OPTION_STYLES = [
  { bg: 'bg-[#e21b3c]', ring: 'ring-[#e21b3c]', Icon: Triangle },
  { bg: 'bg-[#1368ce]', ring: 'ring-[#1368ce]', Icon: Diamond },
  { bg: 'bg-[#d89e00]', ring: 'ring-[#d89e00]', Icon: Circle },
  { bg: 'bg-[#26890c]', ring: 'ring-[#26890c]', Icon: Square },
  { bg: 'bg-[#7b2cbf]', ring: 'ring-[#7b2cbf]', Icon: Star },
]

interface OptionTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  index: number
  text: string
  selected?: boolean
  revealCorrect?: boolean
  isCorrect?: boolean
}

export function OptionTile({ index, text, selected, revealCorrect, isCorrect, className, disabled, ...rest }: OptionTileProps) {
  const style = OPTION_STYLES[index % OPTION_STYLES.length]
  const Icon = style.Icon

  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'group relative flex min-h-24 w-full items-center gap-3 overflow-hidden rounded-2xl px-5 py-5 text-left text-lg font-bold text-white shadow-lg transition-transform duration-150',
        'disabled:cursor-not-allowed',
        style.bg,
        selected && 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-[#0b0a10]',
        selected && style.ring,
        !disabled && 'hover:scale-[1.02] active:scale-[0.99]',
        disabled && !selected && 'opacity-60',
        revealCorrect && isCorrect === false && 'opacity-40 grayscale',
        className,
      )}
      {...rest}
    >
      <Icon className="shrink-0 fill-white/90" size={28} />
      <span className="break-words">{text}</span>
      {revealCorrect && isCorrect && (
        <span className="ml-auto shrink-0 rounded-full bg-white/25 px-2 py-1 text-xs uppercase tracking-wide">
          Correct
        </span>
      )}
    </button>
  )
}
