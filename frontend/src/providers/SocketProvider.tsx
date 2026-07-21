import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { connectSocket } from '../lib/socket'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type {
  AnswerSubmittedPayload,
  QuestionShowPayload,
  QuestionStatsPayload,
  QuizEndedPayload,
  QuizStartedPayload,
  RoomEndedPayload,
  RoomMember,
} from '../types'

/**
 * Root-level provider that owns the single socket connection and every
 * server -> client listener. This has to live above all routes (not inside
 * a single page) because the backend auto-rejoins a reconnecting identity to
 * its active room and may immediately replay `quiz:started` / `question:show`
 * - a hard refresh mid-quiz needs these listeners already wired up to land
 * on the right screen.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    if (!isAuthenticated) return

    const socket = connectSocket()
    const game = useGameStore.getState

    function goToRunningScreen() {
      const isHost = game().isHost
      navigateRef.current(isHost ? '/host-console' : '/play')
    }

    function onConnect() {
      useGameStore.getState().setConnectionError(null)
    }

    function onConnectError(err: Error) {
      useGameStore.getState().setConnectionError(err.message || 'Could not connect to the server.')
    }

    function onDisconnect(reason: string) {
      if (reason === 'io client disconnect') return
      useGameStore.getState().setConnectionError('Disconnected from the server. Trying to reconnect…')
    }

    function onPlayerListUpdate(members: RoomMember[]) {
      useGameStore.getState().setMembers(members)
    }

    function onQuizStarted(_payload: QuizStartedPayload) {
      useGameStore.getState().setStatus('running')
      goToRunningScreen()
    }

    function onQuestionShow(payload: QuestionShowPayload) {
      useGameStore.getState().showQuestion(payload.question)
      goToRunningScreen()
    }

    function onQuestionStats(payload: QuestionStatsPayload) {
      if (payload.type === 'mcq') {
        useGameStore.getState().setMcqStats(payload)
      } else {
        useGameStore.getState().setWrittenStats(payload)
      }
    }

    function onQuizEnded(payload: QuizEndedPayload) {
      useGameStore.getState().setLeaderboard(payload.leaderboard, payload.message)
      navigateRef.current('/results')
    }

    function onRoomEnded(payload: RoomEndedPayload) {
      useGameStore.getState().setRoomEnded(payload.message)
      navigateRef.current('/results')
    }

    function onAnswerSubmitted(_payload: AnswerSubmittedPayload) {
      // Reserved: could drive a "N of M answered" indicator later. Not
      // surfaced yet since the backend gives no total member count here.
    }

    socket.on('connect', onConnect)
    socket.on('connect_error', onConnectError)
    socket.on('disconnect', onDisconnect)
    socket.on('player:list:update', onPlayerListUpdate)
    socket.on('quiz:started', onQuizStarted)
    socket.on('question:show', onQuestionShow)
    socket.on('question:stats', onQuestionStats)
    socket.on('quiz:ended', onQuizEnded)
    socket.on('room:ended', onRoomEnded)
    socket.on('answer:submitted', onAnswerSubmitted)

    return () => {
      socket.off('connect', onConnect)
      socket.off('connect_error', onConnectError)
      socket.off('disconnect', onDisconnect)
      socket.off('player:list:update', onPlayerListUpdate)
      socket.off('quiz:started', onQuizStarted)
      socket.off('question:show', onQuestionShow)
      socket.off('question:stats', onQuestionStats)
      socket.off('quiz:ended', onQuizEnded)
      socket.off('room:ended', onRoomEnded)
      socket.off('answer:submitted', onAnswerSubmitted)
    }
  }, [isAuthenticated])

  return <>{children}</>
}
