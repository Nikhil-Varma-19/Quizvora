import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, MessageSquareText, Power, Send, Users } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Input } from '../components/ui/Input'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { OptionTile } from '../components/OptionTile'
import { McqStatsPanel } from '../components/McqStatsPanel'
import { WrittenAnswerFeed } from '../components/WrittenAnswerFeed'
import { LiveQuestionComposer } from '../components/LiveQuestionComposer'
import { emitWithAck } from '../lib/socket'
import { createLiveQuestion, extractApiErrorMessage } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import type { AnswerSubmitAckData, QuestionInput } from '../types'

export function HostConsole() {
  const navigate = useNavigate()
  const roomId = useGameStore((s) => s.roomId)
  const isHost = useGameStore((s) => s.isHost)
  const mode = useGameStore((s) => s.mode)
  const status = useGameStore((s) => s.status)
  const currentQuestion = useGameStore((s) => s.currentQuestion)
  const members = useGameStore((s) => s.members)
  const writtenStats = useGameStore((s) => s.writtenStats)
  const hasAnsweredCurrent = useGameStore((s) => s.hasAnsweredCurrent)
  const lastAnswerResult = useGameStore((s) => s.lastAnswerResult)
  const myMcqStats = useGameStore((s) => s.myMcqStats)
  const setAnswered = useGameStore((s) => s.setAnswered)

  const [error, setError] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [composeMessage, setComposeMessage] = useState<string | null>(null)

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)

  useEffect(() => {
    setSelectedOptionId(null)
    setWrittenAnswer('')
    setAnswerError(null)
  }, [currentQuestion?._id])

  async function submitOption(optionId: string) {
    if (!roomId || !currentQuestion || hasAnsweredCurrent || isAnswering) return
    setSelectedOptionId(optionId)
    setAnswerError(null)
    setIsAnswering(true)
    try {
      const ack = await emitWithAck<
        { roomId: string; questionId: string; optionId: string },
        AnswerSubmitAckData
      >('answer:submit', { roomId, questionId: currentQuestion._id, optionId })

      if (!ack.success || !ack.data) {
        setAnswerError(ack.message || 'Could not submit your answer.')
        return
      }
      setAnswered(ack.data)
    } catch (err) {
      setAnswerError(err instanceof Error ? err.message : 'Could not submit your answer.')
    } finally {
      setIsAnswering(false)
    }
  }

  async function submitWrittenAnswer(e: FormEvent) {
    e.preventDefault()
    if (!roomId || !currentQuestion || hasAnsweredCurrent) return
    if (writtenAnswer.trim().length < 1) {
      setAnswerError('Type an answer before submitting.')
      return
    }
    setAnswerError(null)
    setIsAnswering(true)
    try {
      const ack = await emitWithAck<
        { roomId: string; questionId: string; answer: string },
        AnswerSubmitAckData
      >('answer:submit', { roomId, questionId: currentQuestion._id, answer: writtenAnswer.trim() })

      if (!ack.success || !ack.data) {
        setAnswerError(ack.message || 'Could not submit your answer.')
        return
      }
      setAnswered(ack.data)
    } catch (err) {
      setAnswerError(err instanceof Error ? err.message : 'Could not submit your answer.')
    } finally {
      setIsAnswering(false)
    }
  }

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

                {answerError && <Alert tone="error">{answerError}</Alert>}

                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <>
                    {!hasAnsweredCurrent ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {currentQuestion.options.map((opt, idx) => (
                          <OptionTile
                            key={opt._id}
                            index={idx}
                            text={opt.text}
                            selected={selectedOptionId === opt._id}
                            disabled={isAnswering}
                            onClick={() => submitOption(opt._id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div
                          className={
                            lastAnswerResult?.isCorrect
                              ? 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400'
                              : 'flex items-center gap-2 text-rose-600 dark:text-rose-400'
                          }
                        >
                          <CheckCircle2 size={20} />
                          <span className="font-semibold">
                            {lastAnswerResult?.isCorrect
                              ? `Correct! +${lastAnswerResult.pointsAwarded} pts`
                              : 'Answer submitted - not quite right'}
                          </span>
                        </div>
                        {myMcqStats && <McqStatsPanel stats={myMcqStats} />}
                      </div>
                    )}
                  </>
                )}

                {currentQuestion.type === 'mcq' ? (
                  !hasAnsweredCurrent && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pick an option to see how the room voted.
                    </p>
                  )
                ) : (
                  <div className="flex flex-col gap-3">
                    {!hasAnsweredCurrent && (
                      <form onSubmit={submitWrittenAnswer} className="flex flex-col gap-3">
                        <Input
                          label="Your answer"
                          value={writtenAnswer}
                          onChange={(e) => setWrittenAnswer(e.target.value)}
                          maxLength={100}
                        />
                        <Button type="submit" isLoading={isAnswering} fullWidth>
                          <Send size={18} /> Submit answer
                        </Button>
                      </form>
                    )}
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
