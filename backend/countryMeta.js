const path = require('node:path');
const { pathToFileURL } = require('node:url');

let metaPromise = null;

async function loadCountryMeta() {
  if (!metaPromise) {
    metaPromise = (async () => {
      const moduleUrl = pathToFileURL(path.resolve(__dirname, '../frontend/src/constants.js')).href;
      const { COUNTRY_META, normalizeName } = await import(moduleUrl);
      const byName = new Map();
      const byAbbreviation = new Map();

      for (const meta of Object.values(COUNTRY_META)) {
        byName.set(normalizeName(meta.ooklaName), meta);
        byAbbreviation.set(meta.a2, meta);
      }

      return { byName, byAbbreviation, normalizeName };
    })();
  }

  return metaPromise;
}

async function getCountryMetaByName(name) {
  const { byName, normalizeName } = await loadCountryMeta();
  return byName.get(normalizeName(name)) || null;
}

async function getCountryMetaByAbbreviation(abbreviation) {
  const { byAbbreviation } = await loadCountryMeta();
  return byAbbreviation.get(String(abbreviation || '').toUpperCase()) || null;
}

module.exports = {
  loadCountryMeta,
  getCountryMetaByName,
  getCountryMetaByAbbreviation,
};
