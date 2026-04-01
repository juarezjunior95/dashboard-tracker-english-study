import { Mic, BookOpen, RotateCcw } from 'lucide-react'

/** @param {Record<string, unknown>} props */
export function TodaySection({
  speaking,
  vocab,
  review,
  minutes,
  notes,
  onToggle,
  onMinutesChange,
  onNotesChange,
  onComplete,
  saving,
  disabled,
  todayLabel,
  dateKey,
}) {
  const items = [
    { key: 'speaking', label: 'Speaking', checked: speaking, Icon: Mic },
    { key: 'vocab', label: 'Vocabulary', checked: vocab, Icon: BookOpen },
    { key: 'review', label: 'Review', checked: review, Icon: RotateCcw },
  ]

  return (
    <section className="est-card est-today">
      <header className="est-today__header">
        <h2>Today</h2>
        <time className="est-muted" dateTime={dateKey}>
          {todayLabel}
        </time>
      </header>

      <div className="est-checklist">
        {items.map((item) => {
          const CheckIcon = item.Icon
          return (
            <label key={item.key} className="est-check">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggle(item.key)}
                disabled={disabled}
              />
              <CheckIcon className="est-check__icon" size={18} aria-hidden />
              <span>{item.label}</span>
            </label>
          )
        })}
      </div>

      <label className="est-field">
        <span>Minutes studied</span>
        <input
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
        />
      </label>

      <label className="est-field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          placeholder="Optional reflection…"
        />
      </label>

      <button
        type="button"
        className="est-btn est-btn--primary"
        onClick={onComplete}
        disabled={disabled || saving}
      >
        {saving ? 'Saving…' : 'Complete my day'}
      </button>
    </section>
  )
}
