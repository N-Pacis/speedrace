import { useState, useEffect } from 'react'

const CF = 'https://speed.cloudflare.com'

async function measurePing() {
  const times = []
  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    await fetch(`${CF}/__down?bytes=0`, { cache: 'no-store' })
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  const trimmed = times.slice(0, 4)
  return Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length)
}

async function measureDownload(onProgress) {
  const sizes = [100_000, 1_000_000, 10_000_000, 25_000_000]
  let totalBytes = 0
  let totalTime = 0
  for (const size of sizes) {
    const start = performance.now()
    const res = await fetch(`${CF}/__down?bytes=${size}`, { cache: 'no-store' })
    await res.arrayBuffer()
    const elapsed = (performance.now() - start) / 1000
    totalBytes += size
    totalTime += elapsed
    onProgress((totalBytes * 8) / totalTime / 1e6)
  }
  return (totalBytes * 8) / totalTime / 1e6
}

async function measureUpload(onProgress) {
  const sizes = [100_000, 1_000_000, 10_000_000]
  let totalBytes = 0
  let totalTime = 0
  for (const size of sizes) {
    const body = new Blob([new Uint8Array(size)], { type: 'text/plain' })
    const start = performance.now()
    await fetch(`${CF}/__up`, { method: 'POST', body, mode: 'no-cors' })
    const elapsed = (performance.now() - start) / 1000
    totalBytes += size
    totalTime += elapsed
    onProgress((totalBytes * 8) / totalTime / 1e6)
  }
  return (totalBytes * 8) / totalTime / 1e6
}

export default function SpeedTest() {
  const [ip, setIp] = useState(null)
  const [country, setCountry] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)

  const [phase, setPhase] = useState('idle')
  const [run, setRun] = useState(0)
  const [ping, setPing] = useState(null)
  const [download, setDownload] = useState(null)
  const [upload, setUpload] = useState(null)
  const [liveSpeed, setLiveSpeed] = useState(null)

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setCountry(data.country_name)
        setLocationLoading(false)
      })
      .catch(() => {
        setLocationError('Could not detect location')
        setLocationLoading(false)
      })
  }, [])

  async function runTest() {
    setPing(null)
    setDownload(null)
    setUpload(null)
    setLiveSpeed(null)

    const RUNS = 3
    const pings = [], downloads = [], uploads = []

    for (let i = 1; i <= RUNS; i++) {
      setRun(i)

      setPhase('ping')
      pings.push(await measurePing())

      setPhase('download')
      setLiveSpeed(0)
      downloads.push(await measureDownload(setLiveSpeed))

      setPhase('upload')
      setLiveSpeed(0)
      uploads.push(await measureUpload(setLiveSpeed))
    }

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length
    setPing(Math.round(avg(pings)))
    setDownload(avg(downloads))
    setUpload(avg(uploads))
    setLiveSpeed(null)
    setRun(0)
    setPhase('done')
  }

  const running = phase !== 'idle' && phase !== 'done'

  const phaseLabel = {
    ping: `Run ${run}/3 — Measuring ping...`,
    download: `Run ${run}/3 — Measuring download...`,
    upload: `Run ${run}/3 — Measuring upload...`,
  }

  return (
    <div>
      <h1>Speed Test</h1>

      {locationLoading && <p>Detecting your location...</p>}
      {locationError && <p>{locationError}</p>}
      {!locationLoading && !locationError && (
        <div>
          <p>Your IP: {ip}</p>
          <p>Your Country: {country}</p>
        </div>
      )}

      <button onClick={runTest} disabled={running || locationLoading}>
        {running ? phaseLabel[phase] : 'Run Speed Test'}
      </button>

      {running && liveSpeed !== null && (
        <p>{liveSpeed.toFixed(1)} Mbps</p>
      )}

      {(ping !== null || download !== null || upload !== null) && (
        <div>
          {ping !== null && <p>Ping: {ping} ms</p>}
          {download !== null && <p>Download: {download.toFixed(1)} Mbps</p>}
          {upload !== null && <p>Upload: {upload.toFixed(1)} Mbps</p>}
        </div>
      )}
    </div>
  )
}
