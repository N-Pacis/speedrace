import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import SpeedTest from './pages/SpeedTest'
import MapPage from './pages/MapPage'
import './App.css'

const NAV_LINKS = [
  { to: '/',           label: 'World Map',  end: true  },
  { to: '/speed-test', label: 'Speed Test', end: false },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <span className="brand-mark">SpeedRace</span>
          <nav className="site-nav">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `site-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="page-shell">
          <Routes>
            <Route path="/"           element={<MapPage />} />
            <Route path="/speed-test" element={<SpeedTest />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
