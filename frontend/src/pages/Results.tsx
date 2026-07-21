import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, PartyPopper, RotateCcw } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { LeaderboardList } from '../components/LeaderboardList'
import { useGameStore } from '../store/gameStore'

export function Results() {
  const navigate = useNavigate()
  const isHost = useGameStore((s) => s.isHost)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const endedMessage = useGameStore((s) => s.endedMessage)
  const title = useGameStore((s) => s.title)
  const roomId = useGameStore((s) => s.roomId)
  const reset = useGameStore((s) => s.reset)

  useEffect(() => {
    if (!roomId && !leaderboard && !endedMessage) navigate('/')
  }, [roomId, leaderboard, endedMessage, navigate])

  function handleBack() {
    reset()
    navigate(isHost ? '/host' : '/')
  }

  return (
    <GradientShell>
      <NavBar />
      <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 py-4">
        <Card className="animate-pop-in">
          <CardBody className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <PartyPopper size={28} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {leaderboard ? 'Quiz complete!' : 'Room ended'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {endedMessage || (title ? `${title} has finished.` : 'Thanks for playing.')}
            </p>
          </CardBody>
        </Card>

        {leaderboard && (
          <Card className="animate-pop-in">
            <CardBody className="flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Final leaderboard
              </h2>
              <LeaderboardList members={leaderboard} />
            </CardBody>
          </Card>
        )}

        <Button size="lg" onClick={handleBack} fullWidth>
          {isHost ? (
            <>
              <RotateCcw size={18} /> Back to dashboard
            </>
          ) : (
            <>
              <Home size={18} /> Back to home
            </>
          )}
        </Button>
      </div>
      <Footer />
    </GradientShell>
  )
}
