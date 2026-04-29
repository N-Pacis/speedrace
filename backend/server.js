require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { scrapeFixedBroadband, scrapeCountryDetail } = require('./scraper');
const countriesRouter = require('./routes/countries');
const resultsRouter = require('./routes/results');

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => { console.error(err.message); process.exit(1); });
} else {
  console.warn('MONGODB_URI not set — database features disabled.');
}

app.get('/api/scrape', async (req, res) => {
  try {
    const countries = await scrapeFixedBroadband();
    if (countries.length !== 153) {
      return res.status(500).json({ error: `Expected 153 countries, got ${countries.length}.`, countries });
    }
    res.json({ count: countries.length, countries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scrape/:slug', async (req, res) => {
  try {
    const detail = await scrapeCountryDetail(req.params.slug);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/countries', countriesRouter);
app.use('/api/results', resultsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
