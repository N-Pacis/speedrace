import WorldMap from '../components/WorldMap'

export default function MapPage() {
  return (
    <div className="page-stack map-page-shell">
      <div className="surface-card map-frame map-immersive">
        <section className="map-stage-copy">
          <div className="eyebrow">World Map</div>
          <h1 className="map-stage-title">Global Internet Speeds</h1>
          <p className="page-copy" style={{ fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.35rem' }}>
            Hover any country to see its average download speed. Data from Ookla.
          </p>
        </section>
        <WorldMap />
      </div>
    </div>
  )
}
