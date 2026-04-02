import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
 *  weeklyMinutes: number,
 *  weeklySuccessLabel: string,
 *  motivationalMessage: string,
 *  status: 'green'|'yellow'|'red',
 *  chartData: { day: string, minutes: number, percentage: number, status: 'green'|'yellow'|'red' }[],
 *  topActivities: { type: string, sessions: number, minutes: number }[]
 * }} props
 */
export function InsightsPanel({
  dailyGoal,
  minimumGoal,
  minimumGoalMode,
  onDailyGoalChange,
  onMinimumGoalChange,
  onMinimumGoalModeChange,
  todayMinutes,
  todayPercentage,
  streak,
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
      <div className="est-goal-config">
        <label className="est-goal-field">
          <span>Daily goal</span>
          <input type="number" min={1} value={dailyGoal} onChange={(e) => onDailyGoalChange(e.target.value)} />
        </label>
        <label className="est-goal-toggle">
          <input
            type="checkbox"
            checked={minimumGoalMode}
            onChange={(e) => onMinimumGoalModeChange(e.target.checked)}
          />
          <span>Minimum goal mode</span>
        </label>
        <label className="est-goal-field">
          <span>Minimum goal</span>
          <input
            type="number"
            min={1}
            value={minimumGoal}
            onChange={(e) => onMinimumGoalChange(e.target.value)}
            disabled={!minimumGoalMode}
          />
        </label>
      </div>

      <div className="est-insights__grid">
        <article className="est-metric">
          <p className="est-metric__label">Today completion</p>
          <p className="est-metric__value">{todayPercentage}%</p>
          <p className="est-muted">{todayMinutes} min studied</p>
          <span className={statusClass}>{statusLabel}</span>
        </article>

        <article className="est-metric">
          <p className="est-metric__label">Current streak</p>
          <p className="est-metric__value">{streak} days</p>
          <p className="est-muted">Gentle streak (1 skip tolerated)</p>
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
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.day} fill={BAR_COLORS[entry.status]} />
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
