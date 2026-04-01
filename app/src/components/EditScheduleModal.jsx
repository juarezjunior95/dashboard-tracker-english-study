import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { daysOfWeek, dayNames } from '../data/defaults.js'

function getTypeLabel(typeValue, activityTypes) {
  const t = activityTypes.find((x) => x.value === typeValue)
  return t ? t.label : typeValue
}

function parseTime(timeStr) {
  if (!timeStr || !timeStr.includes('-')) return { start: '08:00', end: '08:30' }
  const [start, end] = timeStr.split('-').map((s) => s.trim())
  return { start: start || '08:00', end: end || '08:30' }
}

function durationMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

function isTypeUsedInSchedule(schedule, typeValue) {
  return daysOfWeek.some((day) => (schedule[day] || []).some((act) => act.type === typeValue))
}

export function EditScheduleModal() {
  const { state, saveSchedule, closeEditModal, editModalOpen, updateActivityTypes } = useApp()
  const [scheduleCopy, setScheduleCopy] = useState({})
  const [editing, setEditing] = useState(null)
  const [showManageTypes, setShowManageTypes] = useState(false)
  const [addingType, setAddingType] = useState(false)
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [newTypePoints, setNewTypePoints] = useState(0)
  const [editingTypeValue, setEditingTypeValue] = useState(null)
  const [editTypeLabel, setEditTypeLabel] = useState('')
  const [editTypePoints, setEditTypePoints] = useState(0)

  useEffect(() => {
    if (editModalOpen) {
      setScheduleCopy(JSON.parse(JSON.stringify(state.schedule || {})))
      setEditing(null)
      setShowManageTypes(false)
      setAddingType(false)
      setEditingTypeValue(null)
    }
  }, [editModalOpen, state.schedule])

  if (!editModalOpen) return null

  const activityTypes = state.activityTypes || []

  const handleDelete = (day, id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta atividade?')) return
    setScheduleCopy((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((a) => a.id !== id)
    }))
    setEditing(null)
  }

  const handleSaveForm = (day, activity, form) => {
    const name = (form.name || '').trim()
    const start = form.start || '08:00'
    const end = form.end || '08:30'
    const type = form.type || activityTypes[0]?.value

    if (!name) {
      window.alert('Preencha o nome da atividade.')
      return
    }
    const dur = durationMinutes(start, end)
    if (dur <= 0) {
      window.alert('Horário inválido (fim deve ser depois do início).')
      return
    }

    const time = `${start}-${end}`
    const typeInfo = activityTypes.find((t) => t.value === type)
    const defaultPoints = typeInfo ? typeInfo.defaultPoints : 0

    setScheduleCopy((prev) => {
      const dayList = [...(prev[day] || [])]
      if (activity) {
        const idx = dayList.findIndex((a) => a.id === activity.id)
        if (idx >= 0) {
          dayList[idx] = {
            ...activity,
            activity: name,
            time,
            type,
            duration: dur,
            defaultPoints
          }
        }
      } else {
        const newId = `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        dayList.push({
          id: newId,
          time,
          activity: name,
          type,
          duration: dur,
          defaultPoints
        })
        dayList.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      }
      return { ...prev, [day]: dayList }
    })
    setEditing(null)
  }

  const handleCancelForm = () => setEditing(null)

  const handleSaveAll = () => {
    saveSchedule(scheduleCopy)
    closeEditModal()
  }

  const handleAddType = () => {
    const label = newTypeLabel.trim()
    if (!label) {
      window.alert('Digite o nome do tipo.')
      return
    }
    const points = Math.max(0, Number(newTypePoints)) || 0
    const value = `custom-${Date.now().toString(36)}`
    updateActivityTypes((prev) => [...(prev || []), { value, label, defaultPoints: points }])
    setNewTypeLabel('')
    setNewTypePoints(0)
    setAddingType(false)
  }

  const handleStartEditType = (type) => {
    setEditingTypeValue(type.value)
    setEditTypeLabel(type.label)
    setEditTypePoints(type.defaultPoints ?? 0)
  }

  const handleSaveEditType = () => {
    if (!editingTypeValue) return
    const label = editTypeLabel.trim()
    if (!label) {
      window.alert('Digite o nome do tipo.')
      return
    }
    const points = Math.max(0, Number(editTypePoints)) || 0
    updateActivityTypes((prev) =>
      (prev || []).map((t) =>
        t.value === editingTypeValue ? { ...t, label, defaultPoints: points } : t
      )
    )
    setEditingTypeValue(null)
  }

  const handleDeleteType = (typeValue) => {
    if (isTypeUsedInSchedule(scheduleCopy, typeValue)) {
      window.alert('Não é possível excluir: há atividades no cronograma usando este tipo. Remova ou altere essas atividades primeiro.')
      return
    }
    if (!window.confirm('Excluir este tipo de atividade? Ele não será mais exibido na lista.')) return
    updateActivityTypes((prev) => (prev || []).filter((t) => t.value !== typeValue))
    setEditingTypeValue(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-schedule-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 id="edit-schedule-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            ✏️ Editar Cronograma
          </h3>
          <button
            type="button"
            onClick={closeEditModal}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowManageTypes((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
                Gerenciar tipos de atividade
              </span>
              {showManageTypes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showManageTypes && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Adicione, edite ou exclua tipos. Eles aparecem na lista ao criar/editar uma atividade. Excluir só é permitido se nenhuma atividade no cronograma usar o tipo.
                </p>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activityTypes.map((t) => (
                    <li key={t.value} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-700/50">
                      {editingTypeValue === t.value ? (
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editTypeLabel}
                            onChange={(e) => setEditTypeLabel(e.target.value)}
                            className="flex-1 min-w-[100px] px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
                            placeholder="Nome"
                          />
                          <input
                            type="number"
                            min={0}
                            value={editTypePoints}
                            onChange={(e) => setEditTypePoints(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
                            placeholder="pts"
                          />
                          <button type="button" onClick={handleSaveEditType} className="px-2 py-1 rounded bg-emerald-600 text-white text-sm">Salvar</button>
                          <button type="button" onClick={() => setEditingTypeValue(null)} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm">Cancelar</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-800 dark:text-gray-200">{t.label} ({t.defaultPoints ?? 0} pts)</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => handleStartEditType(t)} className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" aria-label="Editar tipo"> <Pencil className="w-3.5 h-3.5" /> </button>
                            <button type="button" onClick={() => handleDeleteType(t.value)} className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" aria-label="Excluir tipo"> <Trash2 className="w-3.5 h-3.5" /> </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {addingType ? (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <input type="text" value={newTypeLabel} onChange={(e) => setNewTypeLabel(e.target.value)} placeholder="Nome do tipo" className="flex-1 min-w-[120px] px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm" />
                    <input type="number" min={0} value={newTypePoints} onChange={(e) => setNewTypePoints(Number(e.target.value))} placeholder="pts" className="w-16 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm" />
                    <button type="button" onClick={handleAddType} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm font-medium">Adicionar</button>
                    <button type="button" onClick={() => { setAddingType(false); setNewTypeLabel(''); setNewTypePoints(0); }} className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm">Cancelar</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setAddingType(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Plus className="w-4 h-4" /> Adicionar tipo
                  </button>
                )}
              </div>
            )}
          </div>

          {daysOfWeek.map((day, idx) => (
            <div key={day} className="mb-4 last:mb-0">
              <div className="font-medium text-gray-700 mb-2">{dayNames[idx]}</div>
              <div className="space-y-1">
                {(scheduleCopy[day] || []).map((act) => (
                  <div key={act.id}>
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        <strong>{act.time}</strong> – {act.activity} ({getTypeLabel(act.type, activityTypes)})
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditing({ day, activity: act })}
                          className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500"
                          aria-label={`Editar ${act.activity}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(day, act.id)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
                          aria-label={`Excluir ${act.activity}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {editing?.day === day && editing?.activity?.id === act.id && (
                      <ActivityForm
                        day={day}
                        activity={editing.activity}
                        activityTypes={activityTypes}
                        onSave={handleSaveForm}
                        onCancel={handleCancelForm}
                      />
                    )}
                  </div>
                ))}
                {editing?.day === day && editing?.activity === null && (
                  <ActivityForm
                    day={day}
                    activity={null}
                    activityTypes={activityTypes}
                    onSave={handleSaveForm}
                    onCancel={handleCancelForm}
                  />
                )}
                {(!editing || editing.day !== day || editing.activity !== null) && (
                  <button
                    type="button"
                    onClick={() => setEditing({ day, activity: null })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <Plus className="w-4 h-4" /> Adicionar atividade
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={closeEditModal}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityForm({ day, activity, activityTypes, onSave, onCancel }) {
  const isEditing = !!activity
  const { start, end } = parseTime(activity?.time)
  const [name, setName] = useState(activity?.activity ?? '')
  const [startTime, setStartTime] = useState(start)
  const [endTime, setEndTime] = useState(end)
  const [type, setType] = useState(activity?.type ?? activityTypes[0]?.value ?? '')

  useEffect(() => {
    setName(activity?.activity ?? '')
    const p = parseTime(activity?.time)
    setStartTime(p.start)
    setEndTime(p.end)
    setType(activity?.type ?? activityTypes[0]?.value ?? '')
  }, [activity, activityTypes])

  return (
    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{isEditing ? 'Editar' : 'Nova'} Atividade</h4>
      <input
        type="text"
        placeholder="Nome da atividade"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
      />
      <div className="flex gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
        />
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 dark:bg-gray-700 text-sm"
      >
        {activityTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label} ({t.defaultPoints} pts)
          </option>
        ))}
      </select>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave(day, activity, { name, start: startTime, end: endTime, type })}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
