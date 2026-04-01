import { subDays, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'

/** @param {string} key YYYY-MM-DD local */
function parseLocalDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * @typedef {{ id: string, date: string, speaking_done: boolean, vocab_done: boolean, review_done: boolean, minutes_studied: number, notes: string }} DailyLog
 */

/** @param {DailyLog | undefined} log */
export function isFullDayComplete(log) {
  if (!log) return false
  return log.speaking_done && log.vocab_done && log.review_done
}

/**
 * Build a map date string -> log.
 * @param {DailyLog[]} logs
 */
export function logsByDate(logs) {
  /** @type {Record<string, DailyLog>} */
  const map = {}
  for (const log of logs) {
    map[log.date] = log
  }
  return map
}

/**
 * Consecutive calendar days ending at `anchorKey` where all three goals are done.
 * If today is not complete, streak counts from yesterday backward.
 * @param {Record<string, DailyLog>} byDate
 * @param {string} anchorKey - YYYY-MM-DD (usually "today" local)
 */
export function computeStreak(byDate, anchorKey) {
  let cursor = parseLocalDateKey(anchorKey)
  if (!isFullDayComplete(byDate[anchorKey])) {
    cursor = subDays(cursor, 1)
  }

  let streak = 0
  for (;;) {
    const key = format(cursor, 'yyyy-MM-dd')
    if (!isFullDayComplete(byDate[key])) break
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}

/**
 * Full days completed in the ISO week containing `anchorDate`.
 * @param {DailyLog[]} logs
 * @param {Date} anchorDate
 */
export function weeklyFullDaysCount(logs, anchorDate) {
  const start = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const end = endOfWeek(anchorDate, { weekStartsOn: 1 })
  const byDate = logsByDate(logs)

  const days = eachDayOfInterval({ start, end })
  let count = 0
  for (const d of days) {
    const key = format(d, 'yyyy-MM-dd')
    if (isFullDayComplete(byDate[key])) count += 1
  }
  return { completed: count, total: 7, start, end }
}
