import { Header } from './components/Header.jsx'
import { WeekNavigation } from './components/WeekNavigation.jsx'
import { Calendar } from './components/Calendar.jsx'
import { ChecklistsSection } from './components/ChecklistsSection.jsx'
import { ChartsSection } from './components/ChartsSection.jsx'
import { TimerModal } from './components/TimerModal.jsx'
import { EditScheduleModal } from './components/EditScheduleModal.jsx'
import { EditPointsModal } from './components/EditPointsModal.jsx'
import { EditGoalModal } from './components/EditGoalModal.jsx'
import { InterviewTrackerSection } from './components/InterviewTrackerSection.jsx'
import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <WeekNavigation />
      <main id="main" className="max-w-[1400px] mx-auto w-full px-4 py-4 flex-1" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Calendar />
          <ChecklistsSection />
          <div className="flex flex-col gap-4">
            <ChartsSection />
            <InterviewTrackerSection />
          </div>
        </div>
      </main>
      <TimerModal />
      <EditScheduleModal />
      <EditPointsModal />
      <EditGoalModal />
    </div>
  )
}

export default App
