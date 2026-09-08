# Camera records, triage interruption and follow-ups

The original `client/` + `server/` app and the independent frontend/backend repositories have the same new record and follow-up modules. The independent frontend also retains the newer login and Bhashini work.

## Camera and OCR

Enable prior-record permission during check-in. Open the camera on the records/review screen, show one page, capture, adjust the four corners, rotate if needed, then choose **Straighten & read**. Camera tracks stop immediately after capture, cancellation, changing workspaces, or leaving the screen. The page is mapped through a projective transform with bilinear sampling; pixels outside the four corners are removed. Automatic corner detection works best with light paper against a contrasting surface; always review its proposed corners.

No file picker, demo scan, fabricated drug list, lab result or diagnosis is used. The API requires camera image bytes and a registered patient with prior-record consent. Both original and straightened images remain available to the doctor. Images and text stay in the configured local data store unless a cloud OCR key is configured.

On macOS with Xcode command-line tools, Apple Vision provides local text recognition. First-use Swift compilation can be slower than subsequent scans. Local supported languages depend on the OS; this is not a promise of Hindi handwriting recognition. On other servers, or for multilingual handwriting recognition, configure `GOOGLE_CLOUD_VISION_API_KEY` in the backend environment and enable/bill the Google Cloud Vision API. Requests use `DOCUMENT_TEXT_DETECTION`. The cloud adapter has mock contract coverage; no live Google account was available in this session.

[Apple text recognition](https://developer.apple.com/documentation/vision/recognizing-text-in-images) and [Google handwriting OCR](https://docs.cloud.google.com/vision/docs/handwriting) describe the underlying APIs. OCR is transcription assistance: unclear text remains for review. It does not reliably determine a doctor's intended medicine from illegible strokes. The supplied medicine dictionary is used for candidate expansions, with ambiguous terms preserved for confirmation. No prescription or dosage is automatically inferred.

Dates are candidates, not automatic chronology: numeric day/month ambiguity is retained, DOB lines are excluded, and the patient/staff confirms the report/test date or leaves it unknown. The doctor can correct text and dates. The timeline sorts by the confirmed document date, oldest first; unknown dates are last and never use the capture date as a substitute. Mixed prescriptions, labs, discharge summaries and other pages may be scanned in any order.

## Follow-up SMS

Register the patient's mobile number and their follow-up SMS consent at new-patient registration. For existing records, the doctor can register the contact and consent in the follow-up panel. Accept the case, choose a future follow-up date and time in **Asia/Kolkata**, then save. Scheduling reads the patient record; callers cannot override the recipient on a reminder request.

The backend stores the reminder durably and checks due work on startup and every 60 seconds. The reminder is due at 09:00 India time on the follow-up day, or at the visit time if earlier. If scheduled later on that same day, it becomes due immediately. Run one backend process against a persistent `CAREX_DATA_PATH`, and keep it running on the follow-up day. Do not run multiple backend processes against the same JSON store. For multiple server replicas, replace this local store with a transactional job queue and shared database before deployment.

Set these backend-only environment variables:

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
# Or use a configured sender instead of MessagingServiceSid:
TWILIO_FROM=
```

Use a sender/service enabled for the patient's country. Complete the provider's destination/sender onboarding and use the clinic's approved message content where required. See the [Twilio Message API](https://www.twilio.com/docs/messaging/api/message-resource) for creation, delivery polling and status meanings.

Missing credentials show **Scheduled — SMS setup pending**, never “delivered.” Provider acceptance, sending and delivery are separate states. Rescheduling cancels pending reminders; revoking consent or rejecting the case stops pending delivery. Provider rate limits retry at most three times. A timeout or crash with uncertain provider acceptance is marked for staff review rather than automatically sending a possible duplicate. Reminders from a previous calendar day are marked missed, not sent late. Only a provider-confirmed status is shown as delivered. Tests use synthetic numbers and mocks; no SMS was sent to a person.

## Triage

The backend emits `stopQuestionnaire: true`, an empty `questions` array and `nextQuestion: null` for red/yellow triage. The patient screen becomes the staff-assistance screen; questionnaire speech, microphone and inactivity reminders stop. A visit identifier preserves the stop across answer edits, language/pathway changes and server restart. A new patient starts a new visit identifier.

The original app's triage policy is retained; the independent backend now also respects the existing 7–10 severity priority-review rule. This application threshold has not been clinically validated. [WHO's triage tool](https://www.who.int/tools/triage) distinguishes immediate red care and prompt yellow review; this implementation is not claimed to be a validated implementation of that entire tool. Clinician validation of the existing questionnaire/triage rules remains necessary.

The existing app is a local prototype with role-switch navigation, not authenticated clinician access. Deploy patient-image and follow-up routes only behind real patient/clinician authorization, HTTPS and protected storage.

## Verification

`npm test` in the backend runs API, date ambiguity, real-image-input contract, OCR-failure, document ownership/consent, persisted chronology, triage latch, scheduled SMS, rescheduling, missing-provider and uncertain-delivery checks. Browser tests include camera capture and track cleanup, document review, doctor's timeline, follow-up scheduling/cancellation and red/yellow interruption. Printed OCR is separately checked against a synthetic image; no clinical handwriting accuracy claim follows from those tests.
