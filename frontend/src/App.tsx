import { Navigate, Route, Routes } from 'react-router-dom'
import { SocketProvider } from './providers/SocketProvider'
import { ConnectionBanner } from './components/ConnectionBanner'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { GuestJoin } from './pages/GuestJoin'
import { HostDashboard } from './pages/HostDashboard'
import { Lobby } from './pages/Lobby'
import { HostConsole } from './pages/HostConsole'
import { ParticipantPlay } from './pages/ParticipantPlay'
import { Results } from './pages/Results'

function App() {
  return (
    <SocketProvider>
      <ConnectionBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<GuestJoin />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/host-console" element={<HostConsole />} />
        <Route path="/play" element={<ParticipantPlay />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  )
}

export default App
