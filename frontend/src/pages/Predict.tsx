import { useState } from 'react'
import axios from 'axios'
import Hero from '../components/Hero'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'

export default function Predict(){
  const [form, setForm] = useState<Record<string, any>>({})
  const [result, setResult] = useState<{pred?: number, prob?: number}>({})
  const [loading, setLoading] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const v = value === '' ? null : (!isNaN(Number(value)) ? Number(value) : value)
    setForm(prev => ({ ...prev, [name]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/predict`, form)
      setResult({ pred: data.predictions[0], prob: data.probabilities[0] })
    } catch (err) {
      setResult({})
      alert('Prediction failed. Ensure backend is running.')
    } finally { setLoading(false) }
  }

  const pct = Math.round(((result.prob ?? 0) * 100))

  return (
    <div>
      <Hero title="Predict Startup Success" subtitle="Enter your startup details to get AI‑powered predictions" />
      <form onSubmit={submit} className="grid" style={{marginTop:16}}>
        {[
          { name: 'founding_year', label: 'Founding Year', type: 'number' },
          { name: 'funding_amount_musd', label: 'Funding (Millions $)', type: 'number' },
          { name: 'founders_experience_years', label: "Founders' Experience (years)", type: 'number' },
          { name: 'team_size', label: 'Team Size', type: 'number' },
          { name: 'market_sector', label: 'Market Sector', type: 'text' },
          { name: 'business_model', label: 'Business Model (B2B/B2C)', type: 'text' },
          { name: 'location', label: 'Location', type: 'text' },
          { name: 'tech_stack', label: 'Tech Stack', type: 'text' },
          { name: 'pitch_score', label: 'Pitch Score (1-10)', type: 'number' },
          { name: 'past_startup_experience', label: 'Past Startup Experience', type: 'number' },
          { name: 'profit_margin_pct', label: 'Profit Margin %', type: 'number' },
          { name: 'monthly_growth_rate_pct', label: 'Monthly Growth %', type: 'number' },
          { name: 'cac_usd', label: 'CAC (USD)', type: 'number' },
          { name: 'ltv_usd', label: 'LTV (USD)', type: 'number' },
        ].map(f => (
          <div key={f.name} className="field">
            <label>{f.label}</label>
            <input name={f.name} type={f.type as any} onChange={onChange} />
          </div>
        ))}
        <div className="actions">
          <button type="submit" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
        </div>
      </form>

      {result.pred !== undefined && (
        <div className="result card" style={{padding:16}}>
          <h3>{result.pred === 1 ? 'Likely to Succeed' : 'Likely to Fail'}</h3>
          <div className="progress"><div style={{width: pct + '%'}}>{pct}%</div></div>
        </div>
      )}
    </div>
  )
}


