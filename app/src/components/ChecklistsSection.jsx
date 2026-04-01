import { DailyChecklist } from './DailyChecklist.jsx'
import { WeeklySummary } from './WeeklySummary.jsx'

export function ChecklistsSection() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
      <DailyChecklist />
      <WeeklySummary />
    </div>
  )
}
