import { forwardRef } from 'react'
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const fieldWrapClasses = 'flex flex-col gap-1.5'
const labelClasses = 'text-sm font-medium text-slate-700 dark:text-slate-200'
const controlClasses =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...rest },
  ref,
) {
  const inputId = id || rest.name
  return (
    <div className={fieldWrapClasses}>
      {label && (
        <label className={labelClasses} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(controlClasses, error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20', className)}
        {...rest}
      />
      {hint && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      {error && <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className, id, children, ...rest },
  ref,
) {
  const selectId = id || rest.name
  return (
    <div className={fieldWrapClasses}>
      {label && (
        <label className={labelClasses} htmlFor={selectId}>
          {label}
        </label>
      )}
      <select ref={ref} id={selectId} className={clsx(controlClasses, 'cursor-pointer', className)} {...rest}>
        {children}
      </select>
    </div>
  )
})

export function FieldLabel({ children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={labelClasses} {...rest}>
      {children}
    </label>
  )
}
