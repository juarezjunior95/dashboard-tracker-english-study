import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { getPerformanceLevel } from '../lib/points.js'

export function WeeklySummary() {
  const { state, saveWeeklyProgress } = useApp()
  const weekData = state.weeks[state.currentWeekKey] ?? { weeklyProgress: {} }
  const progress = weekData.weeklyProgress ?? {}

  const [fluencyScore, setFluencyScore] = useState(progress.fluencyScore ?? 0)
  const [confidenceLevel, setConfidenceLevel] = useState(progress.confidenceLevel ?? 0)
  const [mainGrammarMistake, setMainGrammarMistake] = useState(progress.mainGrammarMistake ?? '')
  const [newVocabulary, setNewVocabulary] = useState(progress.newVocabulary ?? '')

  useEffect(() => {
    setFluencyScore(progress.fluencyScore ?? 0)
    setConfidenceLevel(progress.confidenceLevel ?? 0)
    setMainGrammarMistake(progress.mainGrammarMistake ?? '')
    setNewVocabulary(progress.newVocabulary ?? '')
  }, [state.currentWeekKey, progress.fluencyScore, progress.confidenceLevel, progress.mainGrammarMistake, progress.newVocabulary])

  const totalPoints = progress.totalPoints ?? 0
  const level = getPerformanceLevel(totalPoints)

  const handleSave = () => {
    saveWeeklyProgress({
      fluencyScore: Number(fluencyScore) || 0,
      confidenceLevel: Number(confidenceLevel) || 0,
      mainGrammarMistake: String(mainGrammarMistake).trim(),
      newVocabulary: String(newVocabulary).trim()
    })
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
        Resumo Semanal
      </h2>

      <div
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium mb-4"
        style={{ backgroundColor: level.color }}
      >
        <span aria-hidden>{level.emoji}</span>
        <span>{level.label}</span>
        <span>·</span>
        <span>{totalPoints} pts</span>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="fluencyScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fluency Score (1–5)
          </label>
          <input
            id="fluencyScore"
            type="number"
            min={1}
            max={5}
            value={fluencyScore || ''}
            onChange={(e) => setFluencyScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
          />
        </div>
        <div>
          <label htmlFor="confidenceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confidence Level (1–5)
          </label>
          <input
            id="confidenceLevel"
            type="number"
            min={1}
            max={5}
            value={confidenceLevel || ''}
            onChange={(e) => setConfidenceLevel(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
          />
        </div>
        <div>
          <label htmlFor="mainGrammarMistake" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Principal erro gramatical
          </label>
          <input
            id="mainGrammarMistake"
            type="text"
            value={mainGrammarMistake}
            onChange={(e) => setMainGrammarMistake(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            placeholder="Ex.: concordância verbal"
          />
        </div>
        <div>
          <label htmlFor="newVocabulary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Novo vocabulário
          </label>
          <textarea
            id="newVocabulary"
            rows={2}
            value={newVocabulary}
            onChange={(e) => setNewVocabulary(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 dark:bg-gray-700 resize-y"
            placeholder="Palavras ou expressões novas"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="mt-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Salvar Avaliação
        </button>
      </div>
    </section>
  )
}
