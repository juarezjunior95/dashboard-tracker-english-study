import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getInputLabel(type) {
  switch (type) {
    case 'listening':
      return '✍️ Escreva um resumo do que ouviu (mínimo 50 caracteres):'
    case 'anki':
      return '📝 Crie uma frase usando 2 palavras do Anki:'
    case 'grammar':
      return '🗣️ Escreva a frase que você falou usando a estrutura gramatical:'
    default:
      return 'Confirmar conclusão manual?'
  }
}

function needsInput(type) {
  return type === 'listening' || type === 'anki' || type === 'grammar'
}

export function TimerModal() {
  const { timerModal, completeActivity, closeTimerModal } = useApp()
  const { open, activity, day, mode } = timerModal

  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [userInput, setUserInput] = useState('')
  const intervalRef = useRef(null)
  const timerEndHandledRef = useRef(false)

  const isTimerMode = mode === 'timer'
  const inputLabel = activity ? getInputLabel(activity.type) : ''
  const requireMinChars = activity?.type === 'listening'
  const showTextarea = activity && (activity.type === 'listening' || activity.type === 'anki' || activity.type === 'grammar')
  const canComplete = !requireMinChars || userInput.trim().length >= 50

  useEffect(() => {
    if (!open || !activity) return
    timerEndHandledRef.current = false
    setShowInput(mode === 'manual')
    setUserInput('')
    if (mode === 'timer') {
      setTimeLeft(activity.duration * 60)
      setIsRunning(false)
    }
  }, [open, activity, mode])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (!isRunning && timeLeft === 0 && activity && isTimerMode && !timerEndHandledRef.current) {
      timerEndHandledRef.current = true
      if (needsInput(activity.type)) {
        setShowInput(true)
      } else {
        completeActivity(activity, '')
        closeTimerModal()
      }
    }
  }, [isRunning, timeLeft, activity, isTimerMode, completeActivity, closeTimerModal])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    if (activity) setTimeLeft(activity.duration * 60)
    setShowInput(false)
    setUserInput('')
  }

  const handleComplete = () => {
    if (!activity) return
    completeActivity(activity, userInput)
    closeTimerModal()
  }

  const handleClose = () => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    closeTimerModal()
  }

  if (!open || !activity) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 id="timer-modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {activity.activity}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {activity.time} · {activity.duration} min
              {mode === 'manual' ? ' (manual)' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {isTimerMode && !showInput && (
            <>
              <div className="text-3xl font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 py-2">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isRunning || timeLeft <= 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Play className="w-4 h-4" /> Iniciar
                </button>
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={!isRunning}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                >
                  <Pause className="w-4 h-4" /> Pausar
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                >
                  <RotateCcw className="w-4 h-4" /> Resetar
                </button>
              </div>
            </>
          )}

          {showInput && (
            <div className="space-y-3">
              {showTextarea ? (
                <>
                  <label htmlFor="activity-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {inputLabel}
                  </label>
                  <textarea
                    id="activity-input"
                    rows={3}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
                    placeholder="Digite aqui..."
                  />
                </>
              ) : (
                activity.type !== 'mock' && activity.type !== 'speaking' && activity.type !== 'structured' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{inputLabel}</p>
                )
              )}
              <button
                type="button"
                onClick={handleComplete}
                disabled={!canComplete}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <Check className="w-4 h-4" /> Concluir e Ganhar Pontos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
