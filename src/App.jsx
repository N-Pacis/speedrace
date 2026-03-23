import { useState, useRef, useEffect } from 'react'
import anime from 'animejs'
import './App.css'

const USA = { name: 'USA 🇺🇸', speed: 289, rank: 11, penetration: '94%', users: '312M' }
const BRAZIL = { name: 'Brazil 🇧🇷', speed: 222, rank: 32, penetration: '84%', users: '181M' }
const EGYPT = { name: 'Egypt 🇪🇬', speed: 28, rank: 90, penetration: '72%', users: '82M' }
const SOUTH_AFRICA = { name: 'South Africa 🇿🇦', speed: 52, rank: 68, penetration: '72%', users: '42M' }
const TANZANIA = { name: 'Tanzania 🇹🇿', speed: 15, rank: 126, penetration: '49%', users: '32M' }
const KENYA = { name: 'Kenya 🇰🇪', speed: 22, rank: 108, penetration: '85%', users: '48M' }

const FILE_MB = 500
const usaTime = ((FILE_MB * 8) / USA.speed).toFixed(1)
const brazilTime = ((FILE_MB * 8) / BRAZIL.speed).toFixed(1)
const egyptTime = ((FILE_MB * 8) / EGYPT.speed).toFixed(1)
const southAfricaTime = ((FILE_MB * 8) / SOUTH_AFRICA.speed).toFixed(1)
const tanzaniaTime = ((FILE_MB * 8) / TANZANIA.speed).toFixed(1)
const kenyaTime = ((FILE_MB * 8) / KENYA.speed).toFixed(1)

export default function App() {
  const [started, setStarted] = useState(false)
  const usaBarRef = useRef(null)
  const brazilBarRef = useRef(null)
  const egyptBarRef = useRef(null)
  const southAfricaBarRef = useRef(null)
  const tanzaniaBarRef = useRef(null)
  const kenyaBarRef = useRef(null)

  function startRace() {
    setStarted(true)
  }

  useEffect(() => {
    if (!started) return
    const base = 4000
    anime({ targets: usaBarRef.current, width: '100%', duration: base * (usaTime / usaTime), easing: 'linear' })
    anime({ targets: brazilBarRef.current, width: '100%', duration: base * (brazilTime / usaTime), easing: 'linear' })
    anime({ targets: egyptBarRef.current, width: '100%', duration: base * (egyptTime / usaTime), easing: 'linear' })
    anime({ targets: southAfricaBarRef.current, width: '100%', duration: base * (southAfricaTime / usaTime), easing: 'linear' })
    anime({ targets: tanzaniaBarRef.current, width: '100%', duration: base * (tanzaniaTime / usaTime), easing: 'linear' })
    anime({ targets: kenyaBarRef.current, width: '100%', duration: base * (kenyaTime / usaTime), easing: 'linear' })
  }, [started])

  return (
    <div>
      <h1>Internet Speed: USA vs Brazil vs Africa</h1>
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
        <div className="country">
          <h2>{EGYPT.name}</h2>
          <p><strong>{EGYPT.speed} Mbps</strong></p>
          <p>Global rank: #{EGYPT.rank}</p>
          <p>Internet penetration: {EGYPT.penetration}</p>
          <p>Internet users: {EGYPT.users}</p>
          <p>500 MB download: ~{egyptTime}s</p>
        </div>
        <div className="country">
          <h2>{SOUTH_AFRICA.name}</h2>
          <p><strong>{SOUTH_AFRICA.speed} Mbps</strong></p>
          <p>Global rank: #{SOUTH_AFRICA.rank}</p>
          <p>Internet penetration: {SOUTH_AFRICA.penetration}</p>
          <p>Internet users: {SOUTH_AFRICA.users}</p>
          <p>500 MB download: ~{southAfricaTime}s</p>
        </div>
        <div className="country">
          <h2>{TANZANIA.name}</h2>
          <p><strong>{TANZANIA.speed} Mbps</strong></p>
          <p>Global rank: #{TANZANIA.rank}</p>
          <p>Internet penetration: {TANZANIA.penetration}</p>
          <p>Internet users: {TANZANIA.users}</p>
          <p>500 MB download: ~{tanzaniaTime}s</p>
        </div>
        <div className="country">
          <h2>{KENYA.name}</h2>
          <p><strong>{KENYA.speed} Mbps</strong></p>
          <p>Global rank: #{KENYA.rank}</p>
          <p>Internet penetration: {KENYA.penetration}</p>
          <p>Internet users: {KENYA.users}</p>
          <p>500 MB download: ~{kenyaTime}s</p>
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
          <div className="lane">
            <label>{EGYPT.name} — {egyptTime}s</label>
            <div className="track">
              <div ref={egyptBarRef} className="bar" style={{ background: '#c8102e' }} />
            </div>
          </div>
          <div className="lane">
            <label>{SOUTH_AFRICA.name} — {southAfricaTime}s</label>
            <div className="track">
              <div ref={southAfricaBarRef} className="bar" style={{ background: '#007A4D' }} />
            </div>
          </div>
          <div className="lane">
            <label>{TANZANIA.name} — {tanzaniaTime}s</label>
            <div className="track">
              <div ref={tanzaniaBarRef} className="bar" style={{ background: '#1EB53A' }} />
            </div>
          </div>
          <div className="lane">
            <label>{KENYA.name} — {kenyaTime}s</label>
            <div className="track">
              <div ref={kenyaBarRef} className="bar" style={{ background: '#006600' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
