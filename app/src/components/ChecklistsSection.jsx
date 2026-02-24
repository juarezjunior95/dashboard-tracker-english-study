import { DailyChecklist } from './DailyChecklist.jsx'
import { WeeklySummary } from './WeeklySummary.jsx'

export function ChecklistsSection() {
  return (
    <div className="flex flex-col gap-4">
      <DailyChecklist />
      <WeeklySummary />
    </div>
  )
}
