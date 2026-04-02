import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const BAR_COLORS = {
  green: '#34d399',
  yellow: '#fbbf24',
  red: '#f87171',
}

/**
 * @param {{
 *  dailyGoal: number,
 *  minimumGoal: number,
 *  minimumGoalMode: boolean,
 *  onDailyGoalChange: (value: string) => void,
 *  onMinimumGoalChange: (value: string) => void,
 *  onMinimumGoalModeChange: (checked: boolean) => void,
 *  todayMinutes: number,
 *  todayPercentage: number,
 *  streak: number,
 *  bestStreak: number,
 *  weeklyMinutes: number,
 *  weeklySuccessLabel: string,
 *  motivationalMessage: string,
 *  status: 'green'|'yellow'|'red',
 *  chartData: { day: string, minutes: number, percentage: number, status: 'green'|'yellow'|'red' }[],
 *  topActivities: { type: string, sessions: number, minutes: number }[]
 * }} props
 */
export function InsightsPanel({
  todayMinutes,
  todayPercentage,
  streak,
  bestStreak,
  weeklyMinutes,
  weeklySuccessLabel,
  motivationalMessage,
  status,
  chartData,
  topActivities,
}) {
  const statusLabel =
    status === 'green'
      ? 'Goal reached'
      : status === 'yellow'
        ? 'Almost there'
        : 'Keep going'

  const statusClass = `est-status est-status--${status}`

  return (
    <section className="est-card est-insights">
      <div className="est-goal-info">
        <p className="est-muted">Success Target: 20 min • Daily Goal: 30 min</p>
        <div className="est-progress-bar-wrap">
          <div
            className={`est-progress-bar est-progress-bar--${status}`}
            style={{ width: `${Math.min(100, todayPercentage)}%` }}
          />
        </div>
      </div>

      <div className="est-insights__grid">
        <article className="est-metric">
          <p className="est-metric__label">Today completion</p>
          <p className="est-metric__value">{todayPercentage}%</p>
          <p className="est-muted">{todayMinutes} min studied</p>
          <span className={statusClass}>{statusLabel}</span>
        </article>

        <article className="est-metric">
          <p className="est-metric__label">Streak (Current / Best)</p>
          <p className="est-metric__value">{streak} / {bestStreak} <span className="est-days-text">days</span></p>
          <p className="est-muted">Valid day = 20 min</p>
        </article>

        <article className="est-metric">
          <p className="est-metric__label">Weekly progress</p>
          <p className="est-metric__value">{weeklyMinutes} min</p>
          <p className="est-muted">{weeklySuccessLabel}</p>
        </article>
      </div>

      <p className="est-feedback">{motivationalMessage}</p>

      <div className="est-chart-block">
        <h3 className="est-section-title">Last 7 days</h3>
        <div className="est-chart-wrap">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--est-border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--est-muted)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--est-muted)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                formatter={(value, _, item) => [`${value} min (${item.payload.percentage}%)`, 'Study']}
                contentStyle={{
                  background: 'var(--est-surface)',
                  border: '1px solid var(--est-border)',
                  borderRadius: 10,
                  color: 'var(--est-text)',
                }}
              />
              <ReferenceLine y={20} stroke="var(--est-danger)" strokeDasharray="3 3" label={{ position: 'right', value: '20m', fill: 'var(--est-danger)', fontSize: 10 }} />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.day} fill={entry.minutes >= 20 ? 'var(--est-accent)' : 'var(--est-border)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="est-activity-block">
        <h3 className="est-section-title">Most used activity types</h3>
        {topActivities.length === 0 ? (
          <p className="est-muted">No activities yet.</p>
        ) : (
          <ul className="est-activity-list">
            {topActivities.map((item) => (
              <li key={item.type} className="est-activity-item">
                <span className="est-activity-type">{item.type}</span>
                <span className="est-muted">{item.sessions} sessions - {item.minutes} min</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
