import { Trophy, Pencil, Moon, Sun, Target } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export function Header() {
  const { totalPoints, weeklyGoal, openEditModal, openEditGoalModal, theme, toggleTheme } = useApp()

  return (
    <header className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg dark:from-violet-900 dark:to-indigo-900 dark:shadow-gray-900/20">
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          📚 B2 Study Tracker
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 shrink-0" aria-hidden />
            ) : (
              <Moon className="w-5 h-5 shrink-0" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={openEditGoalModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm font-semibold hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            aria-label="Pontos da semana e meta"
            title="Editar meta semanal"
          >
            <Trophy className="w-5 h-5 shrink-0" aria-hidden />
            <span>{totalPoints} / {weeklyGoal} pts</span>
            <Target className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
          </button>
          <button
            type="button"
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 dark:bg-white/90 dark:text-indigo-700 dark:hover:bg-white"
          >
            <Pencil className="w-4 h-4 shrink-0" aria-hidden />
            Editar Cronograma
          </button>
        </div>
      </div>
    </header>
  )
}
