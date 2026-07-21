import { Crown, User } from 'lucide-react'
import { Card } from './ui/Card'
import type { RoomMember } from '../types'

export function MemberList({ members }: { members: RoomMember[] }) {
  if (members.length === 0) {
    return <p className="text-center text-sm text-slate-500 dark:text-slate-400">Waiting for players to join…</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member, idx) => (
        <Card
          // Backend strips every id field from this payload - key by
          // position + name, it's the best stable-ish identity available.
          key={`${idx}-${member.participantId?.name ?? 'unknown'}`}
          className="flex items-center gap-2 rounded-full border-none bg-white px-4 py-2 shadow-md dark:bg-white/10"
        >
          {member.role === 'admin' ? (
            <Crown size={16} className="shrink-0 text-amber-500" />
          ) : (
            <User size={16} className="shrink-0 text-slate-400" />
          )}
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {member.participantId?.name ?? 'Unknown'}
          </span>
        </Card>
      ))}
    </div>
  )
}
