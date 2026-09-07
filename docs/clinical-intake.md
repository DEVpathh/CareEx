# Intake behaviour and review notes

CareX uses an explicit, bilingual adaptive questionnaire (`server/intake.js`). It does not currently call an external language model, diagnose a disease, prescribe treatment, or claim clinical validation. The previous four-symptom matcher has been expanded to 23 symptom groups with English, Hindi and common Hinglish aliases.

The engine recognizes multiple concerns, extracts simple duration statements, keeps canonical answer values when languages change, adds follow-ups for symptoms mentioned in associated-symptom answers, and branches on phlegm and hydration answers. Unknown concerns ask for clarification. AYUSH adds digestion and routine questions after the same symptom and urgency questions. Warning responses remain attached to the submitted case; dismissing or changing screens does not erase them.

The following public NHS references informed the warning-sign prompts, reviewed on 6 September 2026. The prompts are original concise intake questions, not a reproduction of clinical guidelines or an exhaustive triage protocol.

- [Chest pain](https://www.nhs.uk/conditions/chest-pain/): associated breathing difficulty, sweating and radiating pain.
- [Headaches](https://www.nhs.uk/symptoms/headaches/): sudden severe pain and neurological symptoms.
- [Shortness of breath](https://www.nhs.uk/conditions/shortness-of-breath/): severe respiratory distress.
- [Stomach ache](https://www.nhs.uk/symptoms/stomach-ache/): acute severe pain and bleeding.
- [Dehydration](https://www.nhs.uk/conditions/dehydration/): reduced urination, confusion and difficulty staying awake.
- [Diarrhoea and vomiting](https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/): fluid tolerance and bleeding concerns.
- [Joint pain](https://www.nhs.uk/symptoms/joint-pain/): hot swollen joints and inability to bear weight.
- [Anaphylaxis](https://www.nhs.uk/conditions/anaphylaxis/): swelling and breathing/swallowing difficulty.
- [Diabetic ketoacidosis](https://www.nhs.uk/conditions/diabetic-ketoacidosis/): vomiting, altered alertness and abnormal breathing.
- [Eye pain](https://www.nhs.uk/symptoms/eye-pain/): vision loss and severe eye pain.
- [Dental abscess](https://www.nhs.uk/conditions/dental-abscess/): facial swelling with swallowing/breathing difficulty.

A clinician must review this content, translations and local escalation pathways before clinical use. Negation and duration extraction are deliberately limited and cannot interpret every free-text description. Age, pregnancy and comorbidity-specific clinical triage have not been validated. The interface instructs patients with concerning answers to call nearby staff. A help button creates a real local staff-queue entry; it does not claim to dispatch an ambulance or notify an external service.
