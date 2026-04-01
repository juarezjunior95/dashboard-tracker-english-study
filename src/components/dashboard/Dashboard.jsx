import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { getSupabaseClient } from '../../lib/supabaseClient'
import { fetchDailyLogs, upsertDailyLogByDate } from '../../lib/dailyLogs'
import { toLocalDateKey } from '../../utils/localDateKey'
import {
  computeStreak,
  logsByDate,
  weeklyFullDaysCount,
} from '../../utils/studyStats'
import { ProgressStrip } from './ProgressStrip'
import { TodaySection } from './TodaySection'
import { LowEnergyMode } from './LowEnergyMode'

export function Dashboard() {
  const client = useMemo(() => getSupabaseClient(), [])
  const todayKey = toLocalDateKey()

  const [logs, setLogs] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [speaking, setSpeaking] = useState(false)
  const [vocab, setVocab] = useState(false)
  const [review, setReview] = useState(false)
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')

  const applyTodayFromLogs = useCallback((list) => {
    const t = logsByDate(list)[todayKey]
    if (t) {
      setSpeaking(t.speaking_done)
      setVocab(t.vocab_done)
      setReview(t.review_done)
      setMinutes(String(t.minutes_studied ?? 0))
      setNotes(t.notes ?? '')
    } else {
      setSpeaking(false)
      setVocab(false)
      setReview(false)
      setMinutes('0')
      setNotes('')
    }
  }, [todayKey])

  useEffect(() => {
    let cancelled = false

    async function load() {
      await Promise.resolve()
      if (cancelled) return

      if (!client) {
        setLogs([])
        applyTodayFromLogs([])
        return
      }

      const from = format(subDays(new Date(), 400), 'yyyy-MM-dd')
      const { data, error } = await fetchDailyLogs(client, {
        from,
        to: todayKey,
      })
      if (cancelled) return

      if (error) {
        setLoadError(error.message)
        return
      }

      setLoadError(null)
      const list = data ?? []
      setLogs(list)
      applyTodayFromLogs(list)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [client, todayKey, applyTodayFromLogs])

  const reload = useCallback(async () => {
    if (!client) {
      setLogs([])
      applyTodayFromLogs([])
      return
    }
    const from = format(subDays(new Date(), 400), 'yyyy-MM-dd')
    const { data, error } = await fetchDailyLogs(client, {
      from,
      to: todayKey,
    })
    if (error) {
      setLoadError(error.message)
      return
    }
    setLoadError(null)
    const list = data ?? []
    setLogs(list)
    applyTodayFromLogs(list)
  }, [client, todayKey, applyTodayFromLogs])

  const byDate = useMemo(() => logsByDate(logs), [logs])

  const streak = useMemo(
    () => computeStreak(byDate, todayKey),
    [byDate, todayKey],
  )
  const weekly = useMemo(
    () => weeklyFullDaysCount(logs, new Date()),
    [logs],
  )

  const handleToggle = (key) => {
    if (key === 'speaking') setSpeaking((v) => !v)
    if (key === 'vocab') setVocab((v) => !v)
    if (key === 'review') setReview((v) => !v)
  }

  const handleComplete = async () => {
    if (!client) return
    setSaveError(null)
    setSaving(true)
    const parsedMinutes = Math.max(0, parseInt(minutes, 10) || 0)
    const { error } = await upsertDailyLogByDate(client, {
      date: todayKey,
      speaking_done: speaking,
      vocab_done: vocab,
      review_done: review,
      minutes_studied: parsedMinutes,
      notes: notes.trim(),
    })
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
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
          in Supabase to create <code>daily_logs</code>.
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

      <ProgressStrip
        streak={streak}
        weeklyCompleted={weekly.completed}
        weeklyTotal={weekly.total}
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
