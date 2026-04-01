/**
 * @typedef {Object} DailyLog
 * @property {string} id
 * @property {string} date - YYYY-MM-DD
 * @property {boolean} speaking_done
 * @property {boolean} vocab_done
 * @property {boolean} review_done
 * @property {number} minutes_studied
 * @property {string} notes
 */

const TABLE = 'daily_logs'

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {Omit<DailyLog, 'id'>} row
 * @returns {Promise<{ data: DailyLog | null, error: Error | null }>}
 */
export async function insertDailyLog(client, row) {
  const { data, error } = await client
    .from(TABLE)
    .insert({
      date: row.date,
      speaking_done: row.speaking_done,
      vocab_done: row.vocab_done,
      review_done: row.review_done,
      minutes_studied: row.minutes_studied,
      notes: row.notes ?? '',
    })
    .select()
    .single()

  return { data: data ?? null, error: error ? new Error(error.message) : null }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string} id
 * @param {Partial<Pick<DailyLog, 'speaking_done' | 'vocab_done' | 'review_done' | 'minutes_studied' | 'notes'>>} patch
 */
export async function updateDailyLog(client, id, patch) {
  const { data, error } = await client
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  return { data: data ?? null, error: error ? new Error(error.message) : null }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {{ from?: string, to?: string }} [range] - inclusive YYYY-MM-DD
 */
export async function fetchDailyLogs(client, range = {}) {
  let q = client.from(TABLE).select('*').order('date', { ascending: false })

  if (range.from) q = q.gte('date', range.from)
  if (range.to) q = q.lte('date', range.to)

  const { data, error } = await q

  return {
    data: /** @type {DailyLog[] | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/**
 * Upsert by calendar date (one log per day).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {Omit<DailyLog, 'id'> & { id?: string }} row
 */
export async function upsertDailyLogByDate(client, row) {
  const payload = {
    date: row.date,
    speaking_done: row.speaking_done,
    vocab_done: row.vocab_done,
    review_done: row.review_done,
    minutes_studied: row.minutes_studied,
    notes: row.notes ?? '',
  }

  const { data, error } = await client
    .from(TABLE)
    .upsert(payload, { onConflict: 'date' })
    .select()
    .single()

  return { data: data ?? null, error: error ? new Error(error.message) : null }
}
