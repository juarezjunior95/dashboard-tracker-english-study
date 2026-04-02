import { useState } from 'react'
import {
  spacedRepetitionIndicator,
  totalWordsLearned,
  wordsReviewedThisWeek,
} from '../../lib/vocabularyWords'

/**
 * @param {{
 *  words: import('../../lib/vocabularyWords').VocabularyWord[],
 *  onAddWord: (word: string) => Promise<void>,
 *  onMarkReviewed: (wordId: string) => Promise<void>,
 *  disabled: boolean
 * }} props
 */
export function VocabularyPanel({ words, onAddWord, onMarkReviewed, disabled }) {
  const [wordInput, setWordInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const total = totalWordsLearned(words)
  const reviewedWeek = wordsReviewedThisWeek(words)
  const recent = words.slice(0, 8)

  const handleAdd = async () => {
    const clean = wordInput.trim()
    if (!clean) return
    setBusy(true)
    setError('')
    try {
      await onAddWord(clean)
      setWordInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add word.')
    } finally {
      setBusy(false)
    }
  }

  const handleReviewed = async (id) => {
    setBusy(true)
    setError('')
    try {
      await onMarkReviewed(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update word.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="est-card est-vocab">
      <h3 className="est-section-title">Vocabulary tracking</h3>

      <div className="est-vocab-stats">
        <div>
          <p className="est-metric__label">Total words learned</p>
          <p className="est-metric__value">{total}</p>
        </div>
        <div>
          <p className="est-metric__label">Reviewed this week</p>
          <p className="est-metric__value">{reviewedWeek}</p>
        </div>
      </div>

      <div className="est-vocab-add">
        <input
          type="text"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          placeholder="Add new word..."
          disabled={disabled || busy}
        />
        <button
          type="button"
          className="est-btn est-btn--ghost"
          onClick={handleAdd}
          disabled={disabled || busy}
        >
          Add word
        </button>
      </div>

      {error && <p className="est-banner est-banner--error">{error}</p>}

      <ul className="est-vocab-list">
        {recent.map((w) => (
          <li key={w.id} className="est-vocab-item">
            <div>
              <strong>{w.word}</strong>
              <p className="est-muted">
                Reviews: {w.review_count} · SRS: {spacedRepetitionIndicator(w)}
              </p>
            </div>
            <button
              type="button"
              className="est-btn est-btn--ghost"
              onClick={() => handleReviewed(w.id)}
              disabled={disabled || busy}
            >
              Reviewed
            </button>
          </li>
        ))}
        {!recent.length && <li className="est-muted">No words yet.</li>}
      </ul>
    </section>
  )
}
