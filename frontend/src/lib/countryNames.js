const COUNTRY_NAME_ALIASES = {
  'antigua and barb': 'antigua and barbuda',
  bahamas: 'bahamas',
  'bosnia and herz': 'bosnia and herzegovina',
  'central african rep': 'central african republic',
  czechia: 'czech republic',
  'cote d ivoire': 'cote d ivoire',
  'dem rep congo': 'democratic republic of the congo',
  'dr congo': 'democratic republic of the congo',
  'dominican rep': 'dominican republic',
  'eq guinea': 'equatorial guinea',
  'hong kong sar': 'hong kong',
  macau: 'macau',
  'macau sar': 'macau',
  'rep congo': 'republic of the congo',
  palestine: 'palestine',
  'the bahamas': 'bahamas',
  'timor leste': 'timor-leste',
  turkiye: 'turkey',
  'united states of america': 'united states',
}

export function normalizeName(name) {
  const normalized = String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[.,']/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^the /, '')
    .trim()

  return COUNTRY_NAME_ALIASES[normalized] || normalized
}
