import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App(){
  const location = useLocation()
  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="brand">Startup Success Predictor</div>
          <div className="links">
            <Link className={location.pathname === '/' ? 'active' : ''} to="/">Predict</Link>
            <Link className={location.pathname.startsWith('/dashboard') ? 'active' : ''} to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>
      <div className="container content">
        <Outlet />
      </div>
    </div>
  )
}


