import { useState, useRef, useEffect } from 'react'
import anime from 'animejs'
import './App.css'

const COUNTRIES = [
  { id: 'usa',          name: 'USA',          speed: 289, rank: 11,  penetration: '94%', users: '312M' },
  { id: 'brazil',       name: 'Brazil',        speed: 222, rank: 32,  penetration: '84%', users: '181M'},
  { id: 'egypt',        name: 'Egypt',          speed: 28,  rank: 90,  penetration: '72%', users: '82M' },
  { id: 'southafrica',  name: 'South Africa',   speed: 52,  rank: 68,  penetration: '72%', users: '42M' },
  { id: 'tanzania',     name: 'Tanzania',       speed: 15,  rank: 126, penetration: '49%', users: '32M'},
  { id: 'kenya',        name: 'Kenya',          speed: 22,  rank: 108, penetration: '85%', users: '48M' },
]

const FILE_MB = 100

function downloadTime(speed) {
  return ((FILE_MB * 8) / speed).toFixed(1)
}

export default function App() {
  const [countryA, setCountryA] = useState(COUNTRIES[0])
  const [countryB, setCountryB] = useState(COUNTRIES[1])
  const [started, setStarted] = useState(false)
  const barARef = useRef(null)
  const barBRef = useRef(null)

  function startRace() {
    setStarted(true)
  }

  function reset() {
    setStarted(false)
  }

  useEffect(() => {
    if (!started) return
    const timeA = parseFloat(downloadTime(countryA.speed))
    const timeB = parseFloat(downloadTime(countryB.speed))
    anime({ targets: barARef.current, width: '100%', duration: timeA * 1000, easing: 'linear' })
    anime({ targets: barBRef.current, width: '100%', duration: timeB * 1000, easing: 'linear' })
  }, [started])

  function handleSelectA(e) {
    setCountryA(COUNTRIES.find(c => c.id === e.target.value))
    reset()
  }

  function handleSelectB(e) {
    setCountryB(COUNTRIES.find(c => c.id === e.target.value))
    reset()
  }

  const timeA = downloadTime(countryA.speed)
  const timeB = downloadTime(countryB.speed)

  return (
    <div>
      <h1>Internet Speed Race</h1>
      <p>Average fixed broadband speeds (Ookla, 2025)</p>

      <div className="selectors">
        <div className="selector">
          <label>Country A</label>
          <select value={countryA.id} onChange={handleSelectA}>
            {COUNTRIES.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === countryB.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <span className="vs">vs</span>
        <div className="selector">
          <label>Country B</label>
          <select value={countryB.id} onChange={handleSelectB}>
            {COUNTRIES.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === countryA.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="countries">
        <div className="country">
          <h2>{countryA.name}</h2>
          <p><strong>{countryA.speed} Mbps</strong></p>
          <p>Global rank: #{countryA.rank}</p>
          <p>Internet penetration: {countryA.penetration}</p>
          <p>Internet users: {countryA.users}</p>
          <p>{FILE_MB} MB download: ~{timeA}s</p>
        </div>
        <div className="country">
          <h2>{countryB.name}</h2>
          <p><strong>{countryB.speed} Mbps</strong></p>
          <p>Global rank: #{countryB.rank}</p>
          <p>Internet penetration: {countryB.penetration}</p>
          <p>Internet users: {countryB.users}</p>
          <p>{FILE_MB} MB download: ~{timeB}s</p>
        </div>
      </div>

      {!started && (
        <button onClick={startRace}>Simulate {FILE_MB} MB download</button>
      )}

      {started && (
        <div>
          <div className="lane">
            <label>{countryA.name} — {timeA}s</label>
            <div className="track">
              <div ref={barARef} className="bar" style={{ background: "green" }} />
            </div>
          </div>
          <div className="lane">
            <label>{countryB.name} — {timeB}s</label>
            <div className="track">
              <div ref={barBRef} className="bar" style={{ background: "blue" }} />
            </div>
          </div>
          <button onClick={reset} style={{ marginTop: '16px' }}>Reset</button>
        </div>
      )}
    </div>
  )
}
