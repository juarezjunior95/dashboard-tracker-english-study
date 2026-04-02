import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, subDays } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabaseClient'
import {
  calculateTotalMinutesPerDay,
  calculateStreakStats,
  fetchSessionsLast30Days,
  saveStudySession,
} from '../../lib/studySessions'
import {
  addVocabularyWord,
  fetchVocabularyWords,
  markVocabularyReviewed,
} from '../../lib/vocabularyWords'
import { toLocalDateKey } from '../../utils/localDateKey'
import { TodaySection } from './TodaySection'
import { LowEnergyMode } from './LowEnergyMode'
import { InsightsPanel } from './InsightsPanel'
import { VocabularyPanel } from './VocabularyPanel'

const ACTIVITY_KEYS = [
  'speaking',
  'vocabulary',
  'review',
  'listening',
  'reading',
  'writing',
  'other',
]
const DEFAULT_DAILY_GOAL = 30
const DEFAULT_MINIMUM_GOAL = 20

function clampGoal(value, fallback) {
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) return fallback
  return parsed
}

function getStatusByMinutes(minutes) {
  if (minutes >= 30) return 'green'
  if (minutes >= 15) return 'yellow'
  return 'red'
}

// calculateGentleStreak was replaced by calculateStreakStats in studySessions.js

function getWeeklySuccessLabel(days) {
  if (days >= 5) return 'Good consistency (5/7+ days)'
  if (days >= 3) return 'Average consistency (3-4/7 days)'
  return 'Needs improvement (<3/7 days)'
}

function getMotivationalMessage({ minutes, streak }) {
  if (minutes >= 30) return 'Great job! Full goal completed'
  if (minutes >= 20) return 'You reached your minimum goal'
  if (minutes === 0) return 'Start with just 10 minutes today'
  if (streak >= 3) return "You're building a strong habit 🔥"
  if (minutes >= 30) return 'Great consistency! Keep going' // Note: prioritized above
  return 'Every minute counts. Keep focus on consistency!'
}

export function Dashboard() {
  const client = useMemo(() => getSupabaseClient(), [])
  const todayKey = toLocalDateKey()

  const [sessions, setSessions] = useState([])
  const [vocabularyWords, setVocabularyWords] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const dailyGoal = DEFAULT_DAILY_GOAL

  const [selectedActivity, setSelectedActivity] = useState('speaking')
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')

  const successGoal = minimumGoalMode ? minimumGoal : dailyGoal

  const applyTodayFromSessions = useCallback((list) => {
    const todaySessions = list.filter((s) => s.date === todayKey)

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

    const { data: words, error: vocabError } = await fetchVocabularyWords(client)
    if (vocabError) {
      setLoadError(vocabError.message)
      return
    }

    setLoadError(null)
    const list = data ?? []
    setSessions(list)
    setVocabularyWords(words ?? [])
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

  const { current: streak, best: bestStreak } = useMemo(
    () => calculateStreakStats(minutesByDay, todayKey, 20),
    [minutesByDay, todayKey],
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
        status: getStatusByMinutes(total),
      })
    }
    return out
  }, [minutesByDay, dailyGoal])

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
    () => getMotivationalMessage({ minutes: todayMinutes, streak }),
    [todayMinutes, streak],
  )

  const handleActivityChange = (value) => {
    setSelectedActivity(value)
  }

  const handleComplete = async () => {
    if (!client) return

    const parsedMinutes = Math.max(0, parseInt(minutes, 10) || 0)
    if (parsedMinutes <= 0 && !notes.trim()) {
      setSaveError('Add minutes or notes before saving.')
      return
    }

    setSaveError(null)
    setSaving(true)

    const row = {
      date: todayKey,
      activity_type: selectedActivity,
      duration_minutes: parsedMinutes,
      notes,
    }

    const { error } = await saveStudySession(client, row)
    if (error) {
      setSaving(false)
      setSaveError(error.message)
      return
    }

    setMinutes('0')
    setNotes('')
    setSaving(false)
    await reload()
  }

  const formattedToday = format(new Date(), 'EEEE, MMM d')

  const handleAddVocabularyWord = async (word) => {
    if (!client) return
    const { error } = await addVocabularyWord(client, word, todayKey)
    if (error) throw error
    await reload()
  }

  const handleMarkVocabularyReviewed = async (wordId) => {
    if (!client) return
    const row = vocabularyWords.find((w) => w.id === wordId)
    if (!row) return
    const { error } = await markVocabularyReviewed(client, row, todayKey)
    if (error) throw error
    await reload()
  }

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
        todayMinutes={todayMinutes}
        todayPercentage={todayPercentage}
        streak={streak}
        bestStreak={bestStreak}
        weeklyMinutes={weeklyMinutes}
        weeklySuccessLabel={`${weeklySuccessDays}/7 success days - ${weeklySuccessLabel}`}
        motivationalMessage={motivationalMessage}
        status={getStatusByMinutes(todayMinutes)}
        chartData={chartData}
        topActivities={topActivities}
      />

      <TodaySection
        activityList={ACTIVITY_KEYS}
        selectedActivity={selectedActivity}
        onActivityChange={handleActivityChange}
        minutes={minutes}
        notes={notes}
        onMinutesChange={setMinutes}
        onNotesChange={setNotes}
        onComplete={handleComplete}
        saving={saving}
        disabled={!client}
        todayLabel={formattedToday}
        dateKey={todayKey}
      />

      <VocabularyPanel
        words={vocabularyWords}
        onAddWord={handleAddVocabularyWord}
        onMarkReviewed={handleMarkVocabularyReviewed}
        disabled={!client}
      />

      <LowEnergyMode />
    </div>
  )
}
