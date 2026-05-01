import { flagUrl } from '../lib/raceUtils'

export default function Flag({ code, size = 24 }) {
  const url = flagUrl(code)
  if (!url) return <span style={{ width: size * 1.4, height: size, display: 'inline-block' }} />
  return (
    <img
      src={url}
      alt={code}
      className="flag-img"
      style={{ height: size, width: 'auto', objectFit: 'cover', flexShrink: 0 }}
      loading="lazy"
    />
  )
}
