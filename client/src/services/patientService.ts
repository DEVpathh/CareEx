import { appRoutes } from '../app/app.routes'
import type { IntakeAnalysis, Patient, PatientExperienceConfig, PatientLookupMethod } from '../types/clinical'
import { apiRequest } from './apiClient'

export function lookupPatient(identifier: string, method: PatientLookupMethod): Promise<Patient> {
  return apiRequest<Patient>(`${appRoutes.patientLookup}?identifier=${encodeURIComponent(identifier)}&method=${method}`)
}

export function getPatientExperience(): Promise<PatientExperienceConfig> {
  return apiRequest<PatientExperienceConfig>(appRoutes.patientExperience)
}

export function analyseComplaint(complaint: string, pathway: 'general' | 'ayush', language: string, answers: Record<string, string> = {}): Promise<IntakeAnalysis> {
  return apiRequest<IntakeAnalysis>(appRoutes.symptomQuestions, {
    method: 'POST',
    body: JSON.stringify({ complaint, pathway, language, answers }),
  })
}

export function registerPatient(details: { displayName: string; age: number; sex: Patient['sex'] }): Promise<Patient> {
  return apiRequest<Patient>(appRoutes.patientRegistration, { method: 'POST', body: JSON.stringify(details) })
}

export function requestAttendant(reason: string, language: string, urgent = false): Promise<{ requestId: string; status: string; message: string }> {
  return apiRequest(appRoutes.attendantRequests, {
    method: 'POST',
    body: JSON.stringify({ reason, language, urgent }),
  })
}

export function scanDocument(fileName: string, fileType: 'prescription' | 'lab_report' | 'discharge_summary', rawText?: string) {
  return apiRequest('/api/v1/documents/scan', {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType, rawText }),
  })
}
