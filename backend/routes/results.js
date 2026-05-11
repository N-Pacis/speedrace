const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Country = require('../models/Country');
const { getCountryMetaByName, getCountryMetaByAbbreviation } = require('../countryMeta');

router.post('/', async (req, res) => {
  try {
    const { abbreviation, country, ip, downloadMbps, uploadMbps, pingMs } = req.body;

    if (!abbreviation || downloadMbps == null) {
      return res.status(400).json({ error: 'abbreviation and downloadMbps are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Result logged. Connect MongoDB to persist.', received: { abbreviation, country, ip, downloadMbps, uploadMbps, pingMs } });
    }

    const code = String(abbreviation).toUpperCase();
    const existing = await Country.findOne({
      $or: [
        { abbreviation: code },
        ...(country ? [{ country }] : []),
      ],
    });

    if (!existing) {
      return res.status(404).json({ error: `Country '${code}' not found. Run seed.js first.` });
    }

    const avgDownload = parseFloat((existing.downloadMbps * 0.9 + downloadMbps * 0.1).toFixed(2));
    const metaByCode = await getCountryMetaByAbbreviation(code);
    const metaByName = country ? await getCountryMetaByName(country) : null;
    const canonicalCountry = existing.country || metaByCode?.ooklaName || metaByName?.ooklaName || country;

    const updated = await Country.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          abbreviation: code,
          ...(canonicalCountry && { country: canonicalCountry }),
          downloadMbps: avgDownload,
          ...(uploadMbps != null && { uploadMbps }),
          ...(pingMs != null && { pingMs }),
        },
      },
      { new: true }
    );

    return res.json({ message: 'Result recorded.', previous: existing.downloadMbps, submitted: downloadMbps, averaged: avgDownload, country: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
