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
 * @param {Date} [anchorDate]
 */
export function calculateWeeklyActiveDays(minutesByDay, anchorDate = new Date()) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  let active = 0
  for (let i = 0; i < 7; i++) {
    const key = format(subDays(weekStart, -i), 'yyyy-MM-dd')
    if ((minutesByDay[key] ?? 0) > 0) active += 1
  }
  return { completed: active, total: 7 }
}