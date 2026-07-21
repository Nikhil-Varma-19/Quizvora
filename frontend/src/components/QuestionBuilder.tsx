import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardBody } from './ui/Card'
import { Input, Select } from './ui/Input'
import { Alert } from './ui/Alert'
import type { BulkQuestionCreatePayload, QuestionInput, TypeQuestion } from '../types'

interface DraftOption {
  key: string
  text: string
  isCorrect: boolean
}

interface DraftQuestion {
  key: string
  type: TypeQuestion
  question: string
  options: DraftOption[]
}

let keySeed = 0
function nextKey() {
  keySeed += 1
  return `k${keySeed}`
}

function makeOption(isCorrect = false): DraftOption {
  return { key: nextKey(), text: '', isCorrect }
}

function makeQuestion(): DraftQuestion {
  return {
    key: nextKey(),
    type: 'mcq',
    question: '',
    options: [makeOption(true), makeOption()],
  }
}

interface QuestionBuilderProps {
  onSubmit: (payload: BulkQuestionCreatePayload) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
}

/** Predefined-mode host flow: author every question upfront, all at once, before the quiz can start. */
export function QuestionBuilder({ onSubmit, isSubmitting, submitError }: QuestionBuilderProps) {
  const [questionDuration, setQuestionDuration] = useState(30)
  const [questions, setQuestions] = useState<DraftQuestion[]>([makeQuestion()])
  const [formError, setFormError] = useState<string | null>(null)

  function updateQuestion(key: string, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)))
  }

  function updateOption(qKey: string, oKey: string, patch: Partial<DraftOption>) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey ? { ...q, options: q.options.map((o) => (o.key === oKey ? { ...o, ...patch } : o)) } : q,
      ),
    )
  }

  function setCorrectOption(qKey: string, oKey: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.key === oKey })) } : q,
      ),
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeQuestion()])
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.key !== key) : prev))
  }

  function addOption(qKey: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.key === qKey && q.options.length < 5 ? { ...q, options: [...q.options, makeOption()] } : q)),
    )
  }

  function removeOption(qKey: string, oKey: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === qKey && q.options.length > 2 ? { ...q, options: q.options.filter((o) => o.key !== oKey) } : q,
      ),
    )
  }

  function toggleType(qKey: string, type: TypeQuestion) {
    updateQuestion(qKey, { type })
  }

  function validate(): string | null {
    if (questions.length === 0) return 'Add at least one question.'
    for (const [idx, q] of questions.entries()) {
      const label = `Question ${idx + 1}`
      if (q.question.trim().length < 3) return `${label}: text must be at least 3 characters.`
      if (q.type === 'mcq') {
        if (q.options.some((o) => o.text.trim().length < 1)) return `${label}: every option needs text.`
        if (!q.options.some((o) => o.isCorrect)) return `${label}: mark one option as correct.`
      }
    }
    return null
  }

  async function handleSubmit() {
    const error = validate()
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)

    const payloadQuestions: QuestionInput[] = questions.map((q) =>
      q.type === 'mcq'
        ? {
            question: q.question.trim(),
            type: 'mcq',
            options: q.options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
          }
        : { question: q.question.trim(), type: 'written' },
    )

    await onSubmit({
      noOfQuestion: questions.length,
      questionDuration,
      questions: payloadQuestions,
    })
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <Input
              label="Seconds per question"
              type="number"
              min={0}
              max={150}
              value={questionDuration}
              onChange={(e) => setQuestionDuration(Number(e.target.value))}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{questions.length} question(s) authored</p>
        </CardBody>
      </Card>

      {questions.map((q, idx) => (
        <Card key={q.key} className="animate-pop-in">
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                Question {idx + 1}
              </span>
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Question type"
                  value={q.type}
                  onChange={(e) => toggleType(q.key, e.target.value as TypeQuestion)}
                  className="w-36"
                >
                  <option value="mcq">Multiple choice</option>
                  <option value="written">Written answer</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.key)}
                  disabled={questions.length === 1}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-500/10"
                  aria-label="Remove question"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <Input
              placeholder="Type your question…"
              value={q.question}
              onChange={(e) => updateQuestion(q.key, { question: e.target.value })}
            />

            {q.type === 'mcq' && (
              <div className="flex flex-col gap-2">
                {q.options.map((o) => (
                  <div key={o.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectOption(q.key, o.key)}
                      aria-label="Mark as correct"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        o.isCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 text-transparent dark:border-white/20'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <Input
                      className="flex-1"
                      placeholder="Option text"
                      value={o.text}
                      onChange={(e) => updateOption(q.key, o.key, { text: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(q.key, o.key)}
                      disabled={q.options.length <= 2}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-500/10"
                      aria-label="Remove option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addOption(q.key)}
                  disabled={q.options.length >= 5}
                  className="self-start"
                >
                  <Plus size={16} /> Add option
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      <Button type="button" variant="secondary" onClick={addQuestion} className="self-start">
        <Plus size={18} /> Add question
      </Button>

      {(formError || submitError) && <Alert tone="error">{formError || submitError}</Alert>}

      <Button type="button" size="lg" isLoading={isSubmitting} onClick={handleSubmit}>
        Save questions &amp; continue to lobby
      </Button>
    </div>
  )
}
