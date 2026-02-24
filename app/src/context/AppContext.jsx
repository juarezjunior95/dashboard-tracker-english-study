import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loadState, saveState, resetToDefault as storageReset } from '../lib/storage.js'
import { ensureCurrentWeek, buildHistoryFromWeeks } from '../lib/state.js'
import { getWeekKey, getWeekRange } from '../lib/dates.js'
import { calculatePoints } from '../lib/points.js'

const THEME_KEY = 'b2-study-tracker-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

/**
 * Atualiza estado, garante semana atual se necessário e persiste.
 */
function applyUpdate(prev, updater) {
  const next = updater(prev)
  if (next === prev) return prev
  ensureCurrentWeek(next)
  next.history = buildHistoryFromWeeks(next.weeks)
  saveState(next)
  return next
}

const initialTimerModal = { open: false, activity: null, day: null, mode: 'timer' }

export function AppProvider({ children }) {
  const [state, setState] = useState(() => ensureCurrentWeek(loadState()))
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [timerModal, setTimerModal] = useState(initialTimerModal)
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (_) {}
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState((prev) => (typeof next === 'function' ? next(prev) : next))
  }, [])
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const persist = useCallback((updater) => {
    setState((prev) => applyUpdate(prev, updater))
  }, [])

  const setCurrentWeekKey = useCallback((key) => {
    persist((prev) => ({
      ...prev,
      currentWeekKey: key
    }))
  }, [persist])

  const goToPrevWeek = useCallback(() => {
    const currentDate = new Date(state.currentWeekKey + 'T12:00:00')
    currentDate.setDate(currentDate.getDate() - 7)
    setCurrentWeekKey(getWeekKey(currentDate))
  }, [state.currentWeekKey, setCurrentWeekKey])

  const goToNextWeek = useCallback(() => {
    const currentDate = new Date(state.currentWeekKey + 'T12:00:00')
    currentDate.setDate(currentDate.getDate() + 7)
    setCurrentWeekKey(getWeekKey(currentDate))
  }, [state.currentWeekKey, setCurrentWeekKey])

  const completeActivity = useCallback((activity, userInput) => {
    persist((prev) => {
      const key = prev.currentWeekKey
      const weekData = prev.weeks[key] ?? {
        activities: {},
        weeklyProgress: { fluencyScore: 0, confidenceLevel: 0, mainGrammarMistake: '', newVocabulary: '', totalPoints: 0, weeklyGoal: 100 }
      }
      const pointsEarned = calculatePoints(activity, userInput ?? '')
      const activities = {
        ...weekData.activities,
        [activity.id]: {
          completed: true,
          completedAt: new Date().toISOString(),
          pointsEarned,
          userInput: userInput || null
        }
      }
      let totalPoints = 0
      Object.values(activities).forEach((act) => {
        if (act.completed) totalPoints += act.pointsEarned
      })
      const weeks = {
        ...prev.weeks,
        [key]: {
          ...weekData,
          activities,
          weeklyProgress: {
            ...weekData.weeklyProgress,
            totalPoints
          }
        }
      }
      return { ...prev, weeks }
    })
  }, [persist])

  const updateActivityPoints = useCallback((activityId, points) => {
    const pointsNum = Math.max(0, Number(points)) || 0
    persist((prev) => {
      const key = prev.currentWeekKey
      const weekData = prev.weeks[key]
      if (!weekData?.activities?.[activityId]) return prev
      const activities = {
        ...weekData.activities,
        [activityId]: { ...weekData.activities[activityId], pointsEarned: pointsNum }
      }
      let totalPoints = 0
      Object.values(activities).forEach((act) => {
        if (act.completed) totalPoints += (act.pointsEarned ?? 0)
      })
      const weeks = {
        ...prev.weeks,
        [key]: {
          ...weekData,
          activities,
          weeklyProgress: { ...weekData.weeklyProgress, totalPoints }
        }
      }
      return { ...prev, weeks }
    })
  }, [persist])

  const saveWeeklyProgress = useCallback((data) => {
    persist((prev) => {
      const key = prev.currentWeekKey
      const weekData = prev.weeks[key] ?? {
        activities: {},
        weeklyProgress: { fluencyScore: 0, confidenceLevel: 0, mainGrammarMistake: '', newVocabulary: '', totalPoints: 0, weeklyGoal: 100 }
      }
      const weeklyProgress = {
        ...weekData.weeklyProgress,
        ...data
      }
      const weeks = {
        ...prev.weeks,
        [key]: { ...weekData, weeklyProgress }
      }
      return { ...prev, weeks }
    })
  }, [persist])

  const saveSchedule = useCallback((newSchedule) => {
    persist((prev) => ({
      ...prev,
      schedule: typeof newSchedule === 'function' ? newSchedule(prev.schedule) : newSchedule
    }))
  }, [persist])

  const updateActivityTypes = useCallback((newActivityTypes) => {
    persist((prev) => ({
      ...prev,
      activityTypes: typeof newActivityTypes === 'function' ? newActivityTypes(prev.activityTypes) : newActivityTypes
    }))
  }, [persist])

  const resetToDefault = useCallback(() => {
    const next = ensureCurrentWeek(storageReset())
    next.history = buildHistoryFromWeeks(next.weeks)
    saveState(next)
    setState(next)
  }, [])

  const currentWeekRange = getWeekRange(new Date(state.currentWeekKey + 'T12:00:00'))
  const currentWeekData = state.weeks[state.currentWeekKey]
  const totalPoints = currentWeekData?.weeklyProgress?.totalPoints ?? 0
  const weeklyGoal = currentWeekData?.weeklyProgress?.weeklyGoal ?? 100

  const openEditModal = useCallback(() => setEditModalOpen(true), [])
  const closeEditModal = useCallback(() => setEditModalOpen(false), [])

  const openTimerModal = useCallback((activity, day) => {
    setTimerModal({ open: true, activity, day, mode: 'timer' })
  }, [])
  const openManualCompleteModal = useCallback((activity, day) => {
    setTimerModal({ open: true, activity, day, mode: 'manual' })
  }, [])
  const closeTimerModal = useCallback(() => {
    setTimerModal(initialTimerModal)
  }, [])

  const [editPointsModal, setEditPointsModal] = useState({ open: false, activityId: null, activityName: '', currentPoints: 0 })
  const openEditPointsModal = useCallback((activityId, activityName, currentPoints) => {
    setEditPointsModal({ open: true, activityId, activityName, currentPoints: currentPoints ?? 0 })
  }, [])
  const closeEditPointsModal = useCallback(() => {
    setEditPointsModal({ open: false, activityId: null, activityName: '', currentPoints: 0 })
  }, [])

  const [editGoalModalOpen, setEditGoalModalOpen] = useState(false)
  const openEditGoalModal = useCallback(() => setEditGoalModalOpen(true), [])
  const closeEditGoalModal = useCallback(() => setEditGoalModalOpen(false), [])

  const saveInterviews = useCallback((updater) => {
    setState((prev) => {
      const next = { ...prev, interviews: typeof updater === 'function' ? (updater(prev.interviews || []) || []) : updater }
      ensureCurrentWeek(next)
      next.history = buildHistoryFromWeeks(next.weeks)
      saveState(next)
      return next
    })
  }, [])

  const [interviewModal, setInterviewModal] = useState({ open: false, interview: null })
  const openInterviewModal = useCallback((interview = null) => {
    setInterviewModal({ open: true, interview })
  }, [])
  const closeInterviewModal = useCallback(() => {
    setInterviewModal({ open: false, interview: null })
  }, [])

  const value = {
    state,
    currentWeekRange,
    totalPoints,
    weeklyGoal,
    theme,
    setTheme,
    toggleTheme,
    editModalOpen,
    openEditModal,
    closeEditModal,
    timerModal,
    openTimerModal,
    openManualCompleteModal,
    closeTimerModal,
    editPointsModal,
    openEditPointsModal,
    closeEditPointsModal,
    updateActivityPoints,
    editGoalModalOpen,
    openEditGoalModal,
    closeEditGoalModal,
    setCurrentWeekKey,
    goToPrevWeek,
    goToNextWeek,
    completeActivity,
    saveWeeklyProgress,
    saveSchedule,
    updateActivityTypes,
    resetToDefault,
    saveInterviews,
    interviewModal,
    openInterviewModal,
    closeInterviewModal
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
