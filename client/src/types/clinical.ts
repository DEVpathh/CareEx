export type PatientLookupMethod = 'abha' | 'aadhaar' | 'manual'
export type TriageLevel = 'red' | 'yellow' | 'green'

export interface Patient {
  id: string
  displayName: string
  abhaId?: string
  age: number
  sex: 'female' | 'male' | 'other'
  opd: string
  verified: boolean
}

export interface ConsentRecord {
  patientId: string
  purposes: {
    casePreparation: boolean
    priorRecords: boolean
    careTeamSharing: boolean
  }
  language: string
  capturedAt: string
}

export interface TridoshaScore {
  vata: number
  pitta: number
  kapha: number
  dominant: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshaja'
  notes?: string
}

export interface DashavidhaMatrix {
  prakriti: string
  vikriti: string
  agni: string
  koshtha: string
  sara: string
  samhanana: string
  pramana: string
  satmya: string
  sattva: string
  aharaShakti: string
  vyayamaShakti: string
  vaya: string
}

export interface LabExtraction {
  testName: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
}

export interface UploadedDocument {
  id: string
  fileName: string
  fileType: 'prescription' | 'lab_report' | 'discharge_summary'
  uploadedAt: string
  extractedText: string
  extractedMedicines?: string[]
  extractedDiagnoses?: string[]
  extractedLabs?: LabExtraction[]
  hasAbnormalValues?: boolean
}

export interface CaseDraft {
  id: string
  patientId: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  chiefComplaint: string
  hpi: string
  pastHistory: string
  drugAndAllergy: string
  familyHistory: string
  ros: string
  token?: string
  patient?: Patient
  answers?: Record<string, string>
  questions?: IntakeQuestion[]
  language?: string
  pathway?: 'general' | 'ayush'
  urgent?: boolean
  urgentReasons?: string[]
  triageLevel?: TriageLevel
  tridosha?: TridoshaScore
  dashavidha?: DashavidhaMatrix
  uploadedDocuments?: UploadedDocument[]
  clinicianNotes?: string
  createdAt?: string
  updatedAt?: string
  version?: number
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  abnormal?: boolean
}

export interface ApiEnvelope<T> {
  data: T
  requestId: string
  timestamp: string
}

export interface IdentificationOption {
  id: PatientLookupMethod
  label: string
  helper: string
  voiceAliases: string[]
}

export interface PatientExperienceConfig {
  brand: { name: string; organisation: string }
  languages: Array<{ label: string; locale: string }>
  steps: string[]
  identificationOptions: IdentificationOption[]
  consentPurposes: Array<{ id: keyof ConsentRecord['purposes']; label: string }>
  welcome: { eyebrow: string; title: string; description: string; prompt: string }
}

export interface IntakeQuestion {
  id: string
  text: string
  type: 'text' | 'number' | 'choice'
  options?: Array<{ value: string; label: string }>
  redFlagAnswers?: string[]
  min?: number
  max?: number
}

export interface IntakeAnalysis {
  symptoms: string[]
  summary: string
  questions: IntakeQuestion[]
  urgent: boolean
  urgentReasons: string[]
  triageLevel?: TriageLevel
  tridosha?: TridoshaScore
  dashavidha?: DashavidhaMatrix
  symptomLabels: string[]
  inferredAnswers: Record<string, string>
  complete: boolean
  engine: string
}
