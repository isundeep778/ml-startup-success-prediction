export default function MetricBar({ label, value }:{ label:string, value:number }){
  const pct = Math.round((value||0)*100)
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="bar"><div style={{width: pct+'%'}}></div></div>
      <small>{pct}%</small>
    </div>
  )
}


