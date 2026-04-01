/**
 * Persistência do estado no localStorage.
 */
import { createDefaultState, ensureCurrentWeek } from './state.js'
import { defaultActivityTypes } from '../data/defaults.js'

export const STORAGE_KEY = 'b2-study-tracker-v5'

/**
 * Carrega o estado salvo ou retorna o estado padrão.
 * @returns {object}
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state = JSON.parse(saved)
      if (!Array.isArray(state.interviews)) state.interviews = []
      if (!Array.isArray(state.activityTypes) || state.activityTypes.length === 0) {
        state.activityTypes = JSON.parse(JSON.stringify(defaultActivityTypes))
      }
      return ensureCurrentWeek(state)
    }
  } catch (error) {
    console.error('Erro ao carregar estado:', error)
  }
  const state = createDefaultState()
  return ensureCurrentWeek(state)
}

/**
 * Salva o estado no localStorage.
 * @param {object} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Erro ao salvar estado:', error)
  }
}

/**
 * Retorna o estado padrão (reset).
 * @returns {object}
 */
export function resetToDefault() {
  const state = createDefaultState()
  return ensureCurrentWeek(state)
}
