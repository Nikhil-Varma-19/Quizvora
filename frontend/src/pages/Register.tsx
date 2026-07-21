import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { registerUser, extractApiErrorMessage } from '../lib/api'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser({ name, email, password, confirmPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Could not create your account.'))
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
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                <UserPlus size={24} />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create a host account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Registered hosts can create and manage quiz rooms.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="Name" required minLength={1} value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                required
                minLength={6}
                maxLength={20}
                hint="6-20 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                required
                minLength={6}
                maxLength={20}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <Alert tone="error">{error}</Alert>}
              {success && <Alert tone="success">Account created! Redirecting to login…</Alert>}
              <Button type="submit" isLoading={isSubmitting} fullWidth>
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-300">
                Log in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </GradientShell>
  )
}
