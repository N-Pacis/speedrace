import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadCountries } from '../lib/countries'
import { CAR_COLORS } from '../lib/raceUtils'
import Flag from '../components/Flag'
import '../race.css'

const MAX = 5
const DEFAULT_MB = 100

export default function RaceSetup() {
  const navigate = useNavigate()
  const { state: locState } = useLocation()

  const [countries, setCountries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [query,     setQuery]     = useState('')
  const [picked,    setPicked]    = useState(locState?.picked ?? [])
  const [mb,        setMb]        = useState(locState?.mb ?? DEFAULT_MB)

  useEffect(() => {
    loadCountries()
      .then(d => { setCountries(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return countries
      .filter(c => c.downloadMbps > 0)
      .filter(c => !q || c.country?.toLowerCase().includes(q) || c.abbreviation?.toLowerCase().includes(q))
      .sort((a, b) => b.downloadMbps - a.downloadMbps)
  }, [countries, query])

  function toggle(c) {
    setPicked(prev => {
      const i = prev.findIndex(x => x.abbreviation === c.abbreviation)
      if (i >= 0) return prev.filter((_, j) => j !== i)
      if (prev.length >= MAX) return prev
      return [...prev, c]
    })
  }

  function remove(i) {
    setPicked(prev => prev.filter((_, j) => j !== i))
  }

  const slowest = picked.length > 0
    ? Math.max(...picked.map(c => (mb * 8) / Math.max(c.downloadMbps, 0.01)))
    : 0

  function go() {
    if (picked.length >= 2) navigate('/race', { state: { picked, mb } })
  }

  return (
    <div className="setup-page">

      <div className="setup-hero">
        <p className="setup-eyebrow">Speed Race</p>
        <h1 className="setup-h1">Pick Your Racers</h1>
        <p className="setup-sub">Choose 2–5 countries · race them by real broadband download speed</p>
      </div>

      {/* Lineup slots */}
      <div className="lineup-section">
        <div className="lineup-label">LINEUP <span className="lineup-count">{picked.length}/{MAX}</span></div>
        <div className="lineup-slots">
          {Array.from({ length: MAX }).map((_, i) => {
            const c = picked[i]
            return c ? (
              <button
                key={c.abbreviation}
                className="lineup-slot filled"
                style={{ '--sc': CAR_COLORS[i] }}
                onClick={() => remove(i)}
                title={`Remove ${c.country}`}
              >
                <span className="slot-num">{i + 1}</span>
                <Flag code={c.abbreviation} size={22} />
                <span className="slot-name">{c.country}</span>
                <span className="slot-speed">{c.downloadMbps?.toFixed(0)} Mbps</span>
                <span className="slot-x">×</span>
              </button>
            ) : (
              <div key={i} className="lineup-slot empty">
                <span className="slot-num">{i + 1}</span>
                <span className="slot-plus">+</span>
                <span className="slot-hint">Pick below</span>
              </div>
            )
          })}
        </div>

        <div className="lineup-footer">
          <div className="mb-control">
            <div className="mb-row">
              <span className="mb-label">File size</span>
              <strong className="mb-val">{mb} MB</strong>
              {picked.length >= 2 && (
                <span className="mb-hint">approx {slowest.toFixed(1)}s race</span>
              )}
            </div>
            <input
              type="range" min="10" max="500" step="10" value={mb}
              onChange={e => setMb(Number(e.target.value))}
              className="mb-slider"
            />
          </div>

          <button className="go-btn" disabled={picked.length < 2} onClick={go}>
            {picked.length < 2 ? `Need ${2 - picked.length} more` : 'START RACE'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-row">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8.5" cy="8.5" r="5.5"/><path d="M15 15l3 3"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search countries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button className="search-clear" onClick={() => setQuery('')}>×</button>}
        </div>
        <span className="search-hint">{list.length} countries</span>
      </div>

      {loading && <p className="status-muted">Loading speed data…</p>}
      {error   && <p className="status-err">Failed to load: {error}</p>}

      {/* Country grid */}
      <div className="cg">
        {list.map(c => {
          const idx  = picked.findIndex(x => x.abbreviation === c.abbreviation)
          const sel  = idx >= 0
          const full = !sel && picked.length >= MAX

          return (
            <button
              key={c.abbreviation}
              className={`cc ${sel ? 'cc-sel' : ''} ${full ? 'cc-off' : ''}`}
              onClick={() => !full && toggle(c)}
              style={sel ? { '--cc': CAR_COLORS[idx] } : {}}
              title={full ? 'Remove a racer first' : undefined}
            >
              {sel && <span className="cc-badge" style={{ background: CAR_COLORS[idx] }}>{idx + 1}</span>}
              <Flag code={c.abbreviation} size={32} />
              <span className="cc-name">{c.country}</span>
              <span className="cc-speed" style={sel ? { color: CAR_COLORS[idx] } : {}}>
                {c.downloadMbps?.toFixed(0)}<small> Mbps</small>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
