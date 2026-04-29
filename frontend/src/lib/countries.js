const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let countriesPromise = null

async function fetchCountries() {
  const dbRes = await fetch(`${API}/api/countries`)
  const dbJson = await dbRes.json()
  if (Array.isArray(dbJson.countries) && dbJson.countries.length > 0) {
    return dbJson.countries
  }

  const scrapeRes = await fetch(`${API}/api/scrape`)
  const scrapeJson = await scrapeRes.json()
  if (Array.isArray(scrapeJson.countries) && scrapeJson.countries.length > 0) {
    return scrapeJson.countries
  }

  throw new Error('No country speed data available.')
}

export function loadCountries() {
  if (!countriesPromise) {
    countriesPromise = fetchCountries().catch((error) => {
      countriesPromise = null
      throw error
    })
  }

  return countriesPromise
}
