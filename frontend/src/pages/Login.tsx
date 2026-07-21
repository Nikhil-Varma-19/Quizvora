import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { loginUser, extractApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const navigate = useNavigate()
  const setUserIdentity = useAuthStore((s) => s.setUserIdentity)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await loginUser({ email, password })
      setUserIdentity({ token: data.token, userId: data.userId, email: data.email, name: data.name })
      navigate('/host')
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Could not log in. Please check your credentials.'))
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
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <LogIn size={24} />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Host login</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Log in to create rooms and run your quizzes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <Alert tone="error">{error}</Alert>}
              <Button type="submit" isLoading={isSubmitting} fullWidth>
                Log in
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-semibold text-violet-600 dark:text-violet-300">
                Create a host account
              </Link>
            </p>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Just here to play?{' '}
              <Link to="/join" className="font-semibold text-violet-600 dark:text-violet-300">
                Join as a guest
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </GradientShell>
  )
}
