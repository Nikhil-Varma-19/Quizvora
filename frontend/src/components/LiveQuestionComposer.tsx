import { useState } from 'react'
import { Check, Plus, Send, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { Input, Select } from './ui/Input'
import { Alert } from './ui/Alert'
import type { QuestionInput, TypeQuestion } from '../types'

interface DraftOption {
  key: string
  text: string
  isCorrect: boolean
}

let keySeed = 0
function nextKey() {
  keySeed += 1
  return `live-${keySeed}`
}

interface LiveQuestionComposerProps {
  onCompose: (input: QuestionInput) => Promise<void>
  isSubmitting: boolean
}

/**
 * Live-mode host console: authors the NEXT question via the
 * `POST /api/live-question/:roomId` REST call. Per the backend's own
 * validation, this endpoint only accepts question/type/options - no
 * duration or points - so this form deliberately doesn't offer those.
 * Composing here does not show the question to players; the host still
 * has to hit "Next question" (question:next) afterwards to reveal it.
 */
export function LiveQuestionComposer({ onCompose, isSubmitting }: LiveQuestionComposerProps) {
  const [type, setType] = useState<TypeQuestion>('mcq')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<DraftOption[]>([
    { key: nextKey(), text: '', isCorrect: true },
    { key: nextKey(), text: '', isCorrect: false },
  ])
  const [error, setError] = useState<string | null>(null)
  const [composed, setComposed] = useState(false)

  function updateOption(key: string, patch: Partial<DraftOption>) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)))
  }

  function setCorrect(key: string) {
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.key === key })))
  }

  function addOption() {
    setOptions((prev) => (prev.length < 5 ? [...prev, { key: nextKey(), text: '', isCorrect: false }] : prev))
  }

  function removeOption(key: string) {
    setOptions((prev) => (prev.length > 2 ? prev.filter((o) => o.key !== key) : prev))
  }

  async function handleCompose() {
    if (question.trim().length < 3) {
      setError('Question text must be at least 3 characters.')
      return
    }
    if (type === 'mcq') {
      if (options.some((o) => o.text.trim().length < 1)) {
        setError('Every option needs text.')
        return
      }
      if (!options.some((o) => o.isCorrect)) {
        setError('Mark one option as correct.')
        return
      }
    }
    setError(null)

    const input: QuestionInput =
      type === 'mcq'
        ? { question: question.trim(), type: 'mcq', options: options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })) }
        : { question: question.trim(), type: 'written' }

    await onCompose(input)
    setComposed(true)
    setQuestion('')
    setOptions([
      { key: nextKey(), text: '', isCorrect: true },
      { key: nextKey(), text: '', isCorrect: false },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Compose next question</h3>
        <Select
          aria-label="Question type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as TypeQuestion)
            setComposed(false)
          }}
          className="w-36"
        >
          <option value="mcq">Multiple choice</option>
          <option value="written">Written answer</option>
        </Select>
      </div>

      <Input
        placeholder="Type the next question…"
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value)
          setComposed(false)
        }}
      />

      {type === 'mcq' && (
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <div key={o.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCorrect(o.key)
                  setComposed(false)
                }}
                aria-label="Mark as correct"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  o.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent dark:border-white/20'
                }`}
              >
                <Check size={16} />
              </button>
              <Input
                className="flex-1"
                placeholder="Option text"
                value={o.text}
                onChange={(e) => {
                  updateOption(o.key, { text: e.target.value })
                  setComposed(false)
                }}
              />
              <button
                type="button"
                onClick={() => removeOption(o.key)}
                disabled={options.length <= 2}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-500/10"
                aria-label="Remove option"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addOption} disabled={options.length >= 5} className="self-start">
            <Plus size={16} /> Add option
          </Button>
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}
      {composed && !error && <Alert tone="success">Next question composed. Click "Next question" to reveal it.</Alert>}

      <Button type="button" variant="secondary" isLoading={isSubmitting} onClick={handleCompose} className="self-start">
        <Send size={16} /> Compose next question
      </Button>
    </div>
  )
}
