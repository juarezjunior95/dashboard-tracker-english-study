import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export function WeekNavigation() {
  const { currentWeekRange, goToPrevWeek, goToNextWeek } = useApp()

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      <button
        type="button"
        onClick={goToPrevWeek}
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base min-h-[44px] touch-manipulation"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Semana Anterior</span>
        <span className="sm:hidden">Anterior</span>
      </button>
      <span
        className="px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 font-medium min-w-0 max-w-full text-center text-sm sm:text-base truncate"
        aria-live="polite"
      >
        {currentWeekRange.rangeString}
      </span>
      <button
        type="button"
        onClick={goToNextWeek}
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base min-h-[44px] touch-manipulation"
      >
        <span className="hidden sm:inline">Próxima Semana</span>
        <span className="sm:hidden">Próxima</span>
        <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
      </button>
    </div>
  )
}
