import WorldMap from '../components/WorldMap'

export default function MapPage() {
  return (
    <div className="page-stack map-page-shell">
      <div className="surface-card map-frame map-immersive">
        <section className="map-stage-copy">
          <div className="eyebrow">World Map</div>
          <h1 className="map-stage-title">Global Internet Speed Map</h1>
          <p className="page-copy">
            Select up to five (5) countries to test how fast each can download a 100MB File. Data From ookla.com
          </p>
        </section>
        <WorldMap />
      </div>
    </div>
  )
}
