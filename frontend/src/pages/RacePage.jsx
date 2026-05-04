import { useState, useEffect, useRef } from 'react'
import Flag from '../components/Flag'
import '../race.css'

const CAR_W     = 96
const CAR_H     = 48
const CAR_COLOR = '#1D4ED8'
const CAR_DARK  = '#0017a1'

function Car({ code }) {
  return (
    <svg width={CAR_W} height={CAR_H} viewBox={`0 0 ${CAR_W} ${CAR_H}`} aria-hidden
      style={{ filter:'drop-shadow(0 2px 6px rgba(29,78,216,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.25))', overflow:'visible' }}>
      <defs>
        <clipPath id={`fc-${code}`}>
          <path d="M30,12 L65,10 L73,15 L73,33 L65,38 L30,36 L24,31 L24,17 Z"/>
        </clipPath>
      </defs>
      <ellipse cx="46" cy="47" rx="36" ry="4" fill="rgba(0,0,0,0.38)"/>
      <rect x="60" y="1"  width="24" height="11" rx="5.5" fill={CAR_DARK}/>
      <rect x="60" y="36" width="24" height="11" rx="5.5" fill={CAR_DARK}/>
      <rect x="12" y="3"  width="20" height="10" rx="5"   fill={CAR_DARK}/>
      <rect x="12" y="35" width="20" height="10" rx="5"   fill={CAR_DARK}/>
      <path d="M10,16 L8,24 L10,32 L28,39 L68,41 L82,34 L91,27 L93,24 L91,21 L82,14 L68,7 L28,9 Z" fill={CAR_COLOR}/>
      <path d="M28,9 L68,7 L82,14 L68,11 L28,13 Z" fill="rgba(255,255,255,0.18)"/>
      <path d="M30,12 L65,10 L73,15 L73,33 L65,38 L30,36 L24,31 L24,17 Z" fill={CAR_DARK}/>
      <image href={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        x="24" y="10" width="49" height="28"
        clipPath={`url(#fc-${code})`}
        preserveAspectRatio="xMidYMid slice"
        opacity="0.9"/>
      <path d="M65,10 L73,15 L73,33 L65,38 Z" fill="rgba(130,220,255,0.82)"/>
      <path d="M65,10 L73,15 L70,17 L65,12 Z" fill="rgba(255,255,255,0.4)"/>
      <path d="M30,12 L24,17 L24,31 L30,36 Z" fill="rgba(130,220,255,0.32)"/>
      <ellipse cx="90" cy="19" rx="4"  ry="3.5" fill="#FFF176"/>
      <ellipse cx="90" cy="29" rx="4"  ry="3.5" fill="#FFF176"/>
      <ellipse cx="90" cy="19" rx="9"  ry="7"   fill="#FFF176" opacity="0.2"/>
      <ellipse cx="90" cy="29" rx="9"  ry="7"   fill="#FFF176" opacity="0.2"/>
      <rect x="7" y="18" width="5" height="5" rx="1.5" fill="#FF2222"/>
      <rect x="7" y="25" width="5" height="5" rx="1.5" fill="#FF2222"/>
      <rect x="5" y="16" width="7" height="9" rx="3"   fill="#FF2222" opacity="0.18"/>
      <ellipse cx="72" cy="6"  rx="10" ry="5.5" fill="#111827"/>
      <ellipse cx="72" cy="6"  rx="5"  ry="2.5" fill="#374151"/>
      <ellipse cx="72" cy="6"  rx="2"  ry="1"   fill="#4B5563"/>
      <ellipse cx="72" cy="42" rx="10" ry="5.5" fill="#111827"/>
      <ellipse cx="72" cy="42" rx="5"  ry="2.5" fill="#374151"/>
      <ellipse cx="72" cy="42" rx="2"  ry="1"   fill="#4B5563"/>
      <ellipse cx="22" cy="7"  rx="8"  ry="4.5" fill="#111827"/>
      <ellipse cx="22" cy="7"  rx="4"  ry="2"   fill="#374151"/>
      <ellipse cx="22" cy="41" rx="8"  ry="4.5" fill="#111827"/>
      <ellipse cx="22" cy="41" rx="4"  ry="2"   fill="#374151"/>
    </svg>
  )
}

function RankBadge({ pos }) {
  return (
    <span className={`rank-badge rank-${pos + 1}`}>
      {pos === 0 ? '1ST' : pos === 1 ? '2ND' : pos === 2 ? '3RD' : `#${pos + 1}`}
    </span>
  )
}

function fmtTime(s) {
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`
}

export default function RacePage({ countries = [], mb = 100, onEdit, onBack }) {
  const raceTimes = countries.map(c => (mb * 8) / Math.max(c.downloadMbps ?? 1, 0.01))

  const [phase,       setPhase]       = useState('countdown')
  const [cdNum,       setCdNum]       = useState(3)
  const [finishOrder, setFinishOrder] = useState([])
  const [raceKey,     setRaceKey]     = useState(0)

  const carRefs   = useRef([])
  const trailRefs = useRef([])
  const pctRefs   = useRef([])
  const timerRef  = useRef(null)
  const phaseRef  = useRef('countdown')
  const finRef    = useRef([])
  const startRef  = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (countries.length === 0) return
    phaseRef.current = 'countdown'
    finRef.current   = []
    cancelAnimationFrame(rafRef.current)
    setPhase('countdown'); setCdNum(3); setFinishOrder([])
    carRefs.current.forEach(el   => { if (el) el.style.left  = '0px' })
    trailRefs.current.forEach(el => { if (el) el.style.width = '0px' })
    pctRefs.current.forEach(el   => { if (el) el.textContent = '0%' })
    if (timerRef.current) timerRef.current.textContent = '0:00.00'

    let count = 3
    const cdId = setInterval(() => {
      count--
      if (count > 0) { setCdNum(count) }
      else { clearInterval(cdId); setCdNum('GO!'); setTimeout(startRace, 550) }
    }, 1000)

    function startRace() {
      phaseRef.current = 'racing'
      startRef.current = performance.now()
      setPhase('racing')
      rafRef.current = requestAnimationFrame(tick)
    }

    function tick() {
      if (phaseRef.current === 'done') return
      const elapsed = (performance.now() - startRef.current) / 1000
      if (timerRef.current) timerRef.current.textContent = fmtTime(elapsed)

      countries.forEach((_, i) => {
        const pos   = Math.min(1, elapsed / raceTimes[i])
        const carEl = carRefs.current[i]
        const trEl  = trailRefs.current[i]
        const pctEl = pctRefs.current[i]
        if (carEl) { const tw = carEl.parentElement?.offsetWidth ?? 700; carEl.style.left  = `${pos * Math.max(tw - CAR_W, 0)}px` }
        if (trEl)  { const tw = trEl.parentElement?.offsetWidth  ?? 700; trEl.style.width  = `${pos * Math.max(tw - CAR_W, 0)}px` }
        if (pos >= 1 && !finRef.current.includes(i)) {
          finRef.current = [...finRef.current, i]
          setFinishOrder([...finRef.current])
          if (pctEl) pctEl.textContent = raceTimes[i].toFixed(2) + 's'
        } else if (!finRef.current.includes(i) && pctEl) {
          pctEl.textContent = Math.round(pos * 100) + '%'
        }
      })

      if (finRef.current.length === countries.length) { phaseRef.current = 'done'; setPhase('done'); return }
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => { clearInterval(cdId); cancelAnimationFrame(rafRef.current) }
  }, [raceKey])

  const winner   = finishOrder.length > 0 ? countries[finishOrder[0]] : null
  const isRacing = phase === 'racing'
  const isDone   = phase === 'done'

  return (
    <div className="race-page">

      <div className="race-hdr">
        <div>
          <h1 className="race-title">Internet Race</h1>
        </div>
        <div className="race-badge">
          <span className="race-badge-n">{mb}</span>
          <span className="race-badge-u">MB</span>
        </div>
        {phase !== 'countdown' && (
          <div className="race-clock">
            <span className="clock-val" ref={timerRef}>0:00.00</span>
            <span className="clock-lbl">elapsed</span>
          </div>
        )}
        <div className="race-hdr-actions">
          <button className="app-button" style={{minHeight:"2.25rem",fontSize:"0.78rem",padding:"0.5rem 1rem"}} onClick={() => onEdit?.()}>Edit Racers</button>
          <button className="subtle-button" onClick={() => onBack?.()}>Back to map</button>
        </div>
      </div>

      {phase === 'countdown' && (
        <div className="countdown-wrap">
          <div className="cd-ring">
            <span className={`cd-num${cdNum === 'GO!' ? ' cd-go' : ''}`}>{cdNum}</span>
          </div>
          <p className="cd-label">{cdNum === 'GO!' ? 'GO GO GO!' : 'GET READY'}</p>
        </div>
      )}

      <div className="track-outer">
        <div className="finish-line"/>
        <span className="finish-label">FINISH</span>

        {countries.map((c, i) => {
          const finPos   = finishOrder.indexOf(i)
          const finished = finPos >= 0
          return (
            <div key={c.abbreviation} className={`lane${finished ? ' lane-done' : ''}`}>
              <div className="lane-lbl">
                <Flag code={c.abbreviation} size={26} />
                <div className="lane-info">
                  <span className="lane-name">{c.country}</span>
                  <span className="lane-spd">{c.downloadMbps?.toFixed(0)} Mbps</span>
                </div>
              </div>
              <div className="lane-road">
                <div className={`road-stripe${isRacing && !finished ? ' stripe-moving' : ''}`}/>
                <div className="speed-trail" ref={el => trailRefs.current[i] = el}/>
                <div className="car-pos" ref={el => carRefs.current[i] = el}
                  style={{ top:`calc(50% - ${CAR_H / 2}px)` }}>
                  {isRacing && !finished && (
                    <div className="sparks">
                      <span className="sk"/>
                      <span className="sk" style={{ animationDelay: '.13s' }}/>
                      <span className="sk" style={{ animationDelay: '.26s' }}/>
                    </div>
                  )}
                  <Car code={c.abbreviation}/>
                </div>
              </div>
              <div className="lane-stat">
                {finished && <RankBadge pos={finPos}/>}
                <span className="lane-pct" ref={el => pctRefs.current[i] = el}>0%</span>
              </div>
            </div>
          )
        })}
      </div>

      {isDone && winner && (
        <div className="surface-card results">
          <div className="winner-row">
            <div className="winner-icon">1</div>
            <div className="winner-body">
              <div className="eyebrow">Winner</div>
              <div className="winner-name">
                <Flag code={winner.abbreviation} size={28} />
                {winner.country}
              </div>
              <div className="winner-sub">
                {winner.downloadMbps?.toFixed(1)} Mbps &nbsp;&middot;&nbsp; {raceTimes[finishOrder[0]].toFixed(2)}s
              </div>
            </div>
          </div>

          <div className="podium">
            {finishOrder.map((ci, rank) => (
              <div key={ci} className="podium-row">
                <span className="p-rank">{rank + 1}</span>
                <Flag code={countries[ci].abbreviation} size={22} />
                <span className="p-name">{countries[ci].country}</span>
                <span className="p-spd">{countries[ci].downloadMbps?.toFixed(1)} Mbps</span>
                <span className="p-time">{raceTimes[ci].toFixed(2)}s</span>
              </div>
            ))}
          </div>

          <div className="result-btns">
            <button className="app-button" onClick={() => setRaceKey(k => k + 1)}>Race Again</button>
            <button className="subtle-button" onClick={() => onEdit?.()}>Change Countries</button>
            <button className="subtle-button" onClick={() => onBack?.()}>Back to Map</button>
          </div>
        </div>
      )}
    </div>
  )
}
