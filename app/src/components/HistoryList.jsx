import { Archive } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { getPerformanceLevel } from '../lib/points.js'

function formatWeekKey(weekKey) {
  if (!weekKey) return '–'
  const [y, m, d] = weekKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function HistoryList() {
  const { state, setCurrentWeekKey } = useApp()
  const history = [...(state.history ?? [])].reverse()

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
        <Archive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
        Histórico de Semanas
      </h3>
      <ul className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
        {history.length === 0 ? (
          <li className="text-gray-500 dark:text-gray-400 text-sm py-2 px-3">Nenhuma semana registrada.</li>
        ) : (
          history.map((entry) => {
            const level = getPerformanceLevel(entry.totalPoints ?? 0)
            const isCurrent = entry.weekKey === state.currentWeekKey

            return (
              <li key={entry.weekKey}>
                <button
                  type="button"
                  onClick={() => setCurrentWeekKey(entry.weekKey)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors flex flex-wrap items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-700 dark:ring-indigo-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatWeekKey(entry.weekKey)}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: level.color }}
                  >
                    {entry.totalPoints ?? 0} pts
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    F {entry.fluency ?? 0}/5 · C {entry.confidence ?? 0}/5
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
