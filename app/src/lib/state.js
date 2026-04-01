/**
 * Helpers para estado inicial e garantia da semana atual.
 */
import { defaultSchedule, defaultActivityTypes } from '../data/defaults.js'
import { getWeekKey } from './dates.js'

/**
 * Cria uma cópia profunda do cronograma padrão.
 */
function deepCloneSchedule() {
  return JSON.parse(JSON.stringify(defaultSchedule))
}

/**
 * Cria uma cópia profunda dos tipos de atividade padrão.
 */
function deepCloneActivityTypes() {
  return JSON.parse(JSON.stringify(defaultActivityTypes))
}

/**
 * Retorna o estado inicial da aplicação.
 * @returns {{ schedule: object, activityTypes: object[], weeks: object, currentWeekKey: string, history: object[] }}
 */
export function createDefaultState() {
  return {
    schedule: deepCloneSchedule(),
    activityTypes: deepCloneActivityTypes(),
    weeks: {},
    currentWeekKey: getWeekKey(new Date()),
    history: [],
    interviews: []
  }
}

/**
 * Estrutura padrão de uma semana em state.weeks[key].
 */
const defaultWeekData = {
  activities: {},
  weeklyProgress: {
    fluencyScore: 0,
    confidenceLevel: 0,
    mainGrammarMistake: '',
    newVocabulary: '',
    totalPoints: 0,
    weeklyGoal: 100
  }
}

/**
 * Garante que a semana atual existe em state.weeks. Modifica state.
 * @param {object} state
 * @returns {object}
 */
export function ensureCurrentWeek(state) {
  if (!state.weeks[state.currentWeekKey]) {
    state.weeks[state.currentWeekKey] = JSON.parse(JSON.stringify(defaultWeekData))
  }
  return state
}

/**
 * Reconstrói o array history a partir de state.weeks (para gráficos e lista).
 * @param {object} weeks
 * @returns {{ weekKey: string, totalPoints: number, fluency: number, confidence: number }[]}
 */
export function buildHistoryFromWeeks(weeks) {
  const history = Object.entries(weeks).map(([weekKey, weekData]) => ({
    weekKey,
    totalPoints: weekData.weeklyProgress?.totalPoints ?? 0,
    fluency: weekData.weeklyProgress?.fluencyScore ?? 0,
    confidence: weekData.weeklyProgress?.confidenceLevel ?? 0
  }))
  history.sort((a, b) => a.weekKey.localeCompare(b.weekKey))
  return history
}
