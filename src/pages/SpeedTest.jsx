import { useState, useEffect } from 'react'

export default function SpeedTest() {
  const [ip, setIp] = useState(null)
  const [country, setCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setCountry(data.country_name)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not detect location')
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1>Speed Test</h1>

      {loading && <p>Detecting your location...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div>
          <p>Your IP: {ip}</p>
          <p>Your Country: {country}</p>
        </div>
      )}

      <button disabled={loading}>Run Speed Test</button>
    </div>
  )
}
