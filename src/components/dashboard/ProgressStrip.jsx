import { Flame, CalendarRange } from 'lucide-react'

/**
 * @param {{ streak: number, weeklyCompleted: number, weeklyTotal: number }} props
 */
export function ProgressStrip({ streak, weeklyCompleted, weeklyTotal }) {
  return (
    <div className="est-progress">
      <div className="est-progress__item">
        <Flame className="est-progress__icon" aria-hidden />
        <div>
          <div className="est-progress__value">{streak}</div>
          <div className="est-progress__label">day streak</div>
        </div>
      </div>
      <div className="est-progress__divider" />
      <div className="est-progress__item">
        <CalendarRange className="est-progress__icon" aria-hidden />
        <div>
          <div className="est-progress__value">
            {weeklyCompleted}/{weeklyTotal}
          </div>
          <div className="est-progress__label">full days this week</div>
        </div>
      </div>
    </div>
  )
}
