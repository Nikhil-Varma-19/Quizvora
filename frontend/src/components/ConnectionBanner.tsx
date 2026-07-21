import { WifiOff } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

export function ConnectionBanner() {
  const connectionError = useGameStore((s) => s.connectionError)

  if (!connectionError) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
      <WifiOff size={16} />
      {connectionError}
    </div>
  )
}
