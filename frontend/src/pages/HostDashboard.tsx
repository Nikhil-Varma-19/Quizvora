import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { QuestionBuilder } from '../components/QuestionBuilder'
import { ensureConnected, emitWithAck } from '../lib/socket'
import { bulkCreateQuestions, extractApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type { BulkQuestionCreatePayload, ModePlay, ResultMode, RoomCreatePayload, RoomCreateResponseData } from '../types'

export function HostDashboard() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setRoom = useGameStore((s) => s.setRoom)
  const roomId = useGameStore((s) => s.roomId)
  const mode = useGameStore((s) => s.mode)

  const [title, setTitle] = useState('')
  const [selectedMode, setSelectedMode] = useState<ModePlay>('predefined')
  const [resultMode, setResultMode] = useState<ResultMode>('perQuestion')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSavingQuestions, setIsSavingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  // A room already exists in the store (e.g. this host refreshed mid-setup)
  // and it's predefined mode -> stay on the question-authoring step.
  const roomCreated = roomId !== null

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  // Live mode has no upfront authoring step - if a room already exists
  // (e.g. this host refreshed right after creating one), there's nothing
  // left to do here, so head straight to the lobby.
  useEffect(() => {
    if (roomCreated && mode !== 'predefined') navigate('/lobby')
  }, [roomCreated, mode, navigate])

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsCreating(true)
    try {
      await ensureConnected()
      const payload: RoomCreatePayload = { title, mode: selectedMode, resultMode }
      const ack = await emitWithAck<RoomCreatePayload, RoomCreateResponseData>('room:create', payload)

      if (!ack.success || !ack.data) {
        setError(ack.message || 'Could not create the room.')
        return
      }

      setRoom({
        roomId: ack.data._id,
        code: ack.data.code,
        title: ack.data.title,
        // The backend never echoes `mode` back - remember what we just submitted.
        mode: selectedMode,
        resultMode: ack.data.resultMode,
        status: ack.data.status,
        isHost: true,
      })

      if (selectedMode === 'live') navigate('/lobby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the room.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSaveQuestions(payload: BulkQuestionCreatePayload) {
    if (!roomId) return
    setQuestionsError(null)
    setIsSavingQuestions(true)
    try {
      await bulkCreateQuestions(roomId, payload)
      navigate('/lobby')
    } catch (err) {
      setQuestionsError(extractApiErrorMessage(err, 'Could not save the questions.'))
    } finally {
      setIsSavingQuestions(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <GradientShell>
      <NavBar />
      <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 py-4">
        {!roomCreated ? (
          <Card className="animate-pop-in">
            <CardBody className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  <Rocket size={24} />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create a new quiz room</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Set the basics now - you'll get a shareable room code right after.
                </p>
              </div>

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
                <Input
                  label="Quiz title"
                  required
                  minLength={3}
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Select
                  label="Mode"
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as ModePlay)}
                >
                  <option value="predefined">Predefined - author all questions upfront</option>
                  <option value="live">Live - author questions on the fly</option>
                </Select>

                <Select
                  label="Show results"
                  value={resultMode}
                  onChange={(e) => setResultMode(e.target.value as ResultMode)}
                >
                  <option value="perQuestion">After every question</option>
                  <option value="atLast">Only at the end</option>
                </Select>

                {error && <Alert tone="error">{error}</Alert>}

                <Button type="submit" size="lg" isLoading={isCreating} fullWidth>
                  Create room
                </Button>
              </form>
            </CardBody>
          </Card>
        ) : mode === 'predefined' ? (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Build your questions</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Every question is locked in before the quiz starts in predefined mode.
              </p>
            </div>
            <QuestionBuilder onSubmit={handleSaveQuestions} isSubmitting={isSavingQuestions} submitError={questionsError} />
          </div>
        ) : null}
      </div>
      <Footer />
    </GradientShell>
  )
}
