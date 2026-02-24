import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export function WeekNavigation() {
  const { currentWeekRange, goToPrevWeek, goToNextWeek } = useApp()

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-4">
      <button
        type="button"
        onClick={goToPrevWeek}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Semana Anterior
      </button>
      <span
        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium min-w-[180px] text-center"
        aria-live="polite"
      >
        {currentWeekRange.rangeString}
      </span>
      <button
        type="button"
        onClick={goToNextWeek}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Próxima Semana
        <ChevronRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  )
}
