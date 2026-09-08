import { randomUUID } from 'node:crypto'
import { extractDates, extractReferences, validDate } from './extraction.js'
import { decodeImage } from './ocr.js'
export const publicDocument = ({ image, originalImage, ...record }) => record
export function mountDocuments(app, { documents, patients, consents, cases, persist, ocr, envelope }) {
  app.get('/api/v1/documents/status', (_req, res) => res.json(envelope(ocr.status)))
  app.post('/api/v1/documents/scan', async (req, res) => {
    const { patientId, image, originalImage, fileType } = req.body ?? {}
    if (![...patients.values()].some(p => p.id === patientId) || !consents.get(patientId)?.purposes.priorRecords) return res.status(403).json({ message: 'Consent to review prior records is required before scanning.' })
    if (!['prescription','lab_report','discharge_summary','other'].includes(fileType)) return res.status(400).json({ message: 'Choose a document type.' })
    try { decodeImage(image); decodeImage(originalImage) } catch (error) { return res.status(400).json({ message: error.message }) }
    const id = `doc-${randomUUID()}`
    const record = { id, patientId, fileType, fileName: `Camera scan ${documents.size + 1}`, source: 'camera', uploadedAt: new Date().toISOString(), image, originalImage, extractedText: '', dateCandidates: [], documentDate: null, reviewed: false, ocrStatus: 'processing', abbreviations: [], units: [] }
    documents.set(id, record); persist()
    res.status(202).json(envelope(publicDocument(record)))
    // Keep OCR off the request path: polling survives slow OCR and browser retries.
    try {
      const result = await ocr.recognize(image)
      if (!documents.has(id)) return
      documents.set(id, { ...record, extractedText: result.text.slice(0, 50000), lines: result.lines, provider: result.provider, languages: result.languages, dateCandidates: extractDates(result.text), ...extractReferences(result.text), ocrStatus: result.text.trim() ? 'ready' : 'needs_review', ocrMessage: result.text.trim() ? null : 'No legible text found. Retake or have the doctor read the original scan.' })
    } catch {
      if (!documents.has(id)) return
      documents.set(id, { ...record, ocrStatus: 'needs_review', ocrMessage: 'OCR could not read this page. Retake or keep the original for doctor review.' })
    }
    persist()
  })
  app.get('/api/v1/documents/:documentId/ocr', (req, res) => {
    const doc = documents.get(req.params.documentId)
    if (!doc) return res.status(404).json({ message: 'Document not found.' })
    res.json(envelope(publicDocument(doc)))
  })
  app.get('/api/v1/documents/:documentId/image', (req, res) => {
    const doc = documents.get(req.params.documentId)
    if (!doc) return res.status(404).json({ message: 'Document not found.' })
    const { buffer, mime } = decodeImage(req.query.original === 'true' ? doc.originalImage : doc.image)
    res.set('Cache-Control', 'no-store').type(mime).send(buffer)
  })
  app.patch('/api/v1/documents/:documentId', (req, res) => {
    const doc = documents.get(req.params.documentId)
    if (!doc) return res.status(404).json({ message: 'Document not found.' })
    if (doc.ocrStatus === 'processing') return res.status(409).json({ message: 'Wait for OCR to finish before reviewing.' })
    const { documentDate, extractedText, reviewed } = req.body ?? {}
    if ((documentDate !== null && !validDate(documentDate)) || typeof extractedText !== 'string' || extractedText.length > 50000 || reviewed !== true) return res.status(400).json({ message: 'Review the text and confirm a valid date, or leave it undated.' })
    const updated = { ...doc, documentDate, extractedText, reviewed, reviewedAt: new Date().toISOString(), ...extractReferences(extractedText) }
    documents.set(doc.id, updated); persist()
    res.json(envelope(publicDocument(updated)))
  })
  app.delete('/api/v1/documents/:documentId', (req, res) => {
    if ([...cases.values()].some(c => c.documentIds?.includes(req.params.documentId))) return res.status(409).json({ message: 'This scan is attached to a submitted case.' })
    documents.delete(req.params.documentId); persist(); res.json(envelope({ deleted: true }))
  })
  app.get('/api/v1/cases/:caseId/timeline', (req, res) => {
    const current = cases.get(req.params.caseId)
    if (!current) return res.status(404).json({ message: 'Case not found.' })
    const rows = (current.documentIds ?? []).map(id => documents.get(id)).filter(Boolean).map(publicDocument)
    // Undated pages remain separate at the end; never substitute capture date.
    rows.sort((a,b) => a.documentDate && b.documentDate ? a.documentDate.localeCompare(b.documentDate) || a.id.localeCompare(b.id) : a.documentDate ? -1 : b.documentDate ? 1 : a.id.localeCompare(b.id))
    res.json(envelope(rows))
  })
}
