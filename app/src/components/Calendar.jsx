import { Play, Check, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { daysOfWeek, dayNames } from '../data/defaults.js'

export function Calendar() {
  const { state, openTimerModal, openManualCompleteModal, openEditPointsModal } = useApp()
  const { schedule, weeks, currentWeekKey } = state
  const weekData = weeks[currentWeekKey] ?? { activities: {} }
  const activitiesState = weekData.activities ?? {}

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        <span aria-hidden>📅</span>
        Calendário Semanal
      </h2>
      <div className="flex flex-col gap-3">
        {daysOfWeek.map((day, index) => {
          const dayActivities = schedule[day] ?? []
          return (
            <div
              key={day}
              className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50/50 dark:bg-gray-700/50"
            >
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 text-sm">
                {dayNames[index]}
              </div>
              <div className="p-2 flex flex-col gap-1.5">
                {dayActivities.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm py-1 px-2">Nenhuma atividade</p>
                ) : (
                  dayActivities.map((activity) => {
                    if (activity.type === 'rest') {
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm"
                        >
                          <span aria-hidden>😴</span>
                          {activity.activity}
                        </div>
                      )
                    }

                    const isCompleted = activitiesState[activity.id]?.completed ?? false
                    const pointsEarned = activitiesState[activity.id]?.pointsEarned ?? 0

                    return (
                      <div
                        key={activity.id}
                        className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-md border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-200 text-gray-600 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200'
                            : 'bg-white border-gray-200 hover:border-indigo-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-indigo-500'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                            {activity.time}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                            {activity.activity}
                          </span>
                          {activity.defaultPoints > 0 && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
                              {isCompleted ? `${pointsEarned}/${activity.defaultPoints}` : activity.defaultPoints} pts
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => openEditPointsModal(activity.id, activity.activity, pointsEarned)}
                              title="Editar pontos"
                              className="p-1.5 rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                              aria-label={`Editar pontos: ${activity.activity}`}
                            >
                              <Pencil className="w-4 h-4" aria-hidden />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openTimerModal(activity, day)}
                            disabled={isCompleted}
                            title="Iniciar com timer"
                            className="p-1.5 rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                            aria-label={`Timer: ${activity.activity}`}
                          >
                            <Play className="w-4 h-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => openManualCompleteModal(activity, day)}
                            disabled={isCompleted}
                            title="Concluir manualmente"
                            className="p-1.5 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            aria-label={`Concluir: ${activity.activity}`}
                          >
                            <Check className="w-4 h-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
