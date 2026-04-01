/**
 * Funções de data para semanas (segunda a domingo).
 */

/**
 * @param {Date} [date]
 * @returns {{ start: Date, end: Date, rangeString: string, key: string }}
 */
export function getWeekRange(date = new Date()) {
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(current)
  monday.setDate(current.getDate() - diff)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const format = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return {
    start: monday,
    end: sunday,
    rangeString: `${format(monday)} a ${format(sunday)}`,
    key: monday.toISOString().split('T')[0]
  }
}

/**
 * @param {Date} [date]
 * @returns {string}
 */
export function getWeekKey(date) {
  return getWeekRange(date).key
}
