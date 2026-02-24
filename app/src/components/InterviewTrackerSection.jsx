import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { InterviewModal } from './InterviewModal.jsx'

const TYPE_LABELS = { hr: 'HR', technical: 'Técnica', manager: 'Gerente' }
const STATUS_LABELS = { scheduled: 'Agendada', done: 'Realizada', cancelled: 'Cancelada', rejected: 'Recusada' }

function formatDate(dateStr) {
  if (!dateStr) return '–'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function InterviewTrackerSection() {
  const { state, saveInterviews, openInterviewModal } = useApp()
  const interviews = state.interviews ?? []

  const thisYear = new Date().getFullYear()
  const thisYearInterviews = interviews.filter((i) => {
    const y = i.date ? new Date(i.date).getFullYear() : 0
    return y === thisYear
  })
  const upcoming = interviews
    .filter((i) => i.status === 'scheduled' && i.date)
    .map((i) => ({ ...i, dateObj: new Date(i.date) }))
    .filter((i) => !isNaN(i.dateObj.getTime()) && i.dateObj >= new Date())
    .sort((a, b) => a.dateObj - b.dateObj)
    .slice(0, 5)

  const sortedList = [...interviews].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  const handleDelete = (id) => {
    if (window.confirm('Excluir esta entrevista?')) {
      saveInterviews((list) => list.filter((i) => i.id !== id))
    }
  }

  return (
    <>
      <section className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
          Interview Tracker
        </h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              {thisYearInterviews.length} entrevistas em {thisYear}
            </span>
          </div>
          {upcoming.length > 0 && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {upcoming.length} próxima(s) agendada(s)
              </span>
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Próximas</h3>
            <ul className="space-y-1">
              {upcoming.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-gray-50 dark:bg-gray-700 text-sm"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">{i.company}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatDate(i.date)}</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">{TYPE_LABELS[i.type] || i.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Lista</h3>
          <button
            type="button"
            onClick={() => openInterviewModal(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4" /> Nova entrevista
          </button>
        </div>

        <ul className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
          {sortedList.length === 0 ? (
            <li className="text-gray-500 dark:text-gray-400 text-sm py-2 px-2">Nenhuma entrevista registrada.</li>
          ) : (
            sortedList.map((i) => (
              <li
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200 block truncate">{i.company}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(i.date)} · {TYPE_LABELS[i.type] || i.type} · {STATUS_LABELS[i.status] || i.status}
                    {i.rating != null ? ` · ${i.rating}/10` : ''}
                    {i.salaryOffer ? ` · ${i.salaryOffer}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openInterviewModal(i)}
                    className="p-1.5 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    aria-label={`Editar ${i.company}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(i.id)}
                    className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    aria-label={`Excluir ${i.company}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
      <InterviewModal />
    </>
  )
}