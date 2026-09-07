import type { CaseDraft, Patient, TimelineEvent } from '../types/clinical'

export const mockPatient: Patient = {
  id: 'patient-riya-sharma',
  displayName: 'Riya Sharma',
  abhaId: '14-23-45-67-89-01',
  age: 42,
  sex: 'female',
  opd: 'OPD 04',
  verified: true,
}

export const mockPatients: Patient[] = [
  mockPatient,
  { id: 'patient-arjun-mehta', displayName: 'Arjun Mehta', abhaId: '14-23-45-67-89-02', age: 29, sex: 'male', opd: 'OPD 04', verified: true },
  { id: 'patient-meera-iyer', displayName: 'Meera Iyer', abhaId: '14-23-45-67-89-03', age: 61, sex: 'female', opd: 'OPD 04', verified: true },
  { id: 'patient-kabir-khan', displayName: 'Kabir Khan', abhaId: '14-23-45-67-89-04', age: 8, sex: 'male', opd: 'OPD 02', verified: true },
  { id: 'patient-ananya-das', displayName: 'Ananya Das', abhaId: '14-23-45-67-89-05', age: 35, sex: 'female', opd: 'OPD 01', verified: true },
  { id: 'patient-vikram-singh', displayName: 'Vikram Singh', abhaId: '14-23-45-67-89-06', age: 54, sex: 'male', opd: 'OPD 03', verified: true },
  { id: 'patient-sana-khan', displayName: 'Sana Khan', abhaId: '14-23-45-67-89-07', age: 26, sex: 'female', opd: 'OPD 04', verified: true },
  { id: 'patient-rohan-patel', displayName: 'Rohan Patel', abhaId: '14-23-45-67-89-08', age: 47, sex: 'male', opd: 'OPD 05', verified: true },
  { id: 'patient-lata-nair', displayName: 'Lata Nair', abhaId: '14-23-45-67-89-09', age: 68, sex: 'female', opd: 'AYUSH 02', verified: true },
  { id: 'patient-dev-kumar', displayName: 'Dev Kumar', abhaId: '14-23-45-67-89-10', age: 19, sex: 'male', opd: 'OPD 01', verified: true },
]

export const mockCase: CaseDraft = {
  id: 'AIIA-OPD-240819',
  patientId: mockPatient.id,
  status: 'draft',
  chiefComplaint: 'Chest pain for 2 days, worsens on exertion.',
  hpi: 'Patient reports central chest discomfort with breathlessness. Onset was gradual.',
  pastHistory: 'Type 2 diabetes mellitus · diagnosed 2021. No prior cardiac admission.',
  drugAndAllergy: 'Metformin 500 mg BD. No known drug allergies reported.',
  familyHistory: 'Father with hypertension.',
  ros: 'No fever, cough, syncope or pedal edema reported.',
}

export const mockTimeline: TimelineEvent[] = [
  { id: 'event-1', date: '12 Aug 2024', title: 'City Hospital · Discharge summary', description: 'Acute gastritis; advised diet modification.' },
  { id: 'event-2', date: '04 Jan 2024', title: 'Routine blood panel', description: 'HbA1c 8.4% · fasting blood sugar elevated.', abnormal: true },
  { id: 'event-3', date: '18 Nov 2023', title: 'Ayurveda OPD · AIIA', description: 'Started supportive Dinacharya protocol.' },
]
