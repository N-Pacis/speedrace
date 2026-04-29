const axios = require('axios');
const cheerio = require('cheerio');
const { getCountryMetaByName } = require('./countryMeta');

const SPEEDTEST_URL = 'https://www.speedtest.net/global-index';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function scrapeFixedBroadband() {
  const { data: html } = await axios.get(SPEEDTEST_URL, { headers: HEADERS });
  const $ = cheerio.load(html);
  const scrapedAt = new Date();
  const countries = [];

  $('#column-fixedMean tr.data-result').each((_, row) => {
    const $row = $(row);
    const rank = parseInt($row.find('td.actual-rank').text().trim(), 10);
    const $anchor = $row.find('td.country a');
    const country = $anchor.text().trim();
    const href = $anchor.attr('href') || '';
    const slug = href.replace('/global-index/', '').replace(/#.*$/, '').trim();
    const downloadMbps = parseFloat($row.find('td.speed').text().trim());
    const rankChangeRaw = $row.find('td.rank-change span').text().trim();
    const rankChange = rankChangeRaw === '-' ? 0 : parseInt(rankChangeRaw, 10) || 0;
    countries.push({ rank, country, slug, downloadMbps, rankChange, scrapedAt });
  });

  const enriched = [];
  for (const countryRow of countries) {
    const meta = await getCountryMetaByName(countryRow.country);
    if (!meta) {
      throw new Error(`No abbreviation mapping found for '${countryRow.country}'.`);
    }
    enriched.push({ ...countryRow, abbreviation: meta.a2 });
  }

  return enriched;
}

async function scrapeCountryDetail(slug) {
  const url = `${SPEEDTEST_URL}/${slug}`;
  const { data: html } = await axios.get(url, { headers: HEADERS });
  const $ = cheerio.load(html);

  let displayData = null;
  $('script').each((_, el) => {
    const src = $(el).html() || '';
    const match = src.match(/var display_data\s*=\s*(\{.*?\});/s);
    if (match) {
      try { displayData = JSON.parse(match[1]); } catch (_e) {}
    }
  });

  if (!displayData || !displayData.fixedMean) {
    throw new Error(`Could not parse display_data for: ${slug}`);
  }

  const fm = displayData.fixedMean;
  return {
    slug,
    rank: fm.current_rank,
    previousRank: fm.previous_rank,
    rankChange: fm.rank_change,
    downloadMbps: parseFloat(fm.download_mbps),
    uploadMbps: parseFloat(fm.upload_mbps),
    latencyMs: fm.latency_ms,
    type: 'fixedBroadband',
  };
}

module.exports = { scrapeFixedBroadband, scrapeCountryDetail };
