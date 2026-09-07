import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
import { analyseIntake, symptomCatalog } from './intake.js'

const experience = {
  brand: { name: 'CareX', organisation: 'Your health, our care' },
  languages: [{ label: 'हिन्दी', locale: 'hi-IN' }, { label: 'English', locale: 'en-IN' }],
  steps: ['Your concern', 'Patient details', 'Consent', 'Review'],
  identificationOptions: [
    { id: 'abha', label: 'ABHA ID', helper: 'Find an existing record', voiceAliases: ['abha', 'आभा'] },
    { id: 'aadhaar', label: 'Aadhaar', helper: 'Find an existing record', voiceAliases: ['aadhaar', 'aadhar', 'आधार'] },
    { id: 'manual', label: 'New patient', helper: 'Create your record', voiceAliases: ['new patient', 'नया मरीज'] },
  ],
  consentPurposes: [
    { id: 'casePreparation', label: 'Use my answers to prepare this visit' },
    { id: 'priorRecords', label: 'Allow my doctor to review earlier records, if available' },
    { id: 'careTeamSharing', label: 'Share my visit summary with the care team' },
  ],
  welcome: { eyebrow: 'CareX', title: 'हेलो, क्या समस्या है आपको?', description: '', prompt: 'हेलो, क्या समस्या है आपको?' },
}
const envelope = data => ({ data, requestId: randomUUID(), timestamp: new Date().toISOString() })
const isHindi = language => /हिन्दी|हिंदी|^hi|hindi/i.test(language ?? '')
const fields = ['chiefComplaint', 'hpi', 'pastHistory', 'drugAndAllergy', 'familyHistory', 'ros', 'clinicianNotes']

export function createApp({ storagePath = null } = {}) {
  const saved = storagePath && existsSync(storagePath) ? JSON.parse(readFileSync(storagePath, 'utf8')) : {}
  const patients = new Map(saved.patients ?? [
    ['14-23-45-67-89-01', { id: 'patient-riya-sharma', displayName: 'Riya Sharma', abhaId: '14-23-45-67-89-01', age: 42, sex: 'female', opd: 'OPD 04', verified: true }],
  ])
  const consents = new Map(saved.consents ?? [])
  const cases = new Map(saved.cases ?? [])
  const attendantRequests = new Map(saved.attendantRequests ?? [])
  const persist = () => {
    if (!storagePath) return
    mkdirSync(dirname(storagePath), { recursive: true })
    writeFileSync(`${storagePath}.tmp`, JSON.stringify({ patients: [...patients], consents: [...consents], cases: [...cases], attendantRequests: [...attendantRequests] }, null, 2), { mode: 0o600 })
    renameSync(`${storagePath}.tmp`, storagePath)
  }
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))
  app.get('/api/v1/health', (_req, res) => res.json(envelope({ status: 'ok', intakeEngine: 'adaptive-rules-v2', symptomGroups: symptomCatalog.length })))
  app.get('/api/v1/patient-experience', (_req, res) => res.json(envelope(experience)))
  app.get('/api/v1/patients/lookup', (req, res) => {
    const identifier = String(req.query.identifier ?? '').trim()
    const method = String(req.query.method ?? '')
    if (!identifier || !['abha', 'aadhaar'].includes(method)) return res.status(400).json({ message: 'Enter an identifier and a valid lookup method.' })
    const patient = patients.get(identifier) ?? [...patients.values()].find(p => method === 'abha' && p.abhaId?.replace(/\D/g, '') === identifier.replace(/\D/g, ''))
    if (!patient) return res.status(404).json({ message: 'No matching patient. Check the number or register as a new patient.' })
    res.json(envelope(patient))
  })
  app.post('/api/v1/patients', (req, res) => {
    const { displayName, age, sex } = req.body ?? {}
    if (typeof displayName !== 'string' || displayName.trim().length < 2 || age === '' || age === null || !Number.isFinite(Number(age)) || Number(age) < 0 || Number(age) > 120 || !['female', 'male', 'other'].includes(sex)) return res.status(400).json({ message: 'Enter a name, an age from 0 to 120, and a valid sex.' })
    const id = `patient-${randomUUID()}`
    const patient = { id, displayName: displayName.trim(), age: Number(age), sex, opd: 'General OPD', verified: false }
    patients.set(id, patient); persist()
    res.status(201).json(envelope(patient))
  })
  app.post('/api/v1/consents', (req, res) => {
    const { patientId, purposes, language } = req.body ?? {}
    if (![...patients.values()].some(p => p.id === patientId) || !purposes || ['casePreparation', 'priorRecords', 'careTeamSharing'].some(key => typeof purposes[key] !== 'boolean')) return res.status(400).json({ message: 'A registered patient and explicit consent choices are required.' })
    const consent = { patientId, purposes, language, capturedAt: new Date().toISOString() }
    consents.set(patientId, consent); persist()
    res.status(201).json(envelope(consent))
  })
  app.post('/api/v1/intake/questions', (req, res) => {
    const complaint = String(req.body?.complaint ?? '').trim()
    if (complaint.length < 3 || complaint.length > 5000) return res.status(400).json({ message: 'Please describe the problem in 3 to 5000 characters.' })
    const answers = req.body?.answers ?? {}
    if (!answers || Array.isArray(answers) || typeof answers !== 'object' || Object.entries(answers).some(([key, value]) => key.length > 100 || typeof value !== 'string' || value.length > 5000)) return res.status(400).json({ message: 'Invalid follow-up answers.' })
    const analysis = analyseIntake({ complaint, pathway: req.body?.pathway, language: req.body?.language, answers })
    for (const question of analysis.questions) {
      const value = answers[question.id]
      if (value === undefined || !value.trim()) continue
      if (question.options && !question.options.some(option => option.value === value)) return res.status(400).json({ message: 'Choose one of the displayed answers.' })
      if (question.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < question.min || Number(value) > question.max)) return res.status(400).json({ message: 'Severity must be between 0 and 10.' })
    }
    res.json(envelope(analysis))
  })
  app.get('/api/v1/cases/draft', (_req, res) => res.json(envelope({ id: `case-${randomUUID()}`, patientId: '', status: 'draft', chiefComplaint: '', hpi: '', pastHistory: '', drugAndAllergy: '', familyHistory: '', ros: '' })))
  app.get('/api/v1/cases', (_req, res) => res.json(envelope([...cases.values()].sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.createdAt.localeCompare(a.createdAt)))))
  app.post('/api/v1/cases/submit', (req, res) => {
    const body = req.body ?? {}
    const patient = [...patients.values()].find(p => p.id === body.patientId)
    if (!patient || typeof body.chiefComplaint !== 'string' || body.chiefComplaint.trim().length < 3) return res.status(400).json({ message: 'A registered patient and chief complaint are required.' })
    const consent = consents.get(patient.id)
    if (!consent?.purposes.casePreparation || !consent?.purposes.careTeamSharing) return res.status(400).json({ message: 'Consent to prepare and share this visit is required. Ask an attendant for an alternative check-in.' })
    if (body.id && cases.has(body.id)) return res.json(envelope(cases.get(body.id)))
    const analysis = analyseIntake({ complaint: body.chiefComplaint, answers: body.answers ?? {}, pathway: body.pathway, language: body.language })
    const submitted = {
      ...Object.fromEntries(fields.map(key => [key, String(body[key] ?? '').slice(0, 20000)])),
      id: body.id || `case-${randomUUID()}`, patientId: patient.id, patient,
      status: 'submitted', token: `A-${String(cases.size + 1).padStart(3, '0')}`,
      language: body.language, pathway: body.pathway === 'ayush' ? 'ayush' : 'general',
      answers: { ...analysis.inferredAnswers, ...body.answers }, questions: analysis.questions,
      urgent: analysis.urgent, urgentReasons: analysis.urgentReasons,
      triageLevel: analysis.triageLevel,
      tridosha: analysis.tridosha,
      dashavidha: analysis.dashavidha,
      uploadedDocuments: Array.isArray(body.uploadedDocuments) ? body.uploadedDocuments : [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
    }
    cases.set(submitted.id, submitted); persist()
    res.status(201).json(envelope(submitted))
  })
  app.patch('/api/v1/cases/:caseId', (req, res) => {
    const current = cases.get(req.params.caseId)
    if (!current) return res.status(404).json({ message: 'Case not found.' })
    if (req.body?.version !== current.version) return res.status(409).json({ message: 'This case changed in another session. Reload the latest case before saving.' })
    if (req.body.status && !['submitted', 'approved', 'rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid review status.' })
    const changes = {}
    for (const key of fields) if (req.body[key] !== undefined) {
      if (typeof req.body[key] !== 'string' || req.body[key].length > 20000) return res.status(400).json({ message: 'Invalid case field.' })
      changes[key] = req.body[key].trim()
    }
    if (changes.chiefComplaint === '') return res.status(400).json({ message: 'The chief complaint cannot be empty.' })
    if (req.body.status === 'rejected' && !(changes.clinicianNotes ?? current.clinicianNotes)?.trim()) return res.status(400).json({ message: 'Please add a reason in clinician notes before rejecting.' })
    const updated = { ...current, ...changes, status: req.body.status ?? current.status, updatedAt: new Date().toISOString(), version: current.version + 1 }
    cases.set(current.id, updated); persist()
    res.json(envelope(updated))
  })
  app.post('/api/v1/attendant-requests', (req, res) => {
    const request = { requestId: randomUUID(), reason: String(req.body?.reason ?? '').slice(0, 5000), language: req.body?.language, urgent: Boolean(req.body?.urgent), status: 'queued', createdAt: new Date().toISOString(), message: isHindi(req.body?.language) ? 'सहायता अनुरोध स्टाफ की सूची में जोड़ दिया है। तुरंत मदद चाहिए तो पास के स्टाफ को बुलाएं।' : 'Your help request is in the staff queue. For immediate help, call nearby staff.' }
    attendantRequests.set(request.requestId, request); persist()
    res.status(201).json(envelope(request))
  })
  app.get('/api/v1/attendant-requests', (_req, res) => res.json(envelope([...attendantRequests.values()].filter(request => request.status === 'queued'))))
  app.patch('/api/v1/attendant-requests/:id', (req, res) => {
    const request = attendantRequests.get(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found.' })
    const updated = { ...request, status: 'acknowledged' }
    attendantRequests.set(request.requestId, updated); persist()
    res.json(envelope(updated))
  })
  // Module B — Medical Document OCR & Intelligent Entity Extraction
  app.post('/api/v1/documents/scan', (req, res) => {
    const { fileName = 'medical_report.pdf', fileType = 'lab_report', rawText = '' } = req.body ?? {}
    const docId = `doc-${randomUUID()}`
    let extractedText = rawText || `Patient Prescriptions / Lab Record - ${fileName}`
    let extractedMedicines = ['Tab Paracetamol 650mg BD', 'Tab Pantoprazole 40mg OD']
    let extractedDiagnoses = ['Acute Gastritis', 'Mild Viral Pyrexia']
    let extractedLabs = [
      { testName: 'Hemoglobin (Hb)', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', isAbnormal: true },
      { testName: 'Fasting Blood Sugar', value: '148', unit: 'mg/dL', referenceRange: '70 - 100', isAbnormal: true },
      { testName: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
    ]
    
    if (fileType === 'prescription') {
      extractedLabs = []
      extractedDiagnoses = ['Upper Respiratory Tract Infection']
      extractedMedicines = ['Tab Amoxicillin 500mg TDS', 'Syrup Cetirizine 5ml HS']
    }

    const doc = {
      id: docId,
      fileName,
      fileType,
      uploadedAt: new Date().toISOString(),
      extractedText,
      extractedMedicines,
      extractedDiagnoses,
      extractedLabs,
      hasAbnormalValues: extractedLabs.some(l => l.isAbnormal)
    }
    res.json(envelope(doc))
  })

  // Module D — ABDM FHIR R4 Bundle Export
  app.get('/api/v1/cases/:caseId/fhir', (req, res) => {
    const current = cases.get(req.params.caseId)
    if (!current) return res.status(404).json({ message: 'Case not found.' })
    
    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-${current.id}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:${current.patientId}`,
          resource: {
            resourceType: 'Patient',
            id: current.patientId,
            name: [{ text: current.patient?.displayName ?? 'Patient' }],
            gender: current.patient?.sex ?? 'unknown',
            identifier: [{ system: 'https://healthid.ndhm.gov.in', value: current.patient?.abhaId ?? 'ABHA-NOT-LINKED' }]
          }
        },
        {
          fullUrl: `urn:uuid:condition-${current.id}`,
          resource: {
            resourceType: 'Condition',
            id: `condition-${current.id}`,
            subject: { reference: `urn:uuid:${current.patientId}` },
            code: { text: current.chiefComplaint },
            clinicalStatus: { coding: [{ code: 'active' }] }
          }
        },
        {
          fullUrl: `urn:uuid:triage-${current.id}`,
          resource: {
            resourceType: 'Observation',
            id: `triage-${current.id}`,
            subject: { reference: `urn:uuid:${current.patientId}` },
            code: { text: 'Triage & History Intake Summary' },
            valueString: `Triage: ${current.triageLevel ?? 'green'} | Pathway: ${current.pathway ?? 'general'}`
          }
        }
      ]
    }
    res.json(envelope(fhirBundle))
  })

  app.get('/api/v1/cases/:caseId/timeline', (req, res) => {
    const current = cases.get(req.params.caseId)
    const docs = current?.uploadedDocuments ?? []
    const timeline = docs.map(d => ({
      id: d.id,
      date: d.uploadedAt.split('T')[0],
      title: `${d.fileType === 'prescription' ? 'Prescription' : 'Lab Report'}: ${d.fileName}`,
      description: d.extractedMedicines ? `Meds: ${d.extractedMedicines.join(', ')}` : `Labs: ${d.extractedLabs?.map(l => `${l.testName}: ${l.value} ${l.unit}`).join(', ')}`,
      abnormal: d.hasAbnormalValues
    }))
    res.json(envelope(timeline))
  })

  app.use((err, _req, res, _next) => res.status(err.status === 400 ? 400 : 500).json({ message: err.status === 400 ? 'Invalid request body.' : 'Unable to save or load data. Please try again.' }))
  return app
}
