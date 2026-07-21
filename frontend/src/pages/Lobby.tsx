import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Play, Users } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { RoomCodeBadge } from '../components/ui/Badge'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { MemberList } from '../components/MemberList'
import { emitWithAck } from '../lib/socket'
import { useGameStore } from '../store/gameStore'

export function Lobby() {
  const navigate = useNavigate()
  const roomId = useGameStore((s) => s.roomId)
  const code = useGameStore((s) => s.code)
  const title = useGameStore((s) => s.title)
  const isHost = useGameStore((s) => s.isHost)
  const members = useGameStore((s) => s.members)
  const status = useGameStore((s) => s.status)
  const reset = useGameStore((s) => s.reset)

  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!roomId) navigate('/')
  }, [roomId, navigate])

  useEffect(() => {
    if (status === 'running') navigate(isHost ? '/host-console' : '/play')
    if (status === 'ended') navigate('/results')
  }, [status, isHost, navigate])

  async function handleStart() {
    if (!roomId) return
    setError(null)
    setIsStarting(true)
    try {
      const ack = await emitWithAck<{ roomId: string }, null>('quiz:start', { roomId })
      if (!ack.success) {
        setError(ack.message || 'Could not start the quiz.')
        return
      }
      // The backend only broadcasts `quiz:started` to OTHER sockets in the
      // room, and (in live mode) never emits `question:show` at all until
      // the host explicitly advances - so the host has to route itself
      // here rather than waiting on a broadcast that may never arrive.
      useGameStore.getState().setStatus('running')
      navigate('/host-console')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the quiz.')
    } finally {
      setIsStarting(false)
    }
  }

  async function handleLeaveOrEnd() {
    if (!roomId) return
    setIsLeaving(true)
    try {
      if (isHost) {
        await emitWithAck('room:end', { roomId })
      } else {
        await emitWithAck('room:leave', {})
      }
    } catch {
      // Best-effort: even if the server call fails, clear local state so the
      // user isn't stuck in a dead room.
    } finally {
      reset()
      navigate('/')
      setIsLeaving(false)
    }
  }

  if (!roomId) return null

  return (
    <GradientShell>
      <NavBar />
      <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 py-4">
        <Card className="animate-pop-in">
          <CardBody className="flex flex-col items-center gap-5 text-center">
            {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>}
            {code && <RoomCodeBadge code={code} />}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isHost
                ? 'Share this code with your players. Start whenever everyone is in.'
                : "You're in! Sit tight while the host gets things going."}
            </p>
          </CardBody>
        </Card>

        <Card className="animate-pop-in">
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Users size={16} />
              Players ({members.length})
            </div>
            <MemberList members={members} />
          </CardBody>
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-col gap-3 sm:flex-row">
          {isHost && (
            <Button size="lg" isLoading={isStarting} onClick={handleStart} fullWidth>
              <Play size={18} /> Start quiz
            </Button>
          )}
          <Button variant="secondary" isLoading={isLeaving} onClick={handleLeaveOrEnd} fullWidth={!isHost}>
            <LogOut size={18} /> {isHost ? 'Cancel & end room' : 'Leave room'}
          </Button>
        </div>
      </div>
      <Footer />
    </GradientShell>
  )
}
