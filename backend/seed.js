require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');
const { scrapeFixedBroadband } = require('./scraper');

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  console.log('Scraping speedtest.net/global-index...');
  const countries = await scrapeFixedBroadband();
  console.log(`Got ${countries.length} countries`);

  let upserted = 0;
  for (const c of countries) {
    const existing = await Country.findOne({ slug: c.slug });
    const downloadMbps = existing
      ? parseFloat(((existing.downloadMbps + c.downloadMbps) / 2).toFixed(2))
      : c.downloadMbps;
    await Country.findOneAndUpdate(
      { slug: c.slug },
      { $set: { ...c, downloadMbps } },
      { upsert: true, new: true }
    );
    upserted++;
  }

  console.log(`Upserted ${upserted} countries.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
