# Swasthya Setu (Medikiosk) - Complete End-to-End System & Architecture Execution Blueprint (`flow.md`)

Welcome to the **Swasthya Setu Complete System Architecture & Technical Blueprint**. This document is specifically structured for **Software Architects, System Designers, Engineering Leads, and Security Compliance Officers**. It outlines every component, data flow, API contract, state transition, security mechanism, and database schema in the Swasthya Setu AI Medikiosk ecosystem.

---

## 🏗️ 1. High-Level System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (React 18 + Vite + TS)                    │
│                                                                                          │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────────────┐  │
│  │ Patient Kiosk UI      │  │ Gesture & Touch Controls│ │ Doctor / Admin Dashboard    │  │
│  │ (PatientExperience)   │  │ (Pain Body Map)       │  │ (AdminExperience)           │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────────────┬──────────────┘  │
│              │                          │                             │                 │
│              └──────────────────────────┼─────────────────────────────┘                 │
│                                         │ HTTP REST / WebSockets                        │
└─────────────────────────────────────────┼───────────────────────────────────────────────┘
                                          │
┌─────────────────────────────────────────┼───────────────────────────────────────────────┐
│                                         ▼                                               │
│                                   BACKEND ENGINE (Node.js + Express)                    │
│                                                                                          │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────────────────┐  │
│  │ Intake & Triage Core  │  │ JSON Rules Engine     │  │ Bhashini AI Proxy Service   │  │
│  │ (analyseIntake)       │  │ (red_flag_rules.json) │  │ (bhashiniService.js)        │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────────────┬──────────────┘  │
│              │                          │                             │                 │
│              ├──────────────────────────┴─────────────────────────────┤                 │
│              │                                                        │                 │
│  ┌───────────▼───────────┐  ┌───────────────────────┐  ┌──────────────▼──────────────┐  │
│  │ Document OCR Pipeline │  │ ABDM FHIR R4 Generator│  │ Follow-up SMS Queue         │  │
│  │ (Tesseract.js Engine) │  │ (fhirExporter.js)     │  │ (service.js / Twilio)       │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────────────────┘  │
│                                                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ PERSISTENCE LAYER: In-Memory Maps (patients, cases, consents) ──> .data/carex.json│  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 2. Core Architectural Pillars

1. **Bi-directional Multilingual Voice (Bhashini AI)**: Speech-to-Text (ASR), Text-to-Speech (TTS), and Neural Machine Translation (NMT) across Hindi, English, and 22 Indian scheduled languages.
2. **Comprehensive Hinglish & Regional Symptom NLP Engine**: Intelligent symptom pattern mapping across 32+ organ systems including natural colloquial Hinglish/Hindi terms (e.g., `taang`/`tang`/`pair` $\rightarrow$ leg, `haath`/`hath` $\rightarrow$ arm, `kandhe` $\rightarrow$ shoulder, `aankho` $\rightarrow$ eye, `kulha` $\rightarrow$ hip).
3. **Deterministic Rules Engine (`red_flag_rules.json`)**: 200 Tier-1 emergency clinical condition rules providing zero-latency red-flag triage detection.
4. **Instant Red-Flag Interruption & 20-Second Screen Flashing Auto-Reset**: Halts intake immediately on emergency detection, suppresses all demographic/question screens, flashes a full-screen red emergency display, dispatches staff alerts, and auto-resets back to start after 20 seconds.
5. **Admin Patient Management Queue**: Allows staff to view submitted patient visits in real-time with one-click **Approve** or **Decline** options.
6. **Hybrid Ayush (Tridosha) + Allopathic Triage Engine**: Calculates Vata-Pitta-Kapha Doshic imbalance alongside standard clinical severity metrics.
7. **Smart OCR Document Processing**: Extracts BP, SpO2, Heart Rate, and medication history from past prescriptions with human-in-the-loop validation.
8. **ABDM FHIR R4 Compliance**: Standardized JSON healthcare bundle exporter (`Bundle`, `Patient`, `Condition`, `Observation`, `Encounter`).

---

## 🚪 3. Application Entry Points & File Mapping

### Backend Express Server (`server/`)
- **Primary Initialization**: [`server/index.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/index.js) $\rightarrow$ [`server/app.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/app.js)
- **Entry Function**: `createApp({ storagePath, ocr, sms, now })`
- **Key Modules**:
  - [`server/intake.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/intake.js): Clinical triage matcher, 32+ organ system symptom catalog with expanded Hinglish aliases, and dynamic questioning.
  - [`server/red_flag_rules.json`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/red_flag_rules.json): 200 Tier-1 emergency clinical condition rules.
  - [`server/triage-stop.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/triage-stop.js): Red-flag triage stop contract handler.
  - [`server/bhashiniService.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/bhashiniService.js): 15 Bhashini AI task handlers.
  - [`server/documents/ocr.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/documents/ocr.js): Tesseract OCR image text extractor and vitals parser.
  - [`server/followups/service.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/followups/service.js): Persistent SMS follow-up scheduler.

### Frontend React Client (`client/`)
- **Primary Entry**: [`client/src/main.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/main.tsx) $\rightarrow$ [`client/src/app/App.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/app/App.tsx) (Branded top-left logo: **Swasthya Setu**).
- **Key Components**:
  - [`client/src/features/patient/PatientExperience.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/features/patient/PatientExperience.tsx): Main kiosk intake interface with 20s full-screen emergency alert modal.
  - [`client/src/features/admin/AdminExperience.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/features/admin/AdminExperience.tsx): Staff & admin dashboard featuring live Patient Queue with Approve/Decline actions and help requests.
  - [`client/src/shared/hooks/useKioskVoice.ts`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/shared/hooks/useKioskVoice.ts): Dual-engine voice hook (Bhashini + Web Speech API).
  - [`client/src/components/PainBodyMap.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/components/PainBodyMap.tsx): Interactive anatomical touch map.
  - [`client/src/features/doctor/DoctorExperience.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/features/doctor/DoctorExperience.tsx): Clinician OPD triage dashboard.

---

## 🗺️ 4. End-to-End Execution Sequence Flows

### Flow 1: Bi-Directional Bhashini AI Voice & Answer Processing
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Kiosk Question  ├──────►│ useKioskVoice   ├──────►│ Bhashini TTS    ├──────►│ Audio Playback  │
│ (Hindi/English) │       │ Hook            │       │ Proxy Endpoint  │       │ (Out Loud)      │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Patient Voice   ├──────►│ Bhashini ASR    ├──────►│ Indic Raw Text  ├──────►│ Bhashini NMT    │
│ Input (Audio)   │       │ Proxy Endpoint  │       │ (Hindi/Regional)│       │ Translation     │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                                                       │
                                                                                       ▼
                                                                              ┌─────────────────┐
                                                                              │ Standardized    │
                                                                              │ English Medical │
                                                                              │ Text            │
                                                                              └─────────────────┘
```

1. **Prompt Speech Synthesis**: Question text is rendered to spoken audio via `bhashiniTTS`.
2. **Patient Answer Processing**: Voice audio captured by `useKioskVoice` is converted to raw Indic text via `bhashiniASR`.
3. **NMT Translation**: `processUserAnswerWithBhashini()` in [`server/intake.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/intake.js) translates Indic answers into English for pattern matching while preserving original regional text for UI display.

---

### Flow 2: 200-Rule Red-Flag Emergency Triage Interruption & 20-Second Auto-Reset
```
Patient Complaint / Answer Submitted
                 │
                 ▼
      analyseIntake() in server/intake.js
                 │
                 ├──────► Matches against 200 Tier-1 Emergency Conditions in server/red_flag_rules.json
                 │        (Cardiac Arrest, Stroke, Airway Obstruction, Hemorrhage, Anaphylaxis, etc.)
                 │
                 ▼
      stopForTriage() in server/triage-stop.js
                 │
  ┌──────────────┴────────────────────────────┐
  ▼                                           ▼
[RED FLAG IDENTIFIED]                      [ROUTINE / GREEN]
 ├── stopQuestionnaire: true                ├── Continues intake questionnaire
 ├── questions: [] (Halts all intake)       └── Moves to Patient Registration
 ├── Full screen flashes RED alert banner
 ├── Suppresses name/age registration screens
 ├── Auto-invokes requestAttendant() (Notifies Admin/Staff)
 ├── Spoken audio & UI instruct: "Meet hospital staff immediately!"
 └── 20-Second Timer Starts ──> Auto-redirects to Start Screen for next patient
```

---

### Flow 3: Dynamic Adaptive Questioning & 32+ Organ System Coverage
```
User Response ──> detectSymptoms() ──> generateDynamicAdaptiveQuestions()
                                           ├── Hinglish Matcher (taang, haath, kandhe, pairo, etc.)
                                           ├── Pain Triggers (Movement, breathing)
                                           ├── Radiation (Arm, leg, back)
                                           ├── Systemic Flags (Shivering, phlegm color)
                                           └── Ayush Routine (Energy, digestion)
```

- **Supported Organ Systems**: Brain/Head, Eyes, Ears, Nose, Mouth/Teeth, Throat, Neck, Chest, Lungs, Heart, Abdomen, Back/Spine, Pelvis, Urinary, Male/Female Reproductive, Shoulder, Arm/Elbow/Hand, Hip, Leg/Knee/Foot, Skin, Hair/Nails, Bones/Joints, Muscles, Blood/Lymph, Endocrine, Mental Health, General Whole Body.

---

### Flow 4: Admin Queue Patient Management (Approve / Decline)
```
Patient Submission ──> POST /api/v1/cases/submit
                              │
                              ▼
                Admin Queue (AdminExperience.tsx)
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
       [Click: Approve]             [Click: Decline]
                │                           │
                ▼                           ▼
    PATCH /api/v1/cases/:id     PATCH /api/v1/cases/:id
     status: "approved"          status: "rejected"
```

---

### Flow 5: Smart Camera OCR Prescription Scanner
```
Camera Frame (DocumentScanner.tsx)
                 │
                 ▼
HTTP POST /api/v1/documents/scan ──> mountDocuments() in server/documents/routes.js
                                               │
                                               ▼
                                     createOcr().extract() in server/documents/ocr.js
                                               ├── Image Normalization & Tesseract OCR Engine
                                               ├── Regex Vitals Parser (BP, Heart Rate, SpO2)
                                               └── Returns JSON with status: 'needs_review'
                                                       │
                                                       ▼
                                        Human Review & Verification on Kiosk Screen
```

---

### Flow 6: ABDM FHIR R4 Serialization & OPD Token Receipt
```
Submit Visit Case ──> submitCase() in server/app.js
                            ├── Serializes ABDM FHIR R4 Bundle
                            ├── Generates Queue Token (e.g. OPD-104)
                            ├── Enqueues SMS Follow-up Reminders (3-day, 7-day, 14-day)
                            └── Renders Token Receipt Modal (TokenReceiptModal.tsx)
```

---

## 🔗 5. Complete API Endpoint Specifications

| Endpoint URL | HTTP Method | Request Body / Params | Response Payload | Description |
| :--- | :---: | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | None | `{ status: 'ok', symptomGroups: 32 }` | System health check endpoint |
| `/api/v1/patient-experience` | `GET` | None | `PatientExperienceConfig` JSON | Returns kiosk branding, steps, consent options |
| `/api/v1/body-map` | `GET` | None | `BodyLocation[]` JSON | Returns clickable body regions for Pain Map |
| `/api/v1/intake/questions` | `POST` | `{ complaint, answers, language, sessionId }` | `IntakeAnalysis` JSON | Analyzes complaint, matches red flags, returns questions |
| `/api/v1/patients/lookup` | `GET` | `?identifier=14-23...&method=abha` | `Patient` JSON | Searches existing patient record by ABHA or Aadhaar |
| `/api/v1/patients` | `POST` | `{ displayName, age, sex, mobile }` | `Patient` JSON | Registers new kiosk patient |
| `/api/v1/consents` | `POST` | `{ patientId, purposes, language }` | `ConsentRecord` JSON | Saves ABDM patient consent choices |
| `/api/v1/documents/scan` | `POST` | `{ imageBase64, patientId }` | `UploadedDocument` JSON | Uploads image and returns parsed OCR vitals/meds |
| `/api/v1/cases/submit` | `POST` | `{ patientId, chiefComplaint, answers, ... }` | `CaseDraft` JSON | Finalizes OPD case, assigns token, exports FHIR R4 |
| `/api/v1/cases` | `GET` | None | `CaseDraft[]` JSON | Returns doctor queue sorted by urgency |
| `/api/v1/cases/:id` | `PATCH` | `{ status: 'approved' \| 'rejected' }` | `CaseDraft` JSON | Admin endpoint to approve or decline patient cases |
| `/api/v1/attendant-requests` | `GET` | None | `HelpRequest[]` JSON | Admin queue for pending patient help requests |
| `/api/v1/attendant/request` | `POST` | `{ message, language, isEmergency }` | `{ success: true, message }` | Dispatches staff help request to admin queue |
| `/api/v1/bhashini/pipeline` | `POST` | `{ task: 'asr' \| 'tts' \| 'translation', ... }` | `BhashiniResponse` JSON | Server proxy endpoint for Bhashini AI tasks |

---

## 💾 6. Database & In-Memory Data Models

All state is stored in high-speed in-memory JS Maps backed by persistent JSON storage (`.data/carex.json`):

```json
{
  "patients": [
    ["patient-riya-sharma", {
      "id": "patient-riya-sharma",
      "displayName": "Riya Sharma",
      "abhaId": "14-23-45-67-89-01",
      "age": 42,
      "sex": "female",
      "mobile": "+919876543210",
      "opd": "OPD 04"
    }]
  ],
  "cases": [
    ["case-101", {
      "id": "case-101",
      "patientId": "patient-riya-sharma",
      "token": "OPD-104",
      "chiefComplaint": "Headache and fever",
      "triageLevel": "green",
      "status": "approved",
      "tridosha": { "vata": 30, "pitta": 50, "kapha": 20, "dominant": "Pitta" },
      "fhirBundle": { "resourceType": "Bundle", "type": "collection" }
    }]
  ]
}
```

---

## 🤖 7. Full Session AI Code Audit Log

| File Path | Action | Description of Technical Changes |
| :--- | :---: | :--- |
| [`server/red_flag_rules.json`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/red_flag_rules.json) | **NEW** | Added 200 Tier-1 Emergency Conditions with English NLP keywords and Hindi/Hinglish triggers. |
| [`server/bhashiniService.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/bhashiniService.js) | **NEW** | Server-side proxy implementation for all 15 Bhashini AI tasks (ASR, TTS, NMT, Transliteration). |
| [`server/bhashiniConfig.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/bhashiniConfig.js) | **NEW** | Central configuration registry for Bhashini pipeline IDs and endpoints. |
| [`server/bhashini.test.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/bhashini.test.js) | **NEW** | Unit test suite covering Bhashini API requests and fallback handlers. |
| [`client/src/services/bhashiniService.ts`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/services/bhashiniService.ts) | **NEW** | TypeScript service layer connecting frontend voice components to backend Bhashini proxy endpoints. |
| [`client/src/main.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/main.tsx) | **MODIFIED** | Updated top-left header branding title to **Swasthya Setu**. |
| [`client/src/components/BrandLogo.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/components/BrandLogo.tsx) | **MODIFIED** | Updated brand logo element and alt text to **Swasthya Setu**. |
| [`server/app.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/app.js) | **MODIFIED** | Added Bhashini routes, body map endpoints, consent verification, case PATCH endpoint, and triage persistence. |
| [`server/intake.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/intake.js) | **MODIFIED** | Integrated `red_flag_rules.json` matching, Bhashini translation, 32+ organ system catalog, and expanded Hinglish aliases (`taang`, `haath`, `kandhe`, `aankho`, `kulha`). |
| [`server/triage-stop.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/triage-stop.js) | **MODIFIED** | Updated triage stop contract logic for red flag emergency alerts. |
| [`client/src/features/patient/PatientExperience.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/features/patient/PatientExperience.tsx) | **MODIFIED** | Implemented full-screen flashing red emergency alert modal, auto staff notification, question/demographics suppression, and 20s auto-reset countdown timer. |
| [`client/src/features/admin/AdminExperience.tsx`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/features/admin/AdminExperience.tsx) | **MODIFIED** | Added Patient Queue list with **Approve** and **Decline** action buttons. |
| [`client/src/index.css`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/client/src/index.css) | **MODIFIED** | Added high-contrast CSS styling for full-screen emergency red alert. |
| [`server/api.test.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/api.test.js) | **MODIFIED** | Updated test assertions for intake option validation. |
| [`server/records-followups.test.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/records-followups.test.js) | **MODIFIED** | Updated yellow triage test cases. |
| [`decision.md`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/decision.md) | **UPDATED** | Documented ADR-001 through ADR-010. |
| [`flow.md`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/flow.md) | **UPDATED** | Completely finalized into comprehensive System Architecture & Technical Blueprint. |
