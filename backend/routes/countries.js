const express = require('express');
const router = express.Router();
const Country = require('../models/Country');
const mongoose = require('mongoose');
const { getCountryMetaByName } = require('../countryMeta');

async function withAbbreviation(country) {
  if (country.abbreviation) return country;
  const meta = await getCountryMetaByName(country.country);
  return meta ? { ...country, abbreviation: meta.a2 } : country;
}

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Database not connected.' });
    }

    const { sort = 'rank', order = 'asc', limit } = req.query;
    const allowed = ['rank', 'downloadMbps', 'country', 'abbreviation'];
    const sortField = allowed.includes(sort) ? sort : 'rank';
    const sortDir = order === 'desc' ? -1 : 1;

    let query = Country.find({ type: 'fixedBroadband' }).sort({ [sortField]: sortDir });
    if (limit) query = query.limit(parseInt(limit, 10));
    const countries = await Promise.all((await query.lean()).map(withAbbreviation));
    res.json({ count: countries.length, countries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Database not connected.' });
    }

    const lookup = req.params.slug;
    const country = await Country.findOne({
      $or: [
        { abbreviation: lookup.toUpperCase() },
        { slug: lookup.toLowerCase() },
      ],
    }).lean();
    if (!country) return res.status(404).json({ error: `Country '${req.params.slug}' not found.` });
    res.json(await withAbbreviation(country));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
