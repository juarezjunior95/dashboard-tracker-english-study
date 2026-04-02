import { format, startOfWeek, endOfWeek } from 'date-fns'

const TABLE = 'vocabulary_words'

/**
 * @typedef {{ id: string, word: string, learned_date: string, review_count: number, reviewed_at: string | null }} VocabularyWord
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 */
export async function fetchVocabularyWords(client) {
  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .order('learned_date', { ascending: false })
    .limit(200)

  return {
    data: /** @type {VocabularyWord[] | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string} word
 * @param {string} learnedDate
 */
export async function addVocabularyWord(client, word, learnedDate) {
  const normalized = word.trim().toLowerCase()
  const { data, error } = await client
    .from(TABLE)
    .insert({
      word: normalized,
      learned_date: learnedDate,
      review_count: 0,
      reviewed_at: null,
    })
    .select()
    .single()

  return {
    data: /** @type {VocabularyWord | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {VocabularyWord} wordRow
 * @param {string} reviewedDate
 */
export async function markVocabularyReviewed(client, wordRow, reviewedDate) {
  const { data, error } = await client
    .from(TABLE)
    .update({
      review_count: (wordRow.review_count ?? 0) + 1,
      reviewed_at: reviewedDate,
    })
    .eq('id', wordRow.id)
    .select()
    .single()

  return {
    data: /** @type {VocabularyWord | null} */ (data ?? null),
    error: error ? new Error(error.message) : null,
  }
}

/** @param {VocabularyWord[]} words */
export function totalWordsLearned(words) {
  return words.length
}

/**
 * @param {VocabularyWord[]} words
 * @param {Date} [anchor]
 */
export function wordsReviewedThisWeek(words, anchor = new Date()) {
  const from = format(startOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const to = format(endOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  return words.filter((w) => w.reviewed_at && w.reviewed_at >= from && w.reviewed_at <= to).length
}

/** @param {VocabularyWord} word */
export function spacedRepetitionIndicator(word) {
  if (word.review_count >= 5) return 'Strong'
  if (word.review_count >= 2) return 'In progress'
  return 'Due'
}
