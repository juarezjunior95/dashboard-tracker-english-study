import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

const TYPES = [
  { value: 'hr', label: 'HR' },
  { value: 'technical', label: 'Técnica' },
  { value: 'manager', label: 'Gerente' }
]

const STATUSES = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'done', label: 'Realizada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'rejected', label: 'Recusada' }
]

function toInputDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function InterviewModal() {
  const { saveInterviews, interviewModal, closeInterviewModal } = useApp()
  const { open, interview } = interviewModal
  const isEditing = !!interview?.id

  const [date, setDate] = useState('')
  const [company, setCompany] = useState('')
  const [type, setType] = useState('hr')
  const [rating, setRating] = useState('')
  const [salaryOffer, setSalaryOffer] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      if (interview) {
        setDate(toInputDate(interview.date))
        setCompany(interview.company ?? '')
        setType(interview.type ?? 'hr')
        setRating(interview.rating != null ? String(interview.rating) : '')
        setSalaryOffer(interview.salaryOffer ?? '')
        setStatus(interview.status ?? 'done')
        setNotes(interview.notes ?? '')
      } else {
        setDate(toInputDate(new Date().toISOString()))
        setCompany('')
        setType('hr')
        setRating('')
        setSalaryOffer('')
        setStatus('scheduled')
        setNotes('')
      }
    }
  }, [open, interview])

  if (!open) return null

  const handleSave = () => {
    const companyTrim = company.trim()
    if (!companyTrim) {
      window.alert('Informe a empresa.')
      return
    }
    const ratingNum = rating === '' ? null : Math.min(10, Math.max(1, Number(rating)))
    const payload = {
      date: date || new Date().toISOString().slice(0, 10),
      company: companyTrim,
      type,
      rating: ratingNum,
      salaryOffer: salaryOffer.trim() || null,
      status,
      notes: notes.trim() || null
    }
    saveInterviews((list) => {
      const arr = list || []
      if (isEditing) {
        return arr.map((i) => (i.id === interview.id ? { ...i, ...payload } : i))
      }
      return [...arr, { id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, ...payload }]
    })
    closeInterviewModal()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full my-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 id="interview-modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {isEditing ? 'Editar entrevista' : 'Nova entrevista'}
          </h3>
          <button
            type="button"
            onClick={closeInterviewModal}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nome da empresa"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sua avaliação (1–10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proposta salarial</label>
            <input
              type="text"
              value={salaryOffer}
              onChange={(e) => setSalaryOffer(e.target.value)}
              placeholder="Ex.: R$ 12.000 ou A combinar"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas livres"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 resize-y"
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeInterviewModal}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            {isEditing ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
