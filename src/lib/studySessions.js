import { format, startOfWeek, subDays } from 'date-fns'

const TABLE = 'study_sessions'

/**
 * @typedef {Object} StudySession
 * @property {string} id
 * @property {string} date - YYYY-MM-DD
 * @property {number} duration_minutes
 * @property {string} activity_type
 * @property {string | null} notes
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {{ date: string, duration_minutes: number, activity_type: string, notes?: string }} input
 */
export async function saveStudySession(client, input) {
  const { data, error } = await client
    .from(TABLE)
    .insert({
      date: input.date,
      duration_minutes: input.duration_minutes,
      activity_type: input.activity_type,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single()

  return {
    data: /** @type {StudySession | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
export async function fetchSessionsLast30Days(client) {
  const to = format(new Date(), 'yyyy-MM-dd')
  const from = format(subDays(new Date(), 29), 'yyyy-MM-dd')

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })

  return {
    data: /** @type {StudySession[] | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/**
 * @param {StudySession[]} sessions
 */
export function calculateTotalMinutesPerDay(sessions) {
  /** @type {Record<string, number>} */
  const totals = {}
  for (const s of sessions) {
    totals[s.date] = (totals[s.date] ?? 0) + Math.max(0, s.duration_minutes || 0)
  }
  return totals
}

/**
 * @param {Record<string, number>} minutesByDay
 * @param {string} todayKey YYYY-MM-DD
 */
export function calculateStudyStreak(minutesByDay, todayKey) {
  const parseLocal = (key) => {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  let cursor = parseLocal(todayKey)
  if ((minutesByDay[todayKey] ?? 0) <= 0) {
    cursor = subDays(cursor, 1)
  }

  let streak = 0
  for (;;) {
    const key = format(cursor, 'yyyy-MM-dd')
    if ((minutesByDay[key] ?? 0) <= 0) break
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}

/**
 * @param {Record<string, number>} minutesByDay
 * @param {string} todayKey - YYYY-MM-DD
 * @param {number} threshold - Success threshold (default 20)
 */
export function calculateStreakStats(minutesByDay, todayKey, threshold = 20) {
  const dates = Object.keys(minutesByDay).sort()
  if (dates.length === 0) return { current: 0, best: 0 }

  // 1. Calculate Best Streak (all time)
  let best = 0
  let currentAccumulated = 0
  
  // We need to iterate through a continuous range of dates to find gaps
  const firstDate = new Date(dates[0])
  const lastDate = new Date(todayKey)
  const diffDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24))

  for (let i = 0; i <= diffDays; i++) {
    const d = new Date(firstDate)
    d.setDate(d.getDate() + i)
    const key = format(d, 'yyyy-MM-dd')
    const mins = minutesByDay[key] ?? 0
    
    if (mins >= threshold) {
      currentAccumulated += 1
      best = Math.max(best, currentAccumulated)
    } else {
      currentAccumulated = 0
    }
  }

  // 2. Calculate Current Streak (working backwards from today)
  let current = 0
  let cursor = new Date(todayKey)
  
  // If today isn't done yet, check if yesterday was a streak day
  if ((minutesByDay[todayKey] ?? 0) < threshold) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const key = format(cursor, 'yyyy-MM-dd')
    const mins = minutesByDay[key] ?? 0
    if (mins < threshold) break
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { current, best }
}

/**
 * @param {Record<string, number>} minutesByDay
 * @param {Date} [anchorDate]
 */
export function calculateWeeklyActiveDays(minutesByDay, anchorDate = new Date()) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  let active = 0
  for (let i = 0; i < 7; i++) {
    const key = format(subDays(weekStart, -i), 'yyyy-MM-dd')
    if ((minutesByDay[key] ?? 0) >= 20) active += 1
  }
  return { completed: active, total: 7 }
}