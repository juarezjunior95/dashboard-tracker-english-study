import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

export function EditGoalModal() {
  const { editGoalModalOpen, weeklyGoal, saveWeeklyProgress, closeEditGoalModal } = useApp()
  const [value, setValue] = useState(weeklyGoal)

  useEffect(() => {
    if (editGoalModalOpen) setValue(weeklyGoal)
  }, [editGoalModalOpen, weeklyGoal])

  if (!editGoalModalOpen) return null

  const handleSave = () => {
    saveWeeklyProgress({ weeklyGoal: Math.max(0, Number(value)) || 0 })
    closeEditGoalModal()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-goal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-4 border border-gray-200 dark:border-gray-700">
        <h3 id="edit-goal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Editar meta semanal
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Defina quantos pontos você quer atingir nesta semana.
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            aria-label="Meta de pontos"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            onClick={closeEditGoalModal}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
