import { useState, useEffect, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { geoArea, geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopoJson from 'world-atlas/countries-110m.json'
import { loadCountries } from '../lib/countries'
import { normalizeName } from '../lib/countryNames'
import Flag from './Flag'

const COLORS = {
  brandDark:  '#1D4ED8',
  brandLight: '#F7F9FB',
  noData:     '#c4c6ce',
  text:       '#434655',
}

const COUNTRIES_GEO   = feature(worldTopoJson, worldTopoJson.objects.countries)
const INITIAL_POSITION = { coordinates: [12, 18], zoom: 2.35 }
const MIN_ZOOM         = 1
const MAX_ZOOM         = 7
const LABEL_THRESHOLD  = 0.0012
const MAX_RACERS       = 5

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
const [lr, lg, lb] = hexToRgb(COLORS.brandLight)
const [dr, dg, db] = hexToRgb(COLORS.brandDark)

function speedToColor(speed, maxSpeed) {
  if (speed == null || maxSpeed === 0) return COLORS.noData
  const t = Math.sqrt(Math.max(0, Math.min(1, speed / maxSpeed)))
  return `rgb(${Math.round(lr+(dr-lr)*t)},${Math.round(lg+(dg-lg)*t)},${Math.round(lb+(db-lb)*t)})`
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

export default function WorldMap({ selected = [], onSelectedChange, onStartRace, fileSizeMB = 100, onFileSizeChange }) {
  const [countries, setCountries] = useState([])
  const [speedMap,  setSpeedMap]  = useState({})
  const [maxSpeed,  setMaxSpeed]  = useState(1)
  const [status,    setStatus]    = useState('loading')
  const [tooltip,   setTooltip]   = useState(null)
  const [position,  setPosition]  = useState(INITIAL_POSITION)
  const [mbInput,   setMbInput]   = useState(String(fileSizeMB))

  useEffect(() => {
    loadCountries().then(cs => {
      setCountries(cs)
      const map = {}
      for (const c of cs) { if (c.abbreviation) map[c.abbreviation] = c.downloadMbps }
      setSpeedMap(map)
      setMaxSpeed(Math.max(...Object.values(map)))
      setStatus('ok')
    }).catch(() => setStatus('error'))
  }, [])

  /* keep local input string in sync when parent changes mb */
  useEffect(() => { setMbInput(String(fileSizeMB)) }, [fileSizeMB])

  const fills = useMemo(() => {
    const byName = new Map(countries.map(c => [normalizeName(c.country), c]))
    const map = {}
    for (const geo of COUNTRIES_GEO.features) {
      const c     = byName.get(normalizeName(geo.properties?.name))
      const speed = c?.abbreviation ? (speedMap[c.abbreviation] ?? null) : null
      map[geo.id] = speedToColor(speed, maxSpeed)
    }
    return map
  }, [countries, speedMap, maxSpeed])

  const byName = useMemo(
    () => new Map(countries.map(c => [normalizeName(c.country), c])),
    [countries]
  )

  const selectedCodes = new Set(selected.map(c => c.abbreviation))

  function handleEnter(geo, e) {
    const c     = byName.get(normalizeName(geo.properties?.name))
    const speed = c?.abbreviation ? (speedMap[c.abbreviation] ?? null) : null
    setTooltip({ name: c?.country ?? geo.properties?.name ?? '—', speed, x: e.clientX, y: e.clientY })
  }

  function toggleCountry(geo) {
    const c = byName.get(normalizeName(geo.properties?.name))
    if (!c || !c.downloadMbps) return
    onSelectedChange(prev => {
      const exists = prev.some(x => x.abbreviation === c.abbreviation)
      if (exists) return prev.filter(x => x.abbreviation !== c.abbreviation)
      if (prev.length >= MAX_RACERS) return prev
      return [...prev, c]
    })
  }

  function removeCountry(abbr) {
    onSelectedChange(prev => prev.filter(x => x.abbreviation !== abbr))
  }

  function commitMb(raw) {
    const v = parseInt(raw, 10)
    if (!isNaN(v) && v >= 1 && v <= 100000) {
      onFileSizeChange?.(v)
      setMbInput(String(v))
    } else {
      setMbInput(String(fileSizeMB)) /* revert on bad input */
    }
  }

  const slowest = selected.length > 0
    ? Math.max(...selected.map(c => (fileSizeMB * 8) / Math.max(c.downloadMbps ?? 1, 0.01)))
    : 0

  return (
    <div className="map-with-sidebar">

      {/* ── Map viewport ── */}
      <div
        className="map-viewport"
        onMouseMove={e => { if (tooltip) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY })) }}
      >
        {status === 'loading' && (
          <div className="map-status-chip status-text muted">Loading speed data…</div>
        )}
        {status === 'error' && (
          <div className="map-status-chip status-text error">Could not load speed data</div>
        )}

        <div className="map-control-cluster">
          <button type="button" className="map-control-button" onClick={() => setPosition(p => ({ ...p, zoom: clamp(p.zoom + 0.45, MIN_ZOOM, MAX_ZOOM) }))}>+</button>
          <button type="button" className="map-control-button" onClick={() => setPosition(p => ({ ...p, zoom: clamp(p.zoom - 0.45, MIN_ZOOM, MAX_ZOOM) }))}>-</button>
        </div>

        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 255 }}
          width={1600} height={920}
          className="map-svg"
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
            <Geographies geography={COUNTRIES_GEO}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => {
                    const c          = byName.get(normalizeName(geo.properties?.name))
                    const isSel      = selectedCodes.has(c?.abbreviation)
                    const clickable  = !!c?.downloadMbps
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fills[geo.id] ?? COLORS.noData}
                        stroke={isSel ? '#111827' : '#ffffff'}
                        strokeWidth={isSel ? 2.2 : 0.55}
                        style={{
                          default: { outline: 'none', cursor: clickable ? 'pointer' : 'default' },
                          hover:   { outline: 'none', opacity: 0.85, cursor: clickable ? 'pointer' : 'default' },
                          pressed: { outline: 'none' },
                        }}
                        onClick={() => toggleCountry(geo)}
                        onMouseEnter={e => handleEnter(geo, e)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}

                  {geographies.map(geo => {
                    const c = byName.get(normalizeName(geo.properties?.name))
                    if (!c || geoArea(geo) < LABEL_THRESHOLD) return null
                    const [cx, cy] = geoCentroid(geo)
                    const dark = (speedMap[c.abbreviation] ?? 0) > 0 &&
                      Math.sqrt((speedMap[c.abbreviation] ?? 0) / maxSpeed) > 0.55
                    return (
                      <Marker key={`lbl-${geo.rsmKey}`} coordinates={[cx, cy]}>
                        <text fontSize={7} textAnchor="middle" dominantBaseline="central"
                          fill={dark ? '#fff' : COLORS.text}
                          style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 700 }}>
                          {c.abbreviation}
                        </text>
                      </Marker>
                    )
                  })}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Speed legend – bottom left only */}
        <div className="map-overlay-bottom" style={{ justifyContent: 'flex-start' }}>
          <div className="map-legend-group">
            <span className="eyebrow">Download speed</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{
                height: '0.6rem', width: '10rem', borderRadius: '999px',
                background: `linear-gradient(to right, ${[0,0.25,0.5,0.75,1].map(s => speedToColor(s*maxSpeed, maxSpeed)).join(', ')})`,
              }} />
              <div className="status-text muted" style={{ display: 'flex', justifyContent: 'space-between', width: '10rem', fontSize: '0.7rem' }}>
                <span>0</span><span>{Math.round(maxSpeed/2)}</span><span>{maxSpeed} Mbps</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ height: '0.75rem', width: '1rem', background: COLORS.noData, borderRadius: 2 }} />
              <span className="status-text muted">No data</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="map-sidebar">
        <div className="eyebrow" style={{ marginBottom: '0.1rem' }}>Race Sim</div>
        <p className="map-sidebar-hint">
          {selected.length === 0
            ? 'Click countries on the map to add racers'
            : selected.length < 2
              ? 'Select one more to race'
              : `${selected.length} of ${MAX_RACERS} selected`}
        </p>

        {/* Racer slots */}
        <div className="map-sidebar-racers">
          {Array.from({ length: MAX_RACERS }).map((_, i) => {
            const c = selected[i]
            return c ? (
              <div key={c.abbreviation} className="map-sidebar-racer">
                <span className="map-sidebar-racer-num">{i + 1}</span>
                <Flag code={c.abbreviation} size={20} />
                <div className="map-sidebar-racer-info">
                  <span className="map-sidebar-racer-name">{c.country}</span>
                  <span className="map-sidebar-racer-spd">{c.downloadMbps?.toFixed(0)} Mbps</span>
                </div>
                <button className="map-sidebar-racer-x" onClick={() => removeCountry(c.abbreviation)}>×</button>
              </div>
            ) : (
              <div key={i} className="map-sidebar-slot">
                <span className="map-sidebar-racer-num">{i + 1}</span>
                <span className="map-sidebar-slot-label">Click map to add</span>
              </div>
            )
          })}
        </div>

        {/* File size */}
        <div className="map-sidebar-divider" />
        <div className="field-stack">
          <label className="field-label">File Size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min="1" max="100000"
              value={mbInput}
              onChange={e => setMbInput(e.target.value)}
              onBlur={e => commitMb(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitMb(e.target.value) }}
              className="app-select"
              style={{ width: '5.5rem' }}
            />
            <span className="status-text muted">MB</span>
          </div>
          {selected.length >= 2 && (
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Approx {slowest.toFixed(1)}s race
            </p>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          className="app-button"
          disabled={selected.length < 2}
          onClick={() => onStartRace?.(selected)}
          style={{ width: '100%' }}
        >
          {selected.length < 2 ? `Select ${2 - selected.length} more` : 'Start Race →'}
        </button>
      </aside>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none px-3 py-2 text-sm whitespace-nowrap shadow-lg"
          style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10, zIndex: 50,
            background: COLORS.brandDark, color: '#F7F9FB', pointerEvents: 'none',
            fontSize: '0.85rem', padding: '0.4rem 0.7rem', lineHeight: 1.5 }}>
          <strong>{tooltip.name}</strong><br />
          {tooltip.speed != null ? `${tooltip.speed} Mbps` : 'No data'}
        </div>
      )}
    </div>
  )
}
