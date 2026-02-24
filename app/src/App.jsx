import { Briefcase } from 'lucide-react'
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
import { useApp } from './context/AppContext.jsx'
import './App.css'

function App() {
  const { interviewTrackerEnabled, setInterviewTrackerEnabled } = useApp()

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
            {interviewTrackerEnabled ? (
              <InterviewTrackerSection />
            ) : (
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-center min-h-[80px]">
                <button
                  type="button"
                  onClick={() => setInterviewTrackerEnabled(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Briefcase className="w-4 h-4" aria-hidden />
                  Habilitar Interview Tracker
                </button>
              </div>
            )}
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
