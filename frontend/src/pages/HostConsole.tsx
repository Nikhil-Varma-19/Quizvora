import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, MessageSquareText, Power, Users } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { OptionTile } from '../components/OptionTile'
import { WrittenAnswerFeed } from '../components/WrittenAnswerFeed'
import { LiveQuestionComposer } from '../components/LiveQuestionComposer'
import { emitWithAck } from '../lib/socket'
import { createLiveQuestion, extractApiErrorMessage } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import type { QuestionInput } from '../types'

export function HostConsole() {
  const navigate = useNavigate()
  const roomId = useGameStore((s) => s.roomId)
  const isHost = useGameStore((s) => s.isHost)
  const mode = useGameStore((s) => s.mode)
  const status = useGameStore((s) => s.status)
  const currentQuestion = useGameStore((s) => s.currentQuestion)
  const members = useGameStore((s) => s.members)
  const writtenStats = useGameStore((s) => s.writtenStats)

  const [error, setError] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [composeMessage, setComposeMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId || !isHost) navigate('/')
  }, [roomId, isHost, navigate])

  useEffect(() => {
    if (status === 'ended') navigate('/results')
  }, [status, navigate])

  async function handleNext() {
    if (!roomId) return
    setError(null)
    setIsAdvancing(true)
    try {
      const ack = await emitWithAck<{ roomId: string }, null>('question:next', { roomId })
      if (!ack.success) setError(ack.message || 'Could not advance the quiz.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not advance the quiz.')
    } finally {
      setIsAdvancing(false)
    }
  }

  async function handleEnd() {
    if (!roomId) return
    setIsEnding(true)
    try {
      await emitWithAck('room:end', { roomId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not end the room.')
    } finally {
      setIsEnding(false)
    }
  }

  async function handleComposeLive(input: QuestionInput) {
    if (!roomId) return
    setComposeMessage(null)
    setIsComposing(true)
    try {
      await createLiveQuestion(roomId, input)
      setComposeMessage(null)
    } catch (err) {
      setComposeMessage(extractApiErrorMessage(err, 'Could not compose the next question.'))
    } finally {
      setIsComposing(false)
    }
  }

  if (!roomId || !isHost) return null

  return (
    <GradientShell>
      <NavBar />
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Users size={16} /> {members.length} players
            <Badge tone="brand">{mode === 'live' ? 'Live mode' : 'Predefined'}</Badge>
          </div>
          <Button variant="danger" size="sm" isLoading={isEnding} onClick={handleEnd}>
            <Power size={16} /> End room
          </Button>
        </div>

        <Card className="animate-pop-in">
          <CardBody className="flex flex-col gap-5">
            {currentQuestion ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge tone="neutral">Question {currentQuestion.order}</Badge>
                  <Badge tone={currentQuestion.type === 'mcq' ? 'brand' : 'warning'}>
                    {currentQuestion.type === 'mcq' ? 'Multiple choice' : 'Written'}
                  </Badge>
                </div>
                <h1 className="text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl dark:text-white">
                  {currentQuestion.text}
                </h1>

                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {currentQuestion.options.map((opt, idx) => (
                      <OptionTile key={opt._id} index={idx} text={opt.text} disabled />
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'mcq' ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Live answer stats aren't shown to the host - each player sees their own breakdown after they answer.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <MessageSquareText size={16} /> Live responses
                    </div>
                    <WrittenAnswerFeed stats={writtenStats} />
                  </div>
                )}
              </>
            ) : (
              <p className="py-6 text-center text-slate-500 dark:text-slate-400">
                No question is live yet.{' '}
                {mode === 'live' ? 'Compose one below, then hit "Next question".' : 'Click "Next question" to reveal question 1.'}
              </p>
            )}
          </CardBody>
        </Card>

        {mode === 'live' && (
          <Card className="animate-pop-in">
            <CardBody>
              <LiveQuestionComposer onCompose={handleComposeLive} isSubmitting={isComposing} />
              {composeMessage && (
                <Alert tone="error" className="mt-3">
                  {composeMessage}
                </Alert>
              )}
            </CardBody>
          </Card>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <Button size="lg" isLoading={isAdvancing} onClick={handleNext} fullWidth>
          Next question <ChevronRight size={20} />
        </Button>
      </div>
      <Footer />
    </GradientShell>
  )
}
