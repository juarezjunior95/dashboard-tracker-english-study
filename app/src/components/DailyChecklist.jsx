import { CheckSquare, Circle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { daysOfWeek } from '../data/defaults.js'

export function DailyChecklist() {
  const { state, openManualCompleteModal } = useApp()
  const { schedule, weeks, currentWeekKey } = state
  const weekData = weeks[currentWeekKey] ?? { activities: {} }
  const activitiesState = weekData.activities ?? {}

  const today = new Date().getDay()
  const todayKey = daysOfWeek[today === 0 ? 6 : today - 1]
  const todayActivities = (schedule[todayKey] ?? []).filter((a) => a.type !== 'rest')

  let todayPoints = 0
  todayActivities.forEach((activity) => {
    const data = activitiesState[activity.id]
    if (data?.completed) todayPoints += data.pointsEarned ?? 0
  })

  return (
    <section className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 min-w-0">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
        Checklist de Hoje
      </h2>
      <div className="flex flex-col gap-2">
        {todayActivities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-2">Nenhuma atividade hoje.</p>
        ) : (
          todayActivities.map((activity) => {
            const completed = activitiesState[activity.id]?.completed ?? false
            const pointsEarned = activitiesState[activity.id]?.pointsEarned ?? 0

            return (
              <div
                key={activity.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${
                  completed
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-500 shrink-0" aria-hidden />
                  )}
                  <span className={`text-sm truncate ${completed ? 'text-gray-600 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                    {activity.time} – {activity.activity}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {pointsEarned}/{activity.defaultPoints} pts
                  </span>
                  {!completed && (
                    <button
                      type="button"
                      onClick={() => openManualCompleteModal(activity, todayKey)}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none focus:underline py-2 px-2 rounded touch-manipulation"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
        {todayActivities.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 mt-1 rounded-lg bg-sky-50 border border-sky-100 dark:bg-sky-900/30 dark:border-sky-800">
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Total do dia:</span>
            <span className="font-semibold text-sky-700 dark:text-sky-300">{todayPoints} pts</span>
          </div>
        )}
      </div>
    </section>
  )
}
