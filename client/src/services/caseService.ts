import { appRoutes } from '../app/app.routes'
import type { CaseDraft, ConsentRecord, TimelineEvent } from '../types/clinical'
import { apiRequest } from './apiClient'

export function getCaseDraft(): Promise<CaseDraft> {
  return apiRequest<CaseDraft>(appRoutes.caseDraft)
}

export function getTimeline(caseId: string): Promise<TimelineEvent[]> {
  return apiRequest<TimelineEvent[]>(appRoutes.timeline.replace(':caseId', caseId))
}

export function saveConsent(consent: ConsentRecord): Promise<ConsentRecord> {
  return apiRequest<ConsentRecord>(appRoutes.consent, { method: 'POST', body: JSON.stringify(consent) })
}

export function submitCase(caseDraft: CaseDraft): Promise<CaseDraft> {
  return apiRequest<CaseDraft>(appRoutes.caseSubmit, { method: 'POST', body: JSON.stringify(caseDraft) })
}

export function getCases(): Promise<CaseDraft[]> {
  return apiRequest<CaseDraft[]>('/api/v1/cases')
}

export function updateCase(caseId: string, update: Partial<CaseDraft>): Promise<CaseDraft> {
  return apiRequest<CaseDraft>(`/api/v1/cases/${encodeURIComponent(caseId)}`, { method: 'PATCH', body: JSON.stringify(update) })
}

export function getFhirBundle(caseId: string): Promise<any> {
  return apiRequest(`/api/v1/cases/${encodeURIComponent(caseId)}/fhir`)
}
