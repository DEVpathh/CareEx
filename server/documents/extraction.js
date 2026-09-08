import { readFileSync } from 'node:fs'
const medicineRows = JSON.parse(readFileSync(new URL('./medicine-abbreviations.json', import.meta.url), 'utf8'))
const frequencies = { OD: ['once daily', 'right eye'], BD: ['twice daily'], BID: ['twice daily'], TDS: ['three times daily'], TID: ['three times daily'], QID: ['four times daily'], HS: ['at bedtime'], SOS: ['as needed'], PRN: ['as needed'], PO: ['by mouth'], IV: ['intravenous'], IM: ['intramuscular'] }
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value
}
export function extractDates(text) {
  const found = new Map()
  const add = (year, month, day, source) => {
    if (Number(year) < 1900 || Number(year) > new Date().getFullYear() + 1) return
    const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    if (validDate(date)) found.set(date, { date, source })
  }
  for (const line of text.replace(/[०-९]/g, n => String('०१२३४५६७८९'.indexOf(n))).split('\n')) {
    if (/\bDOB\b|date of birth|जन्म/i.test(line)) continue
    for (const m of line.matchAll(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) add(m[1], m[2], m[3], m[0])
    for (const m of line.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})\b/g)) {
      const year = m[3].length === 2 ? Number(m[3]) <= new Date().getFullYear() % 100 ? `20${m[3]}` : `19${m[3]}` : m[3]
      add(year, m[2], m[1], m[0])
      if (m[1] !== m[2] && Number(m[1]) <= 12 && Number(m[2]) <= 12) add(year, m[1], m[2], m[0])
    }
    for (const m of line.matchAll(/\b(\d{1,2})[\s-]+(Jan\w*|Feb\w*|Mar\w*|Apr\w*|May|Jun\w*|Jul\w*|Aug\w*|Sep\w*|Oct\w*|Nov\w*|Dec\w*)[\s,-]+(\d{4})\b/gi)) add(m[3], ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[2].slice(0,3).toLowerCase())+1, m[1], m[0])
  }
  return [...found.values()]
}
export function extractReferences(text) {
  const tokens = new Set(text.match(/\b[A-Z][A-Z0-9]{1,9}\b/g) ?? [])
  const results = []
  for (const token of tokens) {
    const candidates = [...new Set([...(frequencies[token] ?? []), ...medicineRows.filter(r => r.abbr === token).map(r => r.name)])]
    if (candidates.length) results.push({ abbreviation: token, candidates, requiresConfirmation: true })
  }
  const units = [...new Set(text.match(/(?:mcg|mg|g|mmol|mEq|IU|U)\/(?:kg\/min|dL|L|mL|kg)|\b(?:mcg|mg|mL|mmHg|bpm|kg)\b|%/g) ?? [])]
  return { abbreviations: results, units }
}
