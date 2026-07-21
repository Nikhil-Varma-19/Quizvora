import { ProgressBar } from './ui/ProgressBar'
import type { McqQuestionStats } from '../types'

const BAR_COLORS = ['bg-[#e21b3c]', 'bg-[#1368ce]', 'bg-[#d89e00]', 'bg-[#26890c]', 'bg-[#7b2cbf]']

/**
 * This is the answering participant's OWN live breakdown - the backend only
 * emits `question:stats` (mcq) back to the socket that just answered, it is
 * never broadcast to the whole room. Don't present this as a shared view.
 */
export function McqStatsPanel({ stats }: { stats: McqQuestionStats }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {stats.totalAnswers} {stats.totalAnswers === 1 ? 'answer' : 'answers'} so far · here's how your pick compares
      </p>
      {stats.options.map((opt, idx) => (
        <ProgressBar
          key={opt.optionId}
          label={opt.text}
          count={opt.count}
          percentage={opt.percentage}
          colorClassName={BAR_COLORS[idx % BAR_COLORS.length]}
        />
      ))}
    </div>
  )
}
