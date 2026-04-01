import { Briefcase, Plus, Pencil, Trash2, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { InterviewModal } from './InterviewModal.jsx'

const TYPE_LABELS = { hr: 'HR', technical: 'Técnica', manager: 'Gerente' }
const STATUS_LABELS = { scheduled: 'Agendada', done: 'Realizada', cancelled: 'Cancelada', rejected: 'Recusada' }
const CURRENCY_LABELS = { brl: 'BRL', usd: 'USD', eur: 'EUR', other: 'Outro' }
const CONTRACT_LABELS = { clt: 'CLT', pj: 'PJ', other: 'Outro' }
const FEEDBACK_LABELS = { no_feedback: 'Sem feedback', rejected: 'Reprovado', next_phase: 'Próxima fase', hired: 'Contratado' }
const ROLE_LABELS = {
  junior: 'Junior', pleno: 'Pleno', mid: 'Mid Level', senior: 'Senior',
  especialista: 'Especialista', lead: 'Lead', manager: 'Manager', other: 'Outro',
  qa_jr: 'QA Jr', qa_analyst: 'QA Analyst', mid_qa: 'Mid Level QA', senior_qa: 'Senior QA',
  qa_lead: 'QA Lead', qa_engineer: 'QA Engineer', sdet: 'SDET', automation_qa: 'Automation QA', manual_qa: 'Manual QA'
}
const ENGLISH_LEVEL_LABELS = { a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2' }

function formatDate(dateStr) {
  if (!dateStr) return '–'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function InterviewTrackerSection() {
  const { state, saveInterviews, openInterviewModal, setInterviewTrackerEnabled } = useApp()
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
      <section className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
            Interview Tracker
          </h2>
          <button
            type="button"
            onClick={() => setInterviewTrackerEnabled(false)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Ocultar Interview Tracker"
          >
            <EyeOff className="w-4 h-4" aria-hidden />
            Ocultar
          </button>
        </div>

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
                  <div className="min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{i.company}</span>
                    {(i.role && i.role !== 'other') || i.englishLevel ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        {(i.role && i.role !== 'other') ? ROLE_LABELS[i.role] : ''}{(i.role && i.role !== 'other') && i.englishLevel ? ' · ' : ''}{i.englishLevel ? `Inglês ${ENGLISH_LEVEL_LABELS[i.englishLevel] || i.englishLevel.toUpperCase()}` : ''}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">{formatDate(i.date)}</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 shrink-0">{TYPE_LABELS[i.type] || i.type}</span>
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
                    {formatDate(i.date)} · {TYPE_LABELS[i.type] || i.type}
                    {(i.role && i.role !== 'other') ? ` · ${ROLE_LABELS[i.role] || i.role}` : ''}
                    {i.englishLevel ? ` · Inglês ${ENGLISH_LEVEL_LABELS[i.englishLevel] || i.englishLevel.toUpperCase()}` : ''}
                    {' · '}{STATUS_LABELS[i.status] || i.status}
                    {i.rating != null ? ` · ${i.rating}/10` : ''}
                    {i.salaryOffer
                      ? ` · ${i.salaryOffer}${(i.salaryCurrency && i.salaryCurrency !== 'other') ? ` ${CURRENCY_LABELS[i.salaryCurrency] || ''}` : ''}${(i.contractType && i.contractType !== 'other') ? ` (${CONTRACT_LABELS[i.contractType]})` : ''}`
                      : ''}
                    {' · '}
                    <span className={i.feedback === 'hired' ? 'text-emerald-600 dark:text-emerald-400' : i.feedback === 'next_phase' ? 'text-indigo-600 dark:text-indigo-400' : i.feedback === 'rejected' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                      {FEEDBACK_LABELS[i.feedback] || FEEDBACK_LABELS.no_feedback}
                    </span>
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