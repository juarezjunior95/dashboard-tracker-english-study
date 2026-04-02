import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, subDays } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabaseClient'
import {
  calculateTotalMinutesPerDay,
  fetchSessionsLast30Days,
  saveStudySession,
} from '../../lib/studySessions'
import { toLocalDateKey } from '../../utils/localDateKey'
import { TodaySection } from './TodaySection'
import { LowEnergyMode } from './LowEnergyMode'
import { InsightsPanel } from './InsightsPanel'

const ACTIVITY_KEYS = ['speaking', 'vocab', 'review']
const DEFAULT_DAILY_GOAL = 30
const DEFAULT_MINIMUM_GOAL = 20

function clampGoal(value, fallback) {
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) return fallback
  return parsed
}

function getStatusByMinutes(minutes, successGoal) {
  if (minutes >= successGoal) return 'green'
  if (minutes >= Math.max(15, Math.floor(successGoal * 0.5))) return 'yellow'
  return 'red'
}

function calculateGentleStreak(minutesByDay, anchorKey, successGoal) {
  const [y, m, d] = anchorKey.split('-').map(Number)
  let cursor = new Date(y, m - 1, d)
  let misses = 0
  let streak = 0

  const todayMinutes = minutesByDay[anchorKey] ?? 0
  if (todayMinutes < successGoal) {
    misses = 1
  } else {
    streak += 1
  }

  for (let i = 0; i < 60; i++) {
    cursor = subDays(cursor, 1)
    const key = format(cursor, 'yyyy-MM-dd')
    const mins = minutesByDay[key] ?? 0

    if (mins >= successGoal) {
      streak += 1
      continue
    }

    misses += 1
    if (misses >= 2) break
  }

  return streak
}

function getWeeklySuccessLabel(days) {
  if (days >= 5) return 'Good consistency (5/7+ days)'
  if (days >= 3) return 'Average consistency (3-4/7 days)'
  return 'Needs improvement (<3/7 days)'
}

function getMotivationalMessage({ percentage, weeklyDays, streak }) {
  if (percentage >= 100 && weeklyDays >= 5) {
    return `Excellent work. You are on fire with a ${streak}-day streak.`
  }
  if (percentage >= 100) {
    return 'Goal completed today. Keep this rhythm for the rest of the week.'
  }
  if (percentage >= 70) {
    return 'Strong progress today. One short push and you will hit your goal.'
  }
  if (weeklyDays >= 3) {
    return 'Your week is moving forward. Small sessions still build fluency.'
  }
  return 'Today can be a restart day. Even 10 focused minutes count.'
}

export function Dashboard() {
  const client = useMemo(() => getSupabaseClient(), [])
  const todayKey = toLocalDateKey()

  const [sessions, setSessions] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL)
  const [minimumGoalMode, setMinimumGoalMode] = useState(true)
  const [minimumGoal, setMinimumGoal] = useState(DEFAULT_MINIMUM_GOAL)

  const [speaking, setSpeaking] = useState(false)
  const [vocab, setVocab] = useState(false)
  const [review, setReview] = useState(false)
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')

  const successGoal = minimumGoalMode ? minimumGoal : dailyGoal

  const applyTodayFromSessions = useCallback((list) => {
    const todaySessions = list.filter((s) => s.date === todayKey)
    setSpeaking(todaySessions.some((s) => s.activity_type === 'speaking'))
    setVocab(todaySessions.some((s) => s.activity_type === 'vocab'))
    setReview(todaySessions.some((s) => s.activity_type === 'review'))

    const total = todaySessions.reduce(
      (sum, s) => sum + Math.max(0, s.duration_minutes || 0),
      0,
    )
    setMinutes(String(total))

    const lastNote = [...todaySessions]
      .reverse()
      .find((s) => s.notes && s.notes.trim())?.notes
    setNotes(lastNote ?? '')
  }, [todayKey])

  const reload = useCallback(async () => {
    if (!client) {
      setSessions([])
      applyTodayFromSessions([])
      return
    }

    const { data, error } = await fetchSessionsLast30Days(client)
    if (error) {
      setLoadError(error.message)
      return
    }

    setLoadError(null)
    const list = data ?? []
    setSessions(list)
    applyTodayFromSessions(list)
  }, [client, applyTodayFromSessions])

  useEffect(() => {
    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return
      await reload()
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reload])

  const minutesByDay = useMemo(() => calculateTotalMinutesPerDay(sessions), [sessions])
  const todayMinutes = minutesByDay[todayKey] ?? 0
  const todayPercentage = useMemo(
    () => Math.min(200, Math.round((todayMinutes / Math.max(1, dailyGoal)) * 100)),
    [todayMinutes, dailyGoal],
  )

  const streak = useMemo(
    () => calculateGentleStreak(minutesByDay, todayKey, successGoal),
    [minutesByDay, todayKey, successGoal],
  )

  const { weeklyMinutes, weeklySuccessDays } = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    let total = 0
    let successDays = 0
    for (let i = 0; i < 7; i++) {
      const key = format(subDays(start, -i), 'yyyy-MM-dd')
      const mins = minutesByDay[key] ?? 0
      total += mins
      if (mins >= successGoal) successDays += 1
    }
    return { weeklyMinutes: total, weeklySuccessDays: successDays }
  }, [minutesByDay, successGoal])

  const weeklySuccessLabel = getWeeklySuccessLabel(weeklySuccessDays)

  const chartData = useMemo(() => {
    const out = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const key = format(d, 'yyyy-MM-dd')
      const total = minutesByDay[key] ?? 0
      out.push({
        day: format(d, 'EEE'),
        minutes: total,
        percentage: Math.min(200, Math.round((total / Math.max(1, dailyGoal)) * 100)),
        status: getStatusByMinutes(total, successGoal),
      })
    }
    return out
  }, [minutesByDay, dailyGoal, successGoal])

  const topActivities = useMemo(() => {
    const usage = {}
    for (const s of sessions) {
      const type = s.activity_type || 'other'
      if (!usage[type]) usage[type] = { type, sessions: 0, minutes: 0 }
      usage[type].sessions += 1
      usage[type].minutes += Math.max(0, s.duration_minutes || 0)
    }

    return Object.values(usage)
      .sort((a, b) => b.sessions - a.sessions || b.minutes - a.minutes)
      .slice(0, 5)
  }, [sessions])

  const motivationalMessage = useMemo(
    () => getMotivationalMessage({ percentage: todayPercentage, weeklyDays: weeklySuccessDays, streak }),
    [todayPercentage, weeklySuccessDays, streak],
  )

  const handleToggle = (key) => {
    if (key === 'speaking') setSpeaking((v) => !v)
    if (key === 'vocab') setVocab((v) => !v)
    if (key === 'review') setReview((v) => !v)
  }

  const handleComplete = async () => {
    if (!client) return

    const selected = ACTIVITY_KEYS.filter((k) => {
      if (k === 'speaking') return speaking
      if (k === 'vocab') return vocab
      return review
    })

    const parsedMinutes = Math.max(0, parseInt(minutes, 10) || 0)
    if (!selected.length && parsedMinutes <= 0 && !notes.trim()) {
      setSaveError('Add at least one activity, minutes, or notes before saving.')
      return
    }

    setSaveError(null)
    setSaving(true)

    const base = selected.length > 0 ? Math.floor(parsedMinutes / selected.length) : parsedMinutes
    const remainder = selected.length > 0 ? parsedMinutes % selected.length : 0

    const sessionsToSave = selected.length
      ? selected.map((activityType, idx) => ({
          date: todayKey,
          activity_type: activityType,
          duration_minutes: base + (idx < remainder ? 1 : 0),
          notes: idx === 0 ? notes : '',
        }))
      : [
          {
            date: todayKey,
            activity_type: 'general',
            duration_minutes: parsedMinutes,
            notes,
          },
        ]

    for (const row of sessionsToSave) {
      const { error } = await saveStudySession(client, row)
      if (error) {
        setSaving(false)
        setSaveError(error.message)
        return
      }
    }

    setSaving(false)
    await reload()
  }

  const formattedToday = format(new Date(), 'EEEE, MMM d')

  return (
    <div className="est-dashboard">
      <header className="est-dashboard__hero">
        <h1 className="est-dashboard__title">English Study Tracker</h1>
        <p className="est-muted">Flexible consistency for real-life routines.</p>
      </header>

      {!client && (
        <p className="est-banner" role="status">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
          to <code>.env</code> (see <code>.env.example</code>). Run the SQL migration
          in Supabase to create <code>study_sessions</code>.
        </p>
      )}

      {loadError && (
        <p className="est-banner est-banner--error" role="alert">
          {loadError}
        </p>
      )}
      {saveError && (
        <p className="est-banner est-banner--error" role="alert">
          {saveError}
        </p>
      )}

      <InsightsPanel
        dailyGoal={dailyGoal}
        minimumGoal={minimumGoal}
        minimumGoalMode={minimumGoalMode}
        onDailyGoalChange={(v) => setDailyGoal(clampGoal(v, dailyGoal))}
        onMinimumGoalChange={(v) => setMinimumGoal(clampGoal(v, minimumGoal))}
        onMinimumGoalModeChange={setMinimumGoalMode}
        todayMinutes={todayMinutes}
        todayPercentage={todayPercentage}
        streak={streak}
        weeklyMinutes={weeklyMinutes}
        weeklySuccessLabel={`${weeklySuccessDays}/7 success days - ${weeklySuccessLabel}`}
        motivationalMessage={motivationalMessage}
        status={getStatusByMinutes(todayMinutes, successGoal)}
        chartData={chartData}
        topActivities={topActivities}
      />

      <TodaySection
        speaking={speaking}
        vocab={vocab}
        review={review}
        minutes={minutes}
        notes={notes}
        onToggle={handleToggle}
        onMinutesChange={setMinutes}
        onNotesChange={setNotes}
        onComplete={handleComplete}
        saving={saving}
        disabled={!client}
        todayLabel={formattedToday}
        dateKey={todayKey}
      />

      <LowEnergyMode />
    </div>
  )
}
