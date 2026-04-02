import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, subDays } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabaseClient'
import {
  calculateStudyStreak,
  calculateTotalMinutesPerDay,
  fetchSessionsLast30Days,
  saveStudySession,
} from '../../lib/studySessions'
import { toLocalDateKey } from '../../utils/localDateKey'
import { TodaySection } from './TodaySection'
import { LowEnergyMode } from './LowEnergyMode'
import { InsightsPanel } from './InsightsPanel'

const ACTIVITY_KEYS = ['speaking', 'vocab', 'review']
const DAILY_GOAL_MINUTES = 30

function getStatusByMinutes(minutes) {
  if (minutes >= DAILY_GOAL_MINUTES) return 'green'
  if (minutes >= 15) return 'yellow'
  return 'red'
}

export function Dashboard() {
  const client = useMemo(() => getSupabaseClient(), [])
  const todayKey = toLocalDateKey()

  const [sessions, setSessions] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [speaking, setSpeaking] = useState(false)
  const [vocab, setVocab] = useState(false)
  const [review, setReview] = useState(false)
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')

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

  const streak = useMemo(
    () => calculateStudyStreak(minutesByDay, todayKey),
    [minutesByDay, todayKey],
  )

  const weeklyMinutes = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    let total = 0
    for (let i = 0; i < 7; i++) {
      const key = format(subDays(start, -i), 'yyyy-MM-dd')
      total += minutesByDay[key] ?? 0
    }
    return total
  }, [minutesByDay])

  const chartData = useMemo(() => {
    const out = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const key = format(d, 'yyyy-MM-dd')
      const total = minutesByDay[key] ?? 0
      out.push({
        day: format(d, 'EEE'),
        minutes: total,
        status: getStatusByMinutes(total),
      })
    }
    return out
  }, [minutesByDay])

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
        <p className="est-muted">Daily consistency over rigid schedules.</p>
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
        dailyGoal={DAILY_GOAL_MINUTES}
        todayMinutes={todayMinutes}
        streak={streak}
        weeklyMinutes={weeklyMinutes}
        status={getStatusByMinutes(todayMinutes)}
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
