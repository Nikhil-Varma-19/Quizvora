import { MessageSquareText } from 'lucide-react'
import { Card } from './ui/Card'
import type { WrittenQuestionStats } from '../types'

/**
 * Host-only live feed - the backend emits `question:stats` (written) solely
 * to the room admin's socket, one snapshot per incoming answer. It is never
 * broadcast, so this can never be shown as a room-wide view.
 */
export function WrittenAnswerFeed({ stats }: { stats: WrittenQuestionStats | null }) {
  if (!stats || stats.answers.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <MessageSquareText size={16} />
        Written responses will appear here as players answer.
      </p>
    )
  }

  return (
    <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
      {stats.answers.map((answer, idx) => (
        <Card key={idx} className="border-none bg-slate-50 px-4 py-3 shadow-sm dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {answer.participantId?.name ?? 'Unknown'}
          </p>
          <p className="mt-1 text-base text-slate-900 dark:text-white">{answer.writtenAnswer}</p>
        </Card>
      ))}
    </div>
  )
}
