export default function Hero({ title, subtitle, right }:{ title:string, subtitle?:string, right?:React.ReactNode }){
  return (
    <div className="hero">
      <div className="container hero-inner">
        <div>
          <div className="badge">Machine Learning Powered</div>
          <h1>{title}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}


