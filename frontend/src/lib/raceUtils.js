export const CAR_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#A855F7',
]

export function flagUrl(a2) {
  if (!a2 || a2.length !== 2) return null
  return `https://flagcdn.com/w40/${a2.toLowerCase()}.png`
}
