import { Award, Medal, Trophy } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from './ui/Card'
import type { RoomMember } from '../types'

const RANK_ICONS = [
  { Icon: Trophy, className: 'text-amber-400' },
  { Icon: Medal, className: 'text-slate-400' },
  { Icon: Award, className: 'text-orange-500' },
]

export function LeaderboardList({ members }: { members: RoomMember[] }) {
  if (members.length === 0) {
    return <p className="text-center text-sm text-slate-500 dark:text-slate-400">No participants scored yet.</p>
  }

  return (
    <ol className="flex flex-col gap-2">
      {members.map((member, idx) => {
        const rankConfig = RANK_ICONS[idx]
        return (
          <li key={`${idx}-${member.participantId?.name ?? 'unknown'}`}>
            <Card
              className={clsx(
                'flex items-center gap-4 border-none px-5 py-3 shadow-md',
                idx === 0 && 'bg-linear-to-r from-amber-100 to-white dark:from-amber-500/20 dark:to-white/5',
              )}
            >
              <span className="w-8 shrink-0 text-center text-lg font-bold text-slate-500 dark:text-slate-400">
                {rankConfig ? <rankConfig.Icon size={22} className={rankConfig.className} /> : idx + 1}
              </span>
              <span className="flex-1 truncate font-semibold text-slate-800 dark:text-slate-100">
                {member.participantId?.name ?? 'Unknown'}
              </span>
              <span className="font-mono-tabular text-lg font-bold text-violet-600 dark:text-violet-300">
                {member.score} pts
              </span>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}
