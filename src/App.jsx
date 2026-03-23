import { useState, useRef, useEffect } from 'react'
import anime from 'animejs'
import './App.css'

const USA = { name: 'USA 🇺🇸', speed: 289, rank: 11, penetration: '94%', users: '312M' }
const BRAZIL = { name: 'Brazil 🇧🇷', speed: 222, rank: 32, penetration: '84%', users: '181M' }

const FILE_MB = 500
const usaTime = ((FILE_MB * 8) / USA.speed).toFixed(1)
const brazilTime = ((FILE_MB * 8) / BRAZIL.speed).toFixed(1)

export default function App() {
  const [started, setStarted] = useState(false)
  const usaBarRef = useRef(null)
  const brazilBarRef = useRef(null)

  function startRace() {
    setStarted(true)
  }

  useEffect(() => {
    if (!started) return
    const base = 4000
    const brazilDuration = base * (brazilTime / usaTime)
    anime({ targets: usaBarRef.current, width: '100%', duration: base, easing: 'linear' })
    anime({ targets: brazilBarRef.current, width: '100%', duration: brazilDuration, easing: 'linear' })
  }, [started])

  return (
    <div>
      <h1>Internet Speed: USA vs Brazil</h1>
      <p>Average fixed broadband speeds (Ookla, 2025)</p>

      <div className="countries">
        <div className="country">
          <h2>{USA.name}</h2>
          <p><strong>{USA.speed} Mbps</strong></p>
          <p>Global rank: #{USA.rank}</p>
          <p>Internet penetration: {USA.penetration}</p>
          <p>Internet users: {USA.users}</p>
          <p>500 MB download: ~{usaTime}s</p>
        </div>
        <div className="country">
          <h2>{BRAZIL.name}</h2>
          <p><strong>{BRAZIL.speed} Mbps</strong></p>
          <p>Global rank: #{BRAZIL.rank}</p>
          <p>Internet penetration: {BRAZIL.penetration}</p>
          <p>Internet users: {BRAZIL.users}</p>
          <p>500 MB download: ~{brazilTime}s</p>
        </div>
      </div>

      {!started && (
        <button onClick={startRace}>Simulate 500 MB download</button>
      )}

      {started && (
        <div>
          <div className="lane">
            <label>{USA.name} — {usaTime}s</label>
            <div className="track">
              <div ref={usaBarRef} className="bar" style={{ background: 'steelblue' }} />
            </div>
          </div>
          <div className="lane">
            <label>{BRAZIL.name} — {brazilTime}s</label>
            <div className="track">
              <div ref={brazilBarRef} className="bar" style={{ background: 'green' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
