import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, KeyRound, Smartphone } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { createGuestSession, extractApiErrorMessage } from '../lib/api'
import { ensureConnected, emitWithAck } from '../lib/socket'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type { RoomJoinAckData } from '../types'

export function GuestJoin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Landing's "Host a quiz" card routes here with ?intent=host when there's
  // no identity yet - reuse this page's guest-name step, then continue on to
  // hosting instead of showing the room-code join form.
  const intent = searchParams.get('intent') === 'host' ? 'host' : 'join'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setGuestIdentity = useAuthStore((s) => s.setGuestIdentity)
  const setRoom = useGameStore((s) => s.setRoom)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && intent === 'host') navigate('/host')
  }, [isAuthenticated, intent, navigate])

  if (isAuthenticated && intent === 'host') return null

  async function handleCreateGuest(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await createGuestSession({ name })
      setGuestIdentity({ sessionId: data.sessionId, name: data.name })
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Could not create your guest profile.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleJoinRoom(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await ensureConnected()
      
      const trimmedCode = code.trim()
      const ack = await emitWithAck<{ code: string }, RoomJoinAckData>('room:join', {
        code: trimmedCode,
      })

      if (!ack.success || !ack.data) {
        setError(ack.message || 'Could not join that room.')
        return
      }

      setRoom({
        roomId: ack.data.roomId,
        code: trimmedCode,
        status: ack.data.status,
        isHost: false,
      })

      if (ack.data.status === 'ended') navigate('/results')
      else if (ack.data.status === 'running') navigate('/play')
      else navigate('/lobby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that room.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GradientShell>
      <NavBar />
      <div className="flex w-full flex-1 items-center justify-center">
        <Card className="w-full max-w-md animate-pop-in">
          <CardBody className="flex flex-col gap-5">
            {!isAuthenticated ? (
              <>
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                    <Smartphone size={24} />
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What's your name?</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {intent === 'host'
                      ? "This is how you'll show up as the host - no account needed."
                      : 'This is how other players will see you on the leaderboard.'}
                  </p>
                </div>
                <form onSubmit={handleCreateGuest} className="flex flex-col gap-4">
                  <Input
                    label="Display name"
                    required
                    minLength={3}
                    maxLength={20}
                    hint="3-20 characters"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  {error && <Alert tone="error">{error}</Alert>}
                  <Button type="submit" isLoading={isSubmitting} fullWidth>
                    Continue <ArrowRight size={18} />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    <KeyRound size={24} />
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enter the room code</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ask the host for the code on their screen.</p>
                </div>
                <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                  <Input
                    label="Room code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    // Codes are mixed-case and matched exactly - no CSS
                    // text-transform here, it would show a case different
                    // from what's actually being submitted.
                    className="text-center font-mono-tabular text-2xl tracking-[0.3em]"
                    autoFocus
                    spellCheck={false}
                    autoCapitalize="off"
                  />
                  {error && <Alert tone="error">{error}</Alert>}
                  <Button type="submit" isLoading={isSubmitting} fullWidth>
                    Join quiz <ArrowRight size={18} />
                  </Button>
                </form>
              </>
            )}

           {!isAuthenticated &&  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {intent === 'host' ? 'Have an account?' : 'Hosting instead?'}{' '}
              <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-300">
                Log in here
              </Link>
            </p>}
          </CardBody>
        </Card>
      </div>
      <Footer />
    </GradientShell>
  )
}
