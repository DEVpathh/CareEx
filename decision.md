# CareEx Architecture & Implementation Decision Log (`decision.md`)

This document serves as the official **Architectural Decision Record (ADR)** and **Consideration Log** for the CareEx (Medikiosk) platform. It documents past architectural and feature decisions, current in-progress considerations, and mandatory guidelines for future code modifications.

---

## 📌 Project Overview

**CareEx / Medikiosk** is an intelligent, voice-guided, multilingual healthcare kiosk and clinical intake application. It bridges the gap between patients (especially in rural/semi-urban settings) and clinicians by offering:
- Multi-modal patient intake (Touch pain map, speech/Bhashini voice assistant, OCR document scanning).
- Smart Triage (Ayush/Tridosha + Conventional clinical triage).
- ABDM FHIR R4 compliant health record exports.
- Follow-up scheduling and token receipt generation.

---

## 📜 Considerations & Decisions Till Now

### ADR-001: Separation of Client & Server Architecture
- **Date**: Sep 2026
- **Context**: The project began as a combined codebase which grew complex with mixed concerns (frontend rendering vs backend OCR/AI processing).
- **Decision**: Cleanly split into `client/` (React, TypeScript, Vite, Tailwind/CSS) and `server/` (Node.js, Express, Jest tests).
- **Considerations**:
  - Clear boundary for testing (`server/*.test.js`).
  - Frontend can be deployed to CDN/static hosts; backend handles heavier tasks (OCR processing, third-party API integration, FHIR generation).

---

### ADR-002: Camera OCR & Per-Entry Document Review Pipeline
- **Date**: Sep 2026
- **Context**: Manual typing of previous prescriptions/lab reports at a kiosk is error-prone and slow.
- **Decision**: Integrated image capture & Tesseract.js / OCR extraction pipeline in `server/documents/ocr.js` paired with interactive frontend verification.
- **Considerations**:
  - Raw OCR text is parsed into structured fields (Vitals, Medications, Diagnoses, Dates).
  - Implemented human-in-the-loop review interface so patients/attendants can correct extraction mistakes before final submission.
  - Added support for camera video stream frame grabbing directly in kiosk mode.

---

### ADR-003: Multilingual Voice Intake with Bhashini Integration
- **Date**: Sep 2026
- **Context**: Kiosk users speak diverse regional languages (Hindi, Marathi, Tamil, etc.) and may have low text literacy.
- **Decision**: Implemented `bhashiniService.js` / `bhashiniService.ts` for Indian language NMT/STT/TTS APIs, integrated with `useKioskVoice.ts` hook.
- **Considerations & Fallbacks**:
  - Third-party API dependency: Bhashini API calls require valid credentials and active internet.
  - Fallback logic: If Bhashini endpoints are unavailable, fallback seamlessly to Web Speech API (`window.speechSynthesis`) or visual step-by-step guidance without crashing the kiosk experience.

---

### ADR-008: Bi-Directional Bhashini Integration (Answer Translation & ASR)
- **Date**: Sep 2026
- **Context**: User answers to kiosk intake questions (spoken audio or typed text in Indic languages) were previously not being translated into English, causing potential misalignment in clinical symptom matching and triage.
- **Decision**: Connected Bhashini services (`bhashiniTranslate` & `processUserAnswerWithBhashini`) directly into the backend intake analysis pipeline (`server/intake.js`).
- **Considerations**:
  - Every user answer input now passes through Bhashini translation before clinical symptom pattern matching, Tridosha calculation, and FHIR export.
  - Preserves original Indic text for patient review while providing standardized English clinical translation for clinicians.

---

### ADR-009: Dynamic LLM-Driven Adaptive Question Generation & Full Body Part Coverage
- **Date**: Sep 2026
- **Context**: Static question sequences do not react contextually to intermediate user answers, and limited symptom catalogs miss niche body region complaints.
- **Decision**: Implemented `generateDynamicAdaptiveQuestions()` in `server/intake.js`. Evaluates prior user answers dynamically (severity, radiation, pain triggers, systemic symptoms) to generate contextual follow-up questions, backed by a 32+ body part symptom catalog.
- **Considerations**:
  - Dynamically synthesizes follow-up questions based specifically on the user's previous answers.
  - Covers all anatomical organ systems and body parts (head to toe).
  - Maintained 100% test suite pass rate across existing unit tests.

---

### ADR-004: Interactive Touch Pain Map & Gesture Controls
- **Date**: Sep 2026
- **Context**: Explaining pain location via text dropdowns can be confusing for patients.
- **Decision**: Built interactive anatomical pain map component in `PatientExperience.tsx`.
- **Considerations**:
  - Touch-first UX designed specifically for kiosk touchscreens.
  - Multi-select intensity heatmaps linked directly to triage decision engines.

---

### ADR-005: ABDM & FHIR R4 Health Record Standardization
- **Date**: Sep 2026
- **Context**: Interoperability with India's Ayushman Bharat Digital Mission (ABDM) ecosystem.
- **Decision**: Standardized all patient session summary outputs into ABDM-compliant FHIR R4 JSON bundles (`Bundle`, `Patient`, `Observation`, `Condition`, `Encounter`).
- **Considerations**:
  - Enables seamless integration with electronic health record (EHR) systems and ABHA (Ayushman Bharat Health Account) networks.

---

### ADR-006: Hybrid Ayush (Tridosha Engine) + Conventional Triage
- **Date**: Sep 2026
- **Context**: Holistic healthcare assessment incorporating traditional medicine metrics alongside standard emergency triage.
- **Decision**: Embedded `Tridosha Engine` (Vata, Pitta, Kapha assessment) into the intake algorithm in `server/intake.js`.
- **Considerations**:
  - Calculates symptom vectors to recommend appropriate department routing (General Medicine, Ayush, Emergency).

---

## 🔍 In-Progress & Active Considerations

1. **Robust Bhashini Configuration Management (`bhashiniConfig.js`)**:
   - Ensuring API keys and Pipeline IDs are configurable via `.env` files without hardcoding credentials in git repositories.

2. **Offline Kiosk Capabilities**:
   - Considering service worker caching and local SQLite/PouchDB intake queues when network drops occur.

3. **Performance Optimization for Kiosk Hardware**:
   - Kiosk terminals often run on low-power hardware. Heavy canvas rendering or unoptimized speech synthesis loops must be throttled.

---

## 🛠️ Guidelines & Checklist for Further Code Changes

When making future changes to this codebase, developers/agents **must adhere** to the following considerations:

### 1. Backend (`server/`) Modifications Checklist
- [ ] **Test Coverage**: Run `npm test` inside `server/` whenever route handlers (`app.js`, `intake.js`) or parsers are updated. Ensure unit tests (`api.test.js`, `bhashini.test.js`, `records-followups.test.js`) pass.
- [ ] **Error Handling**: API endpoints must return structured JSON errors (`{ success: false, error: "..." }`) and never unhandled exceptions.
- [ ] **Data Sanitization**: Sanitize all OCR and user inputs before passing to database or downstream prompt engines.

### 2. Frontend (`client/`) Modifications Checklist
- [ ] **Kiosk Mode Compatibility**: Ensure all visual components (modals, buttons, pain map) are touch-friendly with large hit targets (min `48px`).
- [ ] **Voice Accessibility**: Any newly added intake step must be registered with `useKioskVoice` so the voice assistant can read prompt texts out loud.
- [ ] **Responsive & Modern UI**: Follow modern styling guidelines using custom CSS tokens and high contrast for accessibility.

### 3. Data Privacy & Compliance
- [ ] Do not output personally identifiable information (PII) to raw logs.
- [ ] Keep ABDM/FHIR resource mapping up to date with official specifications.

### ADR-010: JSON Rules Engine Integration (`red_flag_rules.json`) & 10-Second Auto-Reset Red Flag Screen
- **Date**: Sep 2026
- **Context**: Critical emergency symptoms (cardiac crushing pain, stroke/paralysis, severe respiratory distress, profuse bleeding, anaphylaxis) require structured pattern matching and an automatic kiosk reset workflow so subsequent patients are not blocked.
- **Decision**: Created [`server/red_flag_rules.json`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/red_flag_rules.json) and integrated it into `analyseIntake()` in [`server/intake.js`](file:///c:/Users/DELL/OneDrive/Desktop/sih/CareEx/server/intake.js). When a red flag is identified:
  1. Questionnaire stops immediately (`stopQuestionnaire: true`, `questions: []`).
  2. Display transitions to high-visibility bold red screen (`.emergency-screen`).
  3. Automatic background alert is dispatched to hospital admin/staff (`requestAttendant()`).
  4. Audio and visual alerts instruct the patient to meet staff members immediately.
  5. A 10-second live countdown timer is displayed; upon expiry, the kiosk automatically resets to the initial start screen for the next patient.
- **Considerations**:
  - Eliminates delay in emergency triage.
  - Ensures kiosk automatically returns to fresh start state after 10 seconds.

---

## 📝 Decision Change Log

| Date | Author | Target Component | Summary of Change & Reason |
| :--- | :--- | :--- | :--- |
| 2026-09-12 | AI Assistant / Developer | Project Root (`decision.md`) | Initialized Architectural Decision Record (ADR) log documenting system decisions and future modification guidelines. |
| 2026-09-12 | AI Assistant / Developer | `intake.js`, `PatientExperience.tsx`, `triage-stop.js` | Added ADR-010: Removed 0-10 rating scale and implemented immediate bold red screen interruption for red-flag triage patients with automatic admin alert. |

