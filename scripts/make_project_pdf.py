from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "MediKiosk_Project_Explanation_Hinglish.pdf"


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.line(18 * mm, 14 * mm, 192 * mm, 14 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(18 * mm, 9 * mm, "MediKiosk | Project explanation | Synthetic prototype")
    canvas.drawRightString(192 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=30,
        leading=36,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#172033"),
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        parent=styles["Normal"],
        fontSize=14,
        leading=21,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=18,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=24,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=12,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="Sub",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F766E"),
        spaceBefore=8,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#334155"),
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
    )
)
styles.add(
    ParagraphStyle(
        name="Quote",
        parent=styles["BodyText"],
        fontSize=12,
        leading=18,
        leftIndent=12,
        borderPadding=9,
        backColor=colors.HexColor("#EEF2FF"),
        borderColor=colors.HexColor("#818CF8"),
        borderWidth=1,
        borderLeft=True,
        textColor=colors.HexColor("#312E81"),
        spaceBefore=6,
        spaceAfter=10,
    )
)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullet(text):
    return p(f"&bull; {text}")


story = []
story += [
    Spacer(1, 35 * mm),
    p("MediKiosk", "CoverTitle"),
    p("AI Patient Case-Taking Software", "CoverSub"),
    HRFlowable(width="55%", thickness=2, color=colors.HexColor("#4F46E5"), hAlign="CENTER"),
    Spacer(1, 12 * mm),
    p("Complete project explanation aur design thinking - Roman Hinglish mein", "CoverSub"),
    Spacer(1, 20 * mm),
    p(
        "<b>Short summary:</b> MediKiosk ek human-supervised clinical intake dashboard hai. "
        "Iska goal doctor ko replace karna nahi, balki patient ki story ko fast, structured aur reviewable format mein lana hai.",
        "Quote",
    ),
    Spacer(1, 24 * mm),
    p("Prepared for: Ministry of AYUSH / AIIA workflow concept", "Small"),
    p("Data note: Is prototype mein sirf dummy aur synthetic data use hua hai.", "Small"),
    PageBreak(),
]

story += [
    p("1. Problem ko kaise samjha gaya", "Section"),
    p(
        "Design start karte waqt maine hospital ko normal SaaS office nahi maana. Indian public hospitals mein "
        "daily patient volume 4,000-10,000 ho sakta hai aur consultation window sirf 2-5 minutes ki hoti hai. "
        "Isliye interface ka primary metric 'zyada features' nahi, balki 'sahi information ko jaldi aur safely surface karna' hai.",
    ),
    bullet("<b>Low literacy:</b> bade touch targets, icons, short labels, visual states aur audio-guided mode."),
    bullet("<b>Noise:</b> voice transcript ke saath touch-assist fallback; system sirf speech par depend nahi karta."),
    bullet("<b>Code-switching:</b> Hinglish transcript aur local language / Indic-TTS readiness visible rakhi gayi."),
    bullet("<b>Asymmetric triage risk:</b> emergency red flag ko routine queue se upar ek aggressive modal alert banaya."),
    bullet("<b>Physician skepticism:</b> har draft editable hai aur Accept, Amend/Edit, Reject/Delete actions explicit hain."),
    p(
        "Core principle: <b>AI suggestion de sakta hai, clinical responsibility physician ki hi rahegi.</b>",
        "Quote",
    ),
]

story += [
    p("2. Product structure aur user journey", "Section"),
    p(
        "Top progress bar patient journey ko chaar clear stages mein todta hai. User kisi bhi stage par click karke "
        "state ko locally test kar sakta hai.",
    ),
]
journey = [
    ["Stage", "UI ka role", "Safety / usability thinking"],
    ["Identify", "Patient identity aur consent", "Consent pehle; isolated session notice"],
    ["Converse", "Voice + touch history capture", "Noise fallback, SOCRATES, AYUSH mode"],
    ["Scan", "Documents se context extraction", "OCR loading state, timeline, abnormal values"],
    ["Review", "Physician-in-the-loop summary", "Editable drafts, explicit decision controls"],
]
t = Table(journey, colWidths=[27 * mm, 68 * mm, 80 * mm], repeatRows=1)
t.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("LEADING", (0, 0), (-1, -1), 12),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("PADDING", (0, 0), (-1, -1), 7),
        ]
    )
)
story += [t, Spacer(1, 8), p("Har stage mein ek clear primary CTA hai, taaki zero-training user confuse na ho.", "Small")]

story += [
    p("3. Global accessibility shell", "Section"),
    p(
        "Header ko persistent rakha gaya hai, kyunki language aur accessibility settings workflow ke beech lose nahi honi chahiye.",
    ),
    bullet("<b>Language Switcher:</b> English, Hindi, Bengali aur Marathi options; Indic-TTS ready badge fallback ko communicate karta hai."),
    bullet("<b>Audio-guided mode:</b> toggle active hone par visual active state aur audio affordance visible hoti hai."),
    bullet("<b>High contrast / large text:</b> global text scale state se reading comfort badhta hai."),
    bullet("<b>Touch target rule:</b> controls ko min-height 44-48px ke around rakha gaya hai."),
    bullet("<b>Clinical palette:</b> Slate = neutral, Indigo = workflow/action, Emerald = safe/complete, Amber = attention, Red = emergency."),
]

story += [
    p("4. Identify aur DPDP consent thinking", "Section"),
    p(
        "Patient ko pehle identify karna aur uske baad data use ka choice dena important hai. Isliye consent card registration card ke equal visual weight mein hai; "
        "consent ko footer ya hidden checkbox nahi banaya.",
    ),
    bullet("ABHA ID, Aadhaar aur New Patient teen entry paths diye gaye hain."),
    bullet("Consent ko granular choices ke roop mein show kiya: case preparation, prior records aur care-team sharing."),
    bullet("Audio explanation simulator local-language understanding ka visual proof deta hai."),
    bullet("Security banner clearly batata hai ki temporary local data submission ke baad purge hoga."),
    p(
        "Prototype mein checkbox state shared consent state se control hoti hai. Production version mein har consent purpose ka independent audit record, timestamp, withdrawal endpoint aur purpose limitation add hoga.",
        "Quote",
    ),
]

story += [
    p("5. Converse: multimodal history capture", "Section"),
    p(
        "Voice interface left panel mein isliye hai kyunki patient apni natural language mein bol sakta hai. Right panel touch assist isliye hai kyunki noisy ward ya speech recognition error ke waqt staff/patient structured answer de sakte hain.",
    ),
    p("SOCRATES mapping", "Sub"),
    p("Chest pain select karne ke baad Onset, Character, Radiation aur Severity ke selectors khulte hain. Ye free-text ko clinical structure mein convert karne ka first layer hai."),
    p("AYUSH differentiator", "Sub"),
    p("AYUSH History Mode interface ko Dashavidha Pariksha grid mein morph karta hai: Prakriti, Vikriti, Agni, Koshtha aur Ahara-Vihara. Graphical pills plain checkboxes se zyada approachable rakhe gaye hain."),
    p("Red-flag decision", "Sub"),
    p("Chest pain click karte hi Priority 1 overlay trigger hota hai. Modal message routine queue bypass aur emergency routing ko explicitly communicate karta hai. Real system mein is trigger ko validated clinical rules, escalation acknowledgement aur audit trail ke saath integrate karna hoga."),
]

story += [
    p("6. Scan aur chronological context", "Section"),
    p(
        "Document upload flow ko drag-and-drop zone, OCR skeleton aur post-processing timeline mein todne ka reason hai expectation management. User ko blank wait screen nahi milti; processing state visible hoti hai.",
    ),
    bullet("Prescriptions, lab reports aur discharge summaries ke liye upload affordance."),
    bullet("Processing OCR state mein animated skeleton perceived waiting time ko honest rakhta hai."),
    bullet("Timeline dates ke order mein prior events ko physician ke liye scan-friendly banati hai."),
    bullet("Blood Sugar 240 mg/dL HIGH aur HbA1c 8.4% ELEVATED jaise abnormal values amber/red badges se highlight hote hain."),
    p("Color ka use diagnosis ke liye nahi, attention prioritization ke liye hai.", "Quote"),
]

story += [
    p("7. Physician trust dashboard", "Section"),
    p(
        "Review screen ka most important design choice 'AI-generated answer' ko final truth ki tarah na dikhana hai. Har section ko draft ke roop mein label kiya gaya hai aur doctor ke paas teen explicit options hain.",
    ),
    bullet("<b>Accept draft:</b> content ko review ke baad accept karna."),
    bullet("<b>Amend / edit:</b> inline textarea se clinical correction karna."),
    bullet("<b>Reject / delete:</b> incorrect or irrelevant draft ko remove karna."),
    p(
        "Sections standard clinical order follow karte hain: Chief Complaint, HPI, Past History, Drug & Allergy, Family History aur ROS. Neeche ABDM sandbox, FHIR R4 Observation aur HIS registry matched metadata interoperability trust signal provide karta hai.",
    ),
]

story += [
    p("8. Technical architecture", "Section"),
    bullet("<b>React + TypeScript:</b> functional components aur strict typing ke saath single-page application."),
    bullet("<b>State handling:</b> App level useState workflow, toggles, consent, AYUSH mode, OCR, red flag aur review actions manage karta hai."),
    bullet("<b>Reusable UI primitives:</b> Card, Pill aur IconButton consistency ke liye reuse kiye gaye."),
    bullet("<b>Tailwind CSS:</b> atomic utility classes, responsive grid layouts aur medical palette."),
    bullet("<b>Lucide icons:</b> text literacy par dependency kam karne ke liye recognizable icon language."),
    bullet("<b>Vite:</b> fast local development aur production build pipeline."),
    p("Main implementation file: src/main.tsx. Styling: src/index.css. Build config: package.json, vite.config.ts aur tailwind.config.js.", "Small"),
]

story += [
    p("9. Local testing checklist", "Section"),
    p("App run karne ke liye:", "Sub"),
    p("<font name=\"Courier\">cd \"C:\\Users\\DELL\\OneDrive\\Desktop\\New folder\\Medikiosk\"<br/>npm install<br/>npm run dev</font>", "Body"),
    p("Interactive states test karein:", "Sub"),
    bullet("Language dropdown change karein; Audio aur Contrast toggles on/off karein."),
    bullet("Identify mein consent uncheck karke Continue disabled state verify karein."),
    bullet("Converse mein Chest pain click karke Red-Flag overlay verify karein."),
    bullet("AYUSH History Mode switch karke Dashavidha grid verify karein."),
    bullet("Scan mein Choose files click karke OCR skeleton aur timeline verify karein."),
    bullet("Review mein Accept, Amend/Edit aur Reject/Delete controls test karein."),
    p("Build validation: <b>npm run build</b> successfully pass hua hai.", "Quote"),
]

story += [
    p("10. Production hardening roadmap", "Section"),
    p(
        "Ye frontend concept production-ready interaction patterns demonstrate karta hai, lekin real deployment se pehle backend aur governance layers zaroori hain:",
    ),
    bullet("ABDM OAuth / ABHA verification, consent artefacts aur revocation APIs."),
    bullet("On-device or approved secure speech-to-text with Indic language models."),
    bullet("Validated red-flag clinical rules; alert fatigue prevention; emergency escalation logs."),
    bullet("Encrypted document upload, OCR service isolation, retention policy and deletion proof."),
    bullet("FHIR R4 resource validation, HIS registry mapping and role-based access control."),
    bullet("Usability testing with patients, nurses and AYUSH physicians in noisy OPD conditions."),
    p(
        "Final design stance: <b>fast for the patient, legible for the staff, cautious for the doctor, and accountable for the system.</b>",
        "Quote",
    ),
]

doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=17 * mm,
    bottomMargin=20 * mm,
    title="MediKiosk Project Explanation - Hinglish",
    author="MediKiosk",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
