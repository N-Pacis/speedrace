import { useState, useRef, useEffect } from 'react'
import anime from 'animejs'
import { loadCountries } from '../lib/countries'

const FILE_MB = 100
const COLORS = {
  brand: '#1D4ED8',
  brandDark: '#434655',
}

function downloadTime(mbps) {
  return ((FILE_MB * 8) / mbps).toFixed(1)
}

export default function Home() {
  const [countries, setCountries]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [countryA, setCountryA]     = useState(null)
  const [countryB, setCountryB]     = useState(null)
  const [started, setStarted]       = useState(false)

  const barARef = useRef(null)
  const barBRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const list = await loadCountries()
        if (list && list.length > 0) {
          setCountries(list)
          setCountryA(list[0])
          setCountryB(list[1])
        } else {
          setFetchError(true)
        }
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function startRace() {
    setStarted(true)
    const timeA = parseFloat(downloadTime(countryA.downloadMbps))
    const timeB = parseFloat(downloadTime(countryB.downloadMbps))
    anime({ targets: barARef.current, width: '100%', duration: timeA * 1000, easing: 'linear' })
    anime({ targets: barBRef.current, width: '100%', duration: timeB * 1000, easing: 'linear' })
  }

  function reset() {
    setStarted(false)
  }

  function handleSelectA(e) {
    setCountryA(countries.find(c => c.abbreviation === e.target.value))
    reset()
  }

  function handleSelectB(e) {
    setCountryB(countries.find(c => c.abbreviation === e.target.value))
    reset()
  }

  if (loading) {
    return (
      <div className="status-text muted" style={{ padding: '6rem 0', textAlign: 'center' }}>
        Loading countries from server…
      </div>
    )
  }

  if (fetchError || !countryA || !countryB) {
    return (
      <div className="status-text error" style={{ padding: '6rem 0', textAlign: 'center' }}>
        Could not load country data — is the server running?
      </div>
    )
  }

  const timeA = downloadTime(countryA.downloadMbps)
  const timeB = downloadTime(countryB.downloadMbps)

  return (
    <div className="page-stack">
      <section className="page-hero" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
        <h1 className="page-title">Race Global Download Speeds</h1>
        <p className="page-copy" style={{ maxWidth: '48rem' }}>
          Compare average broadband performance between countries using the same typography,
          spacing, and cool-toned surfaces as the speed-test reference.
        </p>
      </section>

      <section className="surface-card content-card">
        <div className="controls-row">
          <div className="field-stack">
            <label className="field-label">Country A</label>
          <select
            value={countryA.abbreviation}
            onChange={handleSelectA}
            className="app-select"
          >
            {countries.map(c => (
              <option key={c.abbreviation} value={c.abbreviation} disabled={c.abbreviation === countryB.abbreviation}>
                {c.country}
              </option>
            ))}
          </select>
          </div>

          <div className="field-stack">
            <label className="field-label">Country B</label>
          <select
            value={countryB.abbreviation}
            onChange={handleSelectB}
            className="app-select"
          >
            {countries.map(c => (
              <option key={c.abbreviation} value={c.abbreviation} disabled={c.abbreviation === countryA.abbreviation}>
                {c.country}
              </option>
            ))}
          </select>
          </div>
        </div>
      </section>

      <section className="two-column">
        {[countryA, countryB].map((c, i) => (
          <div key={c.abbreviation} className="surface-card content-card">
            <div className="eyebrow">{i === 0 ? 'Lane A' : 'Lane B'}</div>
            <h2 className="card-title" style={{ marginTop: '0.9rem' }}>{c.country}</h2>
            <dl className="spec-list">
              <div className="spec-row">
                <dt>Global rank</dt>
                <dd><strong>#{c.rank}</strong></dd>
              </div>
              <div className="spec-row">
                <dt>Download</dt>
                <dd><strong style={{ color: COLORS.brand }}>{c.downloadMbps} Mbps</strong></dd>
              </div>
              <div className="spec-row">
                <dt>{FILE_MB} MB transfer</dt>
                <dd><strong>~{i === 0 ? timeA : timeB}s</strong></dd>
              </div>
            </dl>
          </div>
        ))}
      </section>

      <section className="surface-card content-card">
        <div className="eyebrow">Race Simulation</div>
        <h2 className="card-title" style={{ marginTop: '0.9rem' }}>Transfer progress</h2>
        {!started ? (
          <button onClick={startRace} className="app-button">
            Simulate {FILE_MB} MB Download
          </button>
        ) : (
          <div style={{ display: 'grid', gap: '1.2rem' }}>
          {[
            { ref: barARef, country: countryA, time: timeA, color: COLORS.brand },
            { ref: barBRef, country: countryB, time: timeB, color: COLORS.brandDark },
          ].map(({ ref, country, time, color }) => (
            <div key={country.abbreviation}>
              <div className="spec-row" style={{ marginBottom: '0.55rem' }}>
                <span><strong>{country.country}</strong></span>
                <span>{time}s</span>
              </div>
              <div className="track">
                <div ref={ref} className="bar" style={{ width: 0, background: color }} />
              </div>
            </div>
          ))}
          <button
            onClick={reset}
            className="subtle-button"
          >
            Reset
          </button>
          </div>
        )}
      </section>
    </div>
  )
}
