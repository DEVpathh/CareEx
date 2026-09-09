import { createHash } from 'node:crypto'
import { extractDates, extractReferences } from './extraction.js'
export const reviewThreshold = () => {
  const value = Number(process.env.OCR_REVIEW_THRESHOLD ?? 85)
  return Number.isFinite(value) && value >= 1 && value <= 100 ? value : 85
}
const score = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1 ? Math.round(n * 1000) / 10 : null
const tokens = text => [...text.matchAll(/\S+/gu)]
const plain = text => text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}%]+$/gu, '')
export function confidenceElements(text, evidence = {}, previous = [], threshold = reviewThreshold()) {
  // Word scores are used when provided; Apple supplies a line score, which is
  // explicitly labelled as inherited rather than invented word-level certainty.
  const evidenceTokens = []
  for (const line of evidence.lines ?? []) {
    if (line.words?.length) for (const word of line.words) evidenceTokens.push({ value: word.text, confidence: score(word.confidence), basis: 'word' })
    else for (const token of tokens(line.text ?? '')) evidenceTokens.push({ value: token[0], confidence: score(line.confidence), basis: 'line' })
  }
  const refs = extractReferences(text), dates = extractDates(text), rows = []
  const evidenceByValue = new Map()
  for (const token of evidenceTokens) {
    const key = plain(token.value)
    if (!evidenceByValue.has(key)) evidenceByValue.set(key, [])
    evidenceByValue.get(key).push(token)
  }
  const add = (kind, value, confidence, basis, index, reason = null, candidates = undefined) => {
    const id = createHash('sha256').update(`${kind}:${index}:${value}`).digest('hex').slice(0,20)
    const old = previous.find(row => row.id === id && row.value === value)
    rows.push({ id, kind, value, originalValue: value, confidence, confidenceBasis: basis, requiresAssurance: confidence === null || confidence < threshold || !!reason, reason: reason ?? (confidence === null ? 'missing-confidence' : confidence < threshold ? 'low-confidence' : null), ...(candidates ? { candidates } : {}), assurance: old?.assurance ?? null })
  }
  tokens(text).forEach((token,index) => {
    const key = plain(token[0]), candidates = evidenceByValue.get(key) ?? []
    // Repeated text uses the most conservative actual score for that value.
    const confidence = !candidates.length || candidates.some(c=>c.confidence===null) ? null : Math.min(...candidates.map(c=>c.confidence))
    const abbreviation = refs.abbreviations.find(a=>a.abbreviation===key)
    const kind = abbreviation ? 'abbreviation' : refs.units.includes(key) ? 'unit' : 'text'
    add(kind, token[0], confidence, candidates[0]?.basis ?? 'unavailable', index, abbreviation?.candidates.length > 1 ? 'ambiguous-abbreviation' : null, abbreviation?.candidates)
  })
  dates.forEach((date,index) => {
    const parts = tokens(date.source).map(t=>plain(t[0]))
    const matches = rows.filter(row=>parts.includes(plain(row.value)))
    const confidence = !matches.length || matches.some(r=>r.confidence===null) ? null : Math.min(...matches.map(r=>r.confidence))
    add('date', date.date, confidence, 'source-text', index, dates.some(d=>d.source===date.source&&d.date!==date.date) ? 'ambiguous-date' : null)
  })
  return rows
}
