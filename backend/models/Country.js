const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    rank:         { type: Number, required: true },
    country:      { type: String, required: true },
    abbreviation: { type: String, required: true, uppercase: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    downloadMbps: { type: Number, required: true },
    uploadMbps:   { type: Number },
    pingMs:       { type: Number },
    rankChange:   { type: Number, default: 0 },
    type:         { type: String, default: 'fixedBroadband' },
    scrapedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

countrySchema.index({ country: 'text' });
countrySchema.index({ abbreviation: 1 });

module.exports = mongoose.model('Country', countrySchema);
