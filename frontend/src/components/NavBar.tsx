import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from './ui/Button'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import logo from "../assets/quizvora-icon.svg"

export function NavBar() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const displayName = useAuthStore((s) => s.displayName)
  const type = useAuthStore((s) => s.type)
  const logout = useAuthStore((s) => s.logout)
  const resetGame = useGameStore((s) => s.reset)

  function handleLogout() {
    resetGame()
    logout()
    navigate('/')
  }

  return (
    <header className="relative z-20 flex w-full max-w-5xl items-center justify-between px-2 pb-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
      >
      <img src={logo} alt="Quizvora" width={70} height={50}  />
      </button>

      {isAuthenticated && (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-600 sm:inline dark:text-slate-300">
            {displayName} <span className="text-slate-400">· {type}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </Button>
        </div>
      )}
    </header>
  )
}
