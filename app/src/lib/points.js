/**
 * Regras de pontuação e nível de performance.
 */

/**
 * Calcula pontos conforme o tipo de atividade e input do usuário.
 * @param {{ type: string, defaultPoints: number }} activity
 * @param {string} [userInput]
 * @returns {number}
 */
export function calculatePoints(activity, userInput) {
  const { type, defaultPoints } = activity
  switch (type) {
    case 'listening':
      return userInput && userInput.trim().length >= 50 ? defaultPoints : 0
    case 'anki':
    case 'grammar':
      return userInput && userInput.trim().length > 0 ? defaultPoints : 0
    case 'mock':
    case 'speaking':
    case 'structured':
      return defaultPoints
    default:
      return 0
  }
}

/**
 * @param {number} points
 * @returns {{ label: string, color: string, emoji: string }}
 */
export function getPerformanceLevel(points) {
  if (points >= 90) return { label: 'Excelente', color: '#10b981', emoji: '🟢' }
  if (points >= 70) return { label: 'Boa', color: '#f59e0b', emoji: '🟡' }
  if (points >= 50) return { label: 'Média', color: '#f97316', emoji: '🟠' }
  return { label: 'Fraca', color: '#ef4444', emoji: '🔴' }
}
