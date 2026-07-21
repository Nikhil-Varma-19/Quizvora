import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Countdown } from '../components/ui/Countdown'
import { Input } from '../components/ui/Input'
import { OptionTile } from '../components/OptionTile'
import { McqStatsPanel } from '../components/McqStatsPanel'
import { emitWithAck } from '../lib/socket'
import { useGameStore } from '../store/gameStore'
import type { AnswerSubmitAckData } from '../types'

export function ParticipantPlay() {
  const navigate = useNavigate()
  const roomId = useGameStore((s) => s.roomId)
  const isHost = useGameStore((s) => s.isHost)
  const status = useGameStore((s) => s.status)
  const currentQuestion = useGameStore((s) => s.currentQuestion)
  const questionShownAt = useGameStore((s) => s.questionShownAt)
  const hasAnsweredCurrent = useGameStore((s) => s.hasAnsweredCurrent)
  const lastAnswerResult = useGameStore((s) => s.lastAnswerResult)
  const myMcqStats = useGameStore((s) => s.myMcqStats)
  const setAnswered = useGameStore((s) => s.setAnswered)

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!roomId) navigate('/')
  }, [roomId, navigate])

  useEffect(() => {
    if (isHost) navigate('/host-console')
  }, [isHost, navigate])

  useEffect(() => {
    if (status === 'ended') navigate('/results')
  }, [status, navigate])

  useEffect(() => {
    setSelectedOptionId(null)
    setWrittenAnswer('')
    setError(null)
  }, [currentQuestion?._id])

  async function submitOption(optionId: string) {
    if (!roomId || !currentQuestion || hasAnsweredCurrent || isSubmitting) return
    setSelectedOptionId(optionId)
    setError(null)
    setIsSubmitting(true)
    try {
      const ack = await emitWithAck<
        { roomId: string; questionId: string; optionId: string },
        AnswerSubmitAckData
      >('answer:submit', { roomId, questionId: currentQuestion._id, optionId })

      if (!ack.success || !ack.data) {
        setError(ack.message || 'Could not submit your answer.')
        return
      }
      setAnswered(ack.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your answer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitWritten(e: FormEvent) {
    e.preventDefault()
    if (!roomId || !currentQuestion || hasAnsweredCurrent) return
    if (writtenAnswer.trim().length < 1) {
      setError('Type an answer before submitting.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const ack = await emitWithAck<
        { roomId: string; questionId: string; answer: string },
        AnswerSubmitAckData
      >('answer:submit', { roomId, questionId: currentQuestion._id, answer: writtenAnswer.trim() })

      if (!ack.success || !ack.data) {
        setError(ack.message || 'Could not submit your answer.')
        return
      }
      setAnswered(ack.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your answer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!roomId || isHost) return null

  return (
    <GradientShell>
      <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 py-4">
        {!currentQuestion ? (
          <Card className="animate-pop-in">
            <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Get ready!</h1>
              <p className="text-slate-500 dark:text-slate-400">The host will send the next question any moment now.</p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge tone="neutral">Question {currentQuestion.order}</Badge>
              {questionShownAt && currentQuestion.durationSeconds > 0 && (
                <Countdown startedAt={questionShownAt} durationSeconds={currentQuestion.durationSeconds} />
              )}
            </div>

            <Card className="animate-pop-in">
              <CardBody>
                <h1 className="text-center text-3xl font-extrabold leading-snug text-slate-900 sm:text-4xl dark:text-white">
                  {currentQuestion.text}
                </h1>
              </CardBody>
            </Card>

            {error && <Alert tone="error">{error}</Alert>}

            {!hasAnsweredCurrent ? (
              currentQuestion.type === 'mcq' && currentQuestion.options ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <OptionTile
                      key={opt._id}
                      index={idx}
                      text={opt.text}
                      selected={selectedOptionId === opt._id}
                      disabled={isSubmitting}
                      onClick={() => submitOption(opt._id)}
                    />
                  ))}
                </div>
              ) : (
                <form onSubmit={submitWritten} className="flex flex-col gap-3">
                  <Input
                    label="Your answer"
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <Button type="submit" isLoading={isSubmitting} fullWidth>
                    <Send size={18} /> Submit answer
                  </Button>
                </form>
              )
            ) : (
              <Card className="animate-pop-in">
                <CardBody className="flex flex-col gap-4">
                  <div
                    className={
                      currentQuestion.type === 'mcq' && lastAnswerResult
                        ? lastAnswerResult.isCorrect
                          ? 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400'
                          : 'flex items-center gap-2 text-rose-600 dark:text-rose-400'
                        : 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    <CheckCircle2 size={20} />
                    <span className="font-semibold">
                      {currentQuestion.type === 'mcq' && lastAnswerResult
                        ? lastAnswerResult.isCorrect
                          ? `Correct! +${lastAnswerResult.pointsAwarded} pts`
                          : 'Answer submitted - not quite right'
                        : 'Answer submitted'}
                    </span>
                  </div>

                  {myMcqStats ? (
                    <McqStatsPanel stats={myMcqStats} />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Waiting for the host to move to the next question…
                    </p>
                  )}
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </GradientShell>
  )
}
