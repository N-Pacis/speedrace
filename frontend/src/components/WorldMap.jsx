import { useState, useEffect, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { geoArea, geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopoJson from 'world-atlas/countries-110m.json'
import { loadCountries } from '../lib/countries'
import { normalizeName } from '../lib/countryNames'

const COLORS = {
  brandDark: '#1D4ED8',
  brandLight: '#F7F9FB',
  noData: '#c4c6ce',
  text: '#434655',
}

const COUNTRIES_GEO = feature(worldTopoJson, worldTopoJson.objects.countries)
const INITIAL_POSITION = {
  coordinates: [12, 18],
  zoom: 2.35,
}
const MIN_ZOOM = 1
const MAX_ZOOM = 7
const LABEL_AREA_THRESHOLD = 0.0012

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const [lr, lg, lb] = hexToRgb(COLORS.brandLight)
const [dr, dg, db] = hexToRgb(COLORS.brandDark)

function speedToColor(speed, maxSpeed) {
  if (speed == null || maxSpeed === 0) return COLORS.noData
  const t = Math.max(0, Math.min(1, speed / maxSpeed))
  return `rgb(${Math.round(lr + (dr - lr) * t)},${Math.round(lg + (dg - lg) * t)},${Math.round(lb + (db - lb) * t)})`
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export default function WorldMap() {
  const [countries, setCountries] = useState([])
  const [speedMap, setSpeedMap] = useState({})
  const [maxSpeed, setMaxSpeed] = useState(1)
  const [status,   setStatus]   = useState('loading')
  const [tooltip,  setTooltip]  = useState(null)
  const [position, setPosition] = useState(INITIAL_POSITION)

  useEffect(() => {
    async function load() {
      try {
        const countries = await loadCountries()

        if (countries && countries.length > 0) {
          setCountries(countries)
          const map = {}
          for (const c of countries) {
            if (c.abbreviation) map[c.abbreviation] = c.downloadMbps
          }
          const max = Math.max(...Object.values(map))
          setSpeedMap(map)
          setMaxSpeed(max)
          setStatus('ok')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    load()
  }, [])

  const fills = useMemo(() => {
    const countriesByName = new Map(
      countries.map(country => [normalizeName(country.country), country])
    )
    const map = {}
    for (const geo of COUNTRIES_GEO.features) {
      const country = countriesByName.get(normalizeName(geo.properties?.name))
      const speed = country?.abbreviation ? (speedMap[country.abbreviation] ?? null) : null
      map[geo.id] = speedToColor(speed, maxSpeed)
    }
    return map
  }, [countries, speedMap, maxSpeed])

  const countriesByName = useMemo(
    () => new Map(countries.map(country => [normalizeName(country.country), country])),
    [countries]
  )

  function handleEnter(geo, e) {
    const country = countriesByName.get(normalizeName(geo.properties?.name))
    const speed = country?.abbreviation ? (speedMap[country.abbreviation] ?? null) : null
    setTooltip({
      name:  country?.country ?? geo.properties?.name ?? '—',
      speed,
      x: e.clientX,
      y: e.clientY,
    })
  }

  function handleMove(e) {
    if (tooltip) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))
  }

  function updateZoom(direction) {
    setPosition(current => ({
      ...current,
      zoom: clamp(current.zoom + direction * 0.45, MIN_ZOOM, MAX_ZOOM),
    }))
  }

  return (
    <div className="relative w-full">
      <div className="map-viewport">
        {status === 'loading' && (
          <div className="map-status-chip status-text muted">Loading speed data…</div>
        )}
        {status === 'error' && (
          <div className="map-status-chip status-text error">
            Could not load speed data — is the server running?
          </div>
        )}

        <div className="map-control-cluster" aria-label="Map controls">
          <button type="button" className="map-control-button" onClick={() => updateZoom(1)}>
            +
          </button>
          <button type="button" className="map-control-button" onClick={() => updateZoom(-1)}>
            -
          </button>
        </div>

        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 255 }}
          width={1600}
          height={920}
          className="map-svg"
          onMouseMove={handleMove}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
            <Geographies geography={COUNTRIES_GEO}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fills[geo.id] ?? COLORS.noData}
                      stroke="#ffffff"
                      strokeWidth={0.55}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none', opacity: 0.9 },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={e => handleEnter(geo, e)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}

                  {geographies.map(geo => {
                    const country = countriesByName.get(normalizeName(geo.properties?.name))
                    if (!country || geoArea(geo) < LABEL_AREA_THRESHOLD) return null
                    const [cx, cy] = geoCentroid(geo)
                    const speed    = speedMap[country.abbreviation] ?? null
                    const dark     = speed != null && speed / maxSpeed > 0.55
                    return (
                      <Marker key={`lbl-${geo.rsmKey}`} coordinates={[cx, cy]}>
                        <text
                          fontSize={7}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={dark ? '#fff' : COLORS.text}
                          style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 700 }}
                        >
                          {country.abbreviation}
                        </text>
                      </Marker>
                    )
                  })}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <div className="map-overlay-bottom">
          <div className="map-legend-group">
            <span className="eyebrow">Download speed</span>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-40"
                style={{ background: `linear-gradient(to right, ${speedToColor(0, maxSpeed)}, ${speedToColor(maxSpeed, maxSpeed)})` }}
              />
              <span className="status-text muted">0 — {maxSpeed} Mbps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3.5" style={{ background: COLORS.noData }} />
              <span className="status-text muted">No data</span>
            </div>
          </div>

          <div className="map-hint-chip status-text muted">
            Drag to pan. Scroll or pinch to zoom out.
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 text-sm whitespace-nowrap shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            background: COLORS.brandDark,
            color: '#F7F9FB',
          }}
        >
          <strong>{tooltip.name}</strong>
          <br />
          {tooltip.speed != null ? `${tooltip.speed} Mbps` : 'No data'}
        </div>
      )}
    </div>
  )
}
