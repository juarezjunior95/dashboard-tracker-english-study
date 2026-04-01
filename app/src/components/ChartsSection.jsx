import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { HistoryList } from './HistoryList.jsx'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, max: 120 }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, max: 5 }
  }
}

export function ChartsSection() {
  const { state } = useApp()
  const rawHistory = (state.history ?? []).slice(-4)
  const hasOnlyOnePoint = rawHistory.length <= 1
  const labels = hasOnlyOnePoint && rawHistory.length === 1
    ? ['Início', 'S1']
    : rawHistory.map((_, i) => `S${i + 1}`)
  const points = hasOnlyOnePoint && rawHistory.length === 1
    ? [0, rawHistory[0].totalPoints ?? 0]
    : rawHistory.map((h) => h.totalPoints ?? 0)
  const fluency = hasOnlyOnePoint && rawHistory.length === 1
    ? [0, rawHistory[0].fluency ?? 0]
    : rawHistory.map((h) => h.fluency ?? 0)
  const confidence = hasOnlyOnePoint && rawHistory.length === 1
    ? [0, rawHistory[0].confidence ?? 0]
    : rawHistory.map((h) => h.confidence ?? 0)
  const allScoresZero = fluency.every((v) => v === 0) && confidence.every((v) => v === 0)

  const pointsData = {
    labels,
    datasets: [
      {
        label: 'Pontos Semanais',
        data: points,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }

  const scoresData = {
    labels,
    datasets: [
      {
        label: 'Fluency',
        data: fluency,
        backgroundColor: '#10b981',
        borderRadius: 6,
        minBarLength: 6
      },
      {
        label: 'Confidence',
        data: confidence,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        minBarLength: 6
      }
    ]
  }

  return (
    <section className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 min-w-0">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden />
        Evolução
      </h2>
      <div className="flex flex-col gap-6">
        <div className="h-[180px] sm:h-[200px] min-h-[140px] w-full relative">
          <Line data={pointsData} options={lineOptions} />
        </div>
        <div className="h-[180px] sm:h-[200px] min-h-[140px] w-full relative">
          <Bar data={scoresData} options={barOptions} />
        </div>
        {allScoresZero && (
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            Preencha Fluency e Confidence no <strong>Resumo Semanal</strong> para ver a evolução no gráfico acima.
          </p>
        )}
        <HistoryList />
      </div>
    </section>
  )
}
