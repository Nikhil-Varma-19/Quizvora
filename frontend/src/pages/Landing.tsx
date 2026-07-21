import { useNavigate } from 'react-router-dom'
import { ArrowRight, MonitorPlay, Smartphone } from 'lucide-react'
import { GradientShell } from '../components/ui/GradientShell'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { useAuthStore } from '../store/authStore'

export function Landing() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  function handleHost() {
    if (isAuthenticated) navigate('/host')
    else navigate('/join?intent=host')
  }

  return (
    <GradientShell>
      <NavBar />

      <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-12 py-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full bg-violet-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            Real-time quizzing
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Ask a question.
            <br />
            <span className="bg-linear-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Watch the room light up.
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Quizvora runs live quizzes with instant answers, live leaderboards, and a big-screen
            experience your audience can follow from their phones.
          </p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Card className="animate-pop-in text-left">
            <CardBody className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <MonitorPlay size={24} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Host a quiz</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a room, author questions, and run the show from the big screen.
                </p>
              </div>
              <Button onClick={handleHost} fullWidth>
                Get started <ArrowRight size={18} />
              </Button>
            </CardBody>
          </Card>

          <Card className="animate-pop-in text-left">
            <CardBody className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                <Smartphone size={24} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Join a quiz</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Grab the room code from the host's screen and jump in from your phone.
                </p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/join')} fullWidth>
                Enter a code <ArrowRight size={18} />
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
      <Footer />
    </GradientShell>
  )
}
