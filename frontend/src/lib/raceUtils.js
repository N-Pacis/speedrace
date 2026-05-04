export function flagUrl(a2) {
  if (!a2 || a2.length !== 2) return null
  return `https://flagcdn.com/w40/${a2.toLowerCase()}.png`
}
