import { useCallback, useState } from 'react'
import { BatteryLow, RefreshCw } from 'lucide-react'
import {
  LOW_ENERGY_SESSION_MINUTES,
  sampleLowEnergyPlan,
} from '../../constants/lowEnergy'

export function LowEnergyMode() {
  const [open, setOpen] = useState(false)
  const [plan, setPlan] = useState(() => sampleLowEnergyPlan())

  const refresh = useCallback(() => {
    setPlan(sampleLowEnergyPlan())
  }, [])

  return (
    <section className="est-card est-low-energy">
      <button
        type="button"
        className="est-low-energy__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <BatteryLow size={20} aria-hidden />
        <span>Low energy mode</span>
        <span className="est-low-energy__chevron">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="est-low-energy__body">
          <p className="est-muted est-low-energy__lead">
            Quick session: <strong>{LOW_ENERGY_SESSION_MINUTES} min</strong> —
            small steps still count.
          </p>
          <ul className="est-low-energy__list">
            <li>
              <span className="est-tag">Speaking</span>
              {plan.speaking}
            </li>
            <li>
              <span className="est-tag">Vocab</span>
              <span className="est-vocab-pair">
                {plan.vocab.map((v, i) => (
                  <span key={`${v.word}-${i}`} className="est-vocab-chip">
                    <strong>{v.word}</strong>
                    <span className="est-muted"> — {v.hint}</span>
                  </span>
                ))}
              </span>
            </li>
            <li>
              <span className="est-tag">Review</span>
              {plan.review}
            </li>
          </ul>
          <button type="button" className="est-btn est-btn--ghost" onClick={refresh}>
            <RefreshCw size={16} aria-hidden />
            New suggestions
          </button>
        </div>
      )}
    </section>
  )
}
