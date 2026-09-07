export const appRoutes = {
  patientExperience: '/api/v1/patient-experience',
  patientLookup: '/api/v1/patients/lookup',
  patientRegistration: '/api/v1/patients',
  consent: '/api/v1/consents',
  caseDraft: '/api/v1/cases/draft',
  caseSubmit: '/api/v1/cases/submit',
  documents: '/api/v1/cases/:caseId/documents',
  ocrStatus: '/api/v1/documents/:documentId/ocr',
  timeline: '/api/v1/cases/:caseId/timeline',
  redFlags: '/api/v1/cases/:caseId/red-flags',
  symptomQuestions: '/api/v1/intake/questions',
  attendantRequests: '/api/v1/attendant-requests',
} as const
