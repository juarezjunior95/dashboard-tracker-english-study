import { BookOpen } from 'lucide-react'

/** @param {Record<string, unknown>} props */
export function TodaySection({
  activityList = [],
  selectedActivity,
  onActivityChange,
  minutes,
  notes,
  onMinutesChange,
  onNotesChange,
  onComplete,
  saving,
  disabled,
  todayLabel,
  dateKey,
}) {
  return (
    <section className="est-card est-today">
      <header className="est-today__header">
        <h2>Today's Session</h2>
        <time className="est-muted" dateTime={dateKey}>
          {todayLabel}
        </time>
      </header>

      <div className="est-today__form">
        <label className="est-field">
          <span>Activity Type</span>
          <select
            value={selectedActivity}
            onChange={(e) => onActivityChange(e.target.value)}
            disabled={disabled}
            className="est-select"
          >
            {activityList.map((act) => (
              <option key={act} value={act}>
                {act.charAt(0).toUpperCase() + act.slice(1)}
              </option>
            ))}
          </select>
        </label>

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
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={disabled}
            placeholder="What did you focus on? (optional)"
          />
        </label>

        <button
          type="button"
          className="est-btn est-btn--primary"
          onClick={onComplete}
          disabled={disabled || saving}
        >
          {saving ? 'Saving…' : 'Log Session'}
        </button>
      </div>
    </section>
  )
}
