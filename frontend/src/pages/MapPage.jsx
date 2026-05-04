import { useState } from 'react'
import WorldMap from '../components/WorldMap'
import RacePage from './RacePage'

export default function MapPage() {
  const [selected,   setSelected]   = useState([])
  const [fileSizeMB, setFileSizeMB] = useState(100)
  const [racing,     setRacing]     = useState(false)

  return (
    <div className="page-stack map-page-shell">
      <div className={`surface-card map-frame${racing ? '' : ' map-immersive'}`}>
        {racing ? (
          <RacePage
            countries={selected}
            mb={fileSizeMB}
            onEdit={() => setRacing(false)}
            onBack={() => { setSelected([]); setRacing(false) }}
          />
        ) : (
          <>
            <section className="map-stage-copy">
              <div className="eyebrow">World Map</div>
              <h1 className="map-stage-title">Global Internet Speeds</h1>
              <p className="page-copy" style={{ fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.35rem' }}>
                Hover to inspect. Click up to 5 countries to race them.
              </p>
            </section>
            <WorldMap
              selected={selected}
              onSelectedChange={setSelected}
              onStartRace={() => setRacing(true)}
              fileSizeMB={fileSizeMB}
              onFileSizeChange={setFileSizeMB}
            />
          </>
        )}
      </div>
    </div>
  )
}
