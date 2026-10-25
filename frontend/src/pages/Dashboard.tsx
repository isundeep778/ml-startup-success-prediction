import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'

type Metrics = {
  dataset: { num_samples: number, success_rate_pct: number, avg_funding_musd?: number|null, avg_team_size?: number|null },
  models: Record<string, { accuracy:number, precision:number, recall:number, f1:number, roc_auc:number, confusion_matrix:number[][] }>,
  feature_importance: { feature: string, importance: number }[]
}

export default function Dashboard(){
  const [data, setData] = useState<Metrics | null>(null)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    axios.get(`${API_BASE}/api/dashboard`).then(r => {
      const d = r.data as Metrics
      setData(d)
      const first = Object.keys(d.models)[0]
      setActive(first)
    }).catch(() => alert('Load metrics failed. Export metrics.json from notebook.'))
  }, [])

  const cmChart = useMemo(() => {
    if (!data || !active) return null
    const cm = data.models[active].confusion_matrix
    return {
      labels: ['Failed','Success'],
      datasets: [
        { label: 'Failed', data: [cm[0][0], cm[1][0]], backgroundColor: '#4c78a8' },
        { label: 'Success', data: [cm[0][1], cm[1][1]], backgroundColor: '#1b9e77' }
      ]
    }
  }, [data, active])

  if (!data) return <div>Loading...</div>

  const m = active ? data.models[active] : null

  return (
    <div>
      <div className="hero">
        <div className="container hero-inner">
          <div>
            <div className="badge">Dashboard</div>
            <h1>ML Dashboard</h1>
            <p className="sub">Comprehensive analysis of startup success prediction models</p>
          </div>
          <div>
            <a className="btn" href="/">Make a Prediction</a>
          </div>
        </div>
      </div>
      <div className="cards">
        <div className="card"><div className="muted">Total Samples</div><h3>{data.dataset.num_samples}</h3></div>
        <div className="card"><div className="muted">Success Rate</div><h3>{data.dataset.success_rate_pct.toFixed(1)}%</h3></div>
        <div className="card"><div className="muted">Avg Funding</div><h3>{data.dataset.avg_funding_musd ? `$${data.dataset.avg_funding_musd.toFixed(1)}M` : '—'}</h3></div>
        <div className="card"><div className="muted">Avg Team Size</div><h3>{data.dataset.avg_team_size ?? '—'}</h3></div>
      </div>

      <div className="tabs">
        {Object.keys(data.models).map(k => (
          <button key={k} onClick={() => setActive(k)} className={active===k?'active':''}>{k.toUpperCase()}</button>
        ))}
      </div>

      {m && (
        <div className="grid">
          <div className="panel">
            <h4>Metrics</h4>
            {['accuracy','precision','recall','f1','roc_auc'].map(key => {
              const v = (m as any)[key] as number
              const pct = Math.round(v*100)
              return (
                <div className="metric" key={key}>
                  <div className="label">{key.toUpperCase()}</div>
                  <div className="bar"><div style={{width: pct+'%'}}></div></div>
                  <small>{pct}%</small>
                </div>
              )
            })}
          </div>
          <div className="panel">
            <h4>Confusion Matrix</h4>
            {cmChart && <Bar data={cmChart} options={{responsive:true, plugins:{legend:{position:'bottom'}}, scales:{x:{stacked:true}, y:{stacked:true}}}} />}
          </div>
        </div>
      )}

      <div className="panel">
        <h4>Feature Importance</h4>
        <Bar data={{
          labels: data.feature_importance.map(r=>r.feature),
          datasets: [{ label: 'Importance', data: data.feature_importance.map(r=>r.importance), backgroundColor:'#c051e3' }]
        }} options={{ indexAxis:'y', plugins:{ legend:{display:false} } }} />
      </div>
    </div>
  )
}


