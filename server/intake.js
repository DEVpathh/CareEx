// Clinician-review intake prompts, not diagnostic or prescribing rules.
// Warning-sign references and limitations: docs/clinical-intake.md.
const yesNo = [['yes', 'Yes', 'हाँ'], ['no', 'No', 'नहीं'], ['unsure', 'Not sure', 'पता नहीं']]
const q = (id, en, hi, type = 'text', options, redFlagAnswers) => ({ id, en, hi, type, options, redFlagAnswers })
const warning = (id, en, hi) => q(id, en, hi, 'choice', yesNo, ['yes'])
const choice = (id, en, hi, options = yesNo) => q(id, en, hi, 'choice', options)

export const symptomCatalog = [
  { id: 'chest_pain', en: 'chest pain', hi: 'सीने में दर्द', pattern: /chest (?:pain|discomfort|pressure)|सीने?\s*(?:में\s*)?(?:दर्द|दबाव)|छाती.*दर्द|(?:seene|sine|chhati|chati).{0,15}(?:dard|pain)/i, questions: [
    warning('warning', 'With the chest pain, do you have sweating, breathlessness, fainting, or pain spreading to your arm or jaw?', 'सीने के दर्द के साथ पसीना, साँस फूलना, बेहोशी या हाथ / जबड़े तक दर्द है?'),
    q('location', 'Where in your chest is the pain, and does it spread anywhere?', 'सीने में कहाँ दर्द है? क्या दर्द कहीं और फैलता है?'),
    choice('exertion', 'Does walking or exertion bring on the chest pain?', 'क्या चलने या मेहनत करने पर सीने में दर्द होता है?'),
  ]},
  { id: 'breathlessness', en: 'breathlessness', hi: 'साँस की परेशानी', pattern: /breathless|short(?:ness)? of breath|difficulty breathing|asthma|wheez|सांस|साँस|दमा|saans|sans (?:phool|ful|lene)/i, questions: [
    warning('warning', 'Are you struggling to breathe at rest, unable to finish a sentence, or noticing blue lips?', 'क्या आराम करते समय भी साँस बहुत मुश्किल है, पूरा वाक्य नहीं बोल पा रहे या होंठ नीले हैं?'),
    q('trigger', 'When is your breathing worse: at rest, walking, lying down, or around dust?', 'साँस की परेशानी कब बढ़ती है: आराम में, चलने, लेटने या धूल के पास?'),
    q('inhaler', 'Do you use an inhaler, and has it helped today?', 'क्या आप इनहेलर लेते हैं? क्या उससे आज आराम मिला?'),
  ]},
  { id: 'headache', en: 'headache', hi: 'सिरदर्द', pattern: /headache|head pain|migraine|सि?र\s*(?:में\s*)?दर्द|सिरदर्द|माइग्रेन|(?:sir|sar|ser).{0,12}(?:dard|pain)/i, questions: [
    warning('warning', 'Did the headache start suddenly at its worst, or come with weakness, confusion, loss of vision, or a stiff neck?', 'क्या सिरदर्द अचानक बहुत तेज़ हुआ, या साथ में कमजोरी, उलझन, दिखाई न देना या गर्दन अकड़ना है?'),
    q('location', 'Where is the headache: one side, both sides, forehead, or back of the head?', 'सिर में कहाँ दर्द है: एक तरफ, दोनों तरफ, माथे या पीछे?'),
    choice('associated', 'Does the headache come with nausea or sensitivity to light?', 'क्या सिरदर्द के साथ मितली या रोशनी से परेशानी है?'),
  ]},
  { id: 'fever', en: 'fever', hi: 'बुखार', pattern: /fever|high temperature|बुखार|bukha?r|bukhar|bukhaar/i, questions: [
    warning('warning', 'With the fever, are you confused, difficult to wake, or unable to drink?', 'बुखार के साथ उलझन है, जागने में मुश्किल है या पानी नहीं पी पा रहे हैं?'),
    q('temperature', 'What is the highest temperature you measured? Include °C or °F, or say not measured.', 'सबसे ज़्यादा कितना तापमान मापा? °C या °F भी बताएं। नहीं मापा तो वह बताएं।'),
    q('associated', 'Along with fever, do you have cough, burning urine, rash, vomiting, or pain?', 'बुखार के साथ खाँसी, पेशाब में जलन, चकत्ते, उल्टी या दर्द है?'),
  ]},
  { id: 'cough', en: 'cough', hi: 'खाँसी', pattern: /cough|खांसी|खाँसी|kha+n?s[iy]|khansi/i, questions: [
    warning('warning', 'Are you coughing blood, or having severe breathing difficulty?', 'क्या खाँसी में खून आता है या साँस लेने में बहुत परेशानी है?'),
    choice('kind', 'Is your cough dry or does it bring up phlegm?', 'खाँसी सूखी है या बलगम आता है?', [['dry', 'Dry', 'सूखी'], ['phlegm', 'With phlegm', 'बलगम वाली'], ['unsure', 'Not sure', 'पता नहीं']]),
    q('associated', 'Do you also have fever, night sweats, weight loss, or contact with someone with a long cough?', 'साथ में बुखार, रात में पसीना, वजन घटना या लंबी खाँसी वाले व्यक्ति से संपर्क हुआ है?'),
  ]},
  { id: 'abdominal_pain', en: 'abdominal pain', hi: 'पेट दर्द', pattern: /stomach (?:ache|pain)|abdominal|tummy|पेट\s*(?:में\s*)?दर्द|पेटदर्द|pet.{0,12}(?:dard|pain)/i, questions: [
    warning('warning', 'Is the abdominal pain sudden and severe, or is there blood in vomit or black stool?', 'क्या पेट दर्द अचानक बहुत तेज़ हुआ, उल्टी में खून है या मल काला है?'),
    q('location', 'Where in your abdomen is the pain? Does it move anywhere?', 'पेट में किस जगह दर्द है? क्या जगह बदलती है?'),
    q('associated', 'Any vomiting, loose stools, constipation, fever, or possibility of pregnancy?', 'क्या उल्टी, दस्त, कब्ज, बुखार या गर्भावस्था की संभावना है?'),
  ]},
  { id: 'diarrhoea', en: 'diarrhoea', hi: 'दस्त', pattern: /diarrh|loose (?:motion|stool)|दस्त|पतल[ाे].*(?:मल|पाखाना)|dast|loose motion/i, questions: [
    warning('warning', 'Is there blood in your stool, severe abdominal pain, confusion, or almost no urine?', 'क्या मल में खून, बहुत तेज़ पेट दर्द, उलझन या बहुत कम पेशाब है?'),
    q('frequency', 'How many loose stools have you had in the last 24 hours?', 'पिछले 24 घंटे में कितनी बार दस्त हुए?'),
    choice('fluids', 'Can you drink and keep fluids down?', 'क्या पानी पी पा रहे हैं और पानी पेट में रुक रहा है?'),
  ]},
  { id: 'vomiting', en: 'vomiting', hi: 'उल्टी', pattern: /vomit|throwing up|उल्टी|उलट[ीि]|ulti|ultee/i, questions: [
    warning('warning', 'Is there blood or green fluid in the vomit, or sudden severe abdominal pain?', 'क्या उल्टी में खून या हरा तरल है, या अचानक बहुत तेज़ पेट दर्द है?'),
    q('frequency', 'How many times have you vomited, and can you keep water down?', 'कितनी बार उल्टी हुई? क्या पानी पेट में रुकता है?'),
    q('associated', 'Any fever, diarrhoea, dizziness, or possibility of pregnancy?', 'क्या बुखार, दस्त, चक्कर या गर्भावस्था की संभावना है?'),
  ]},
  { id: 'acidity', en: 'acidity / heartburn', hi: 'एसिडिटी / जलन', pattern: /acidity|heartburn|acid reflux|indigestion|एसिडिटी|पेट.*जलन|सीने.*जलन|gas (?:hai|ho)|गैस/i, questions: [
    warning('warning', 'With the burning, do you have chest pressure, sweating, breathlessness, or black stools?', 'जलन के साथ सीने में दबाव, पसीना, साँस फूलना या काला मल है?'),
    q('meals', 'Does the burning happen after meals or when lying down?', 'क्या खाने के बाद या लेटने पर जलन बढ़ती है?'),
    q('swallow', 'Any trouble swallowing or unexplained weight loss?', 'क्या निगलने में परेशानी या बिना वजह वजन घटा है?'),
  ]},
  { id: 'constipation', en: 'constipation', hi: 'कब्ज', pattern: /constipat|कब्ज|kab[jz]|pet saaf nahi/i, questions: [
    warning('warning', 'Do you have severe abdominal pain, vomiting, and inability to pass gas?', 'क्या पेट में तेज़ दर्द, उल्टी और गैस भी नहीं निकल रही है?'),
    q('last', 'When did you last pass stool? Is it hard or painful?', 'आखिरी बार मल कब हुआ? क्या मल सख्त है या दर्द होता है?'),
    q('change', 'Any new medicine or recent change in food or water intake?', 'कोई नई दवा या खाने-पानी में बदलाव हुआ है?'),
  ]},
  { id: 'back_pain', en: 'back pain', hi: 'कमर / पीठ दर्द', pattern: /back pain|कमर.*दर्द|पीठ.*दर्द|kamar.*dard|peeth.*dard/i, questions: [
    warning('warning', 'Do you have new leg weakness, numbness around the groin, or loss of bladder or bowel control?', 'क्या पैरों में नई कमजोरी, जाँघों के बीच सुन्नपन या पेशाब / मल पर नियंत्रण की परेशानी है?'),
    q('radiation', 'Where is the back pain, and does it travel into a leg?', 'पीठ में कहाँ दर्द है? क्या दर्द पैर में जाता है?'),
    q('injury', 'Did the pain start after an injury, fall, or lifting something?', 'क्या चोट, गिरने या वजन उठाने के बाद दर्द शुरू हुआ?'),
  ]},
  { id: 'joint_pain', en: 'joint pain', hi: 'जोड़ों में दर्द', pattern: /joint|knee|arthritis|घुटन|जोड़|गठिया|ghutn|jod.*dard/i, questions: [
    warning('warning', 'Is the joint suddenly hot and swollen with fever, or can you not put weight on it?', 'क्या जोड़ अचानक गर्म और सूजा है, साथ में बुखार है या उस पर वजन नहीं डाल पा रहे?'),
    q('location', 'Which joints hurt? Is one side or both sides affected?', 'कौन से जोड़ों में दर्द है? एक तरफ या दोनों तरफ?'),
    q('stiffness', 'Is there swelling or morning stiffness? How long does stiffness last?', 'सूजन या सुबह अकड़न होती है? अकड़न कितनी देर रहती है?'),
  ]},
  { id: 'urinary', en: 'urinary symptoms', hi: 'पेशाब की परेशानी', pattern: /urinary|urine|urination|uti\b|पेशाब|peshab|pishaab|पथरी/i, questions: [
    warning('warning', 'Are you unable to pass urine, or do you have fever with side pain or vomiting?', 'क्या पेशाब बिल्कुल नहीं हो रहा, या बुखार के साथ कमर के किनारे दर्द / उल्टी है?'),
    q('symptoms', 'Do you have burning, frequent urination, blood, or lower abdominal pain?', 'पेशाब में जलन, बार-बार पेशाब, खून या नीचे पेट में दर्द है?'),
    q('history', 'Any past urine infections, kidney stones, diabetes, or possible pregnancy?', 'पहले पेशाब का संक्रमण, पथरी, डायबिटीज या गर्भावस्था की संभावना है?'),
  ]},
  { id: 'skin', en: 'rash / itching', hi: 'त्वचा / खुजली', pattern: /rash|itch|skin|खुजली|चकत्त|त्वचा|khujli|daane|दाने/i, questions: [
    warning('warning', 'Is there swelling of your lips or tongue, trouble breathing, or a rapidly spreading rash with fever?', 'क्या होंठ / जीभ सूजी है, साँस में परेशानी है या बुखार के साथ चकत्ते तेज़ी से फैल रहे हैं?'),
    q('location', 'Where is the rash or itching? Is it spreading?', 'चकत्ते या खुजली कहाँ है? क्या फैल रही है?'),
    q('exposure', 'Any new medicine, food, soap, insect bite, or contact with a similar rash?', 'नई दवा, खाना, साबुन, कीड़े का काटना या ऐसे चकत्तों वाले व्यक्ति से संपर्क हुआ?'),
  ]},
  { id: 'dizziness', en: 'dizziness', hi: 'चक्कर', pattern: /dizz|vertigo|light.?headed|चक्कर|chakkar/i, questions: [
    warning('warning', 'Do you also have fainting, chest pain, trouble speaking, or weakness on one side?', 'क्या साथ में बेहोशी, सीने में दर्द, बोलने में परेशानी या एक तरफ कमजोरी है?'),
    q('feeling', 'Does the room spin, or do you feel as if you may faint?', 'क्या कमरा घूमता लगता है या बेहोश होने जैसा लगता है?'),
    q('trigger', 'Does it happen when standing or turning your head? Have you eaten and drunk normally?', 'खड़े होने या सिर घुमाने पर होता है? खाना-पानी सामान्य लिया है?'),
  ]},
  { id: 'diabetes', en: 'diabetes / blood sugar', hi: 'डायबिटीज / शुगर', pattern: /diabet|blood sugar|मधुमेह|शुगर|डायबिटीज|sugar/i, questions: [
    warning('warning', 'Are you confused, very sleepy, fainting, or vomiting with deep rapid breathing?', 'क्या उलझन, बहुत नींद, बेहोशी या उल्टी के साथ गहरी तेज़ साँस है?'),
    q('reading', 'What was your latest blood sugar reading and when was it measured?', 'आखिरी शुगर रीडिंग कितनी थी और कब मापी थी?'),
    q('treatment', 'Which diabetes medicines or insulin do you take? Any missed doses or meals?', 'शुगर की कौन सी दवा या इंसुलिन लेते हैं? कोई खुराक या खाना छूटा है?'),
  ]},
  { id: 'blood_pressure', en: 'blood pressure', hi: 'ब्लड प्रेशर', pattern: /blood pressure|hypertension|\bbp\b|बीपी|ब्लड प्रेशर/i, questions: [
    warning('warning', 'With the blood pressure concern, do you have chest pain, severe headache, vision changes, or weakness?', 'बीपी की परेशानी के साथ सीने में दर्द, तेज़ सिरदर्द, नज़र में बदलाव या कमजोरी है?'),
    q('reading', 'What are both numbers of your latest blood pressure reading, and when was it taken?', 'आखिरी बीपी रीडिंग के दोनों नंबर बताएं। कब मापी थी?'),
    q('treatment', 'Which blood pressure medicines do you take? Any missed doses?', 'बीपी की कौन सी दवा लेते हैं? कोई खुराक छूटी है?'),
  ]},
  { id: 'throat', en: 'sore throat', hi: 'गले की परेशानी', pattern: /sore throat|throat pain|गले|गला|gala|gale/i, questions: [
    warning('warning', 'Are you unable to swallow saliva, drooling, or struggling to breathe?', 'क्या लार निगल नहीं पा रहे, लार बह रही है या साँस लेने में मुश्किल है?'),
    q('associated', 'Any fever, cough, blocked nose, or pain when swallowing?', 'बुखार, खाँसी, नाक बंद या निगलने पर दर्द है?'),
  ]},
  { id: 'ear', en: 'ear symptoms', hi: 'कान की परेशानी', pattern: /ear(?:ache| pain| discharge)|कान|kaan/i, questions: [
    q('side', 'Which ear is affected? Any discharge, reduced hearing, or swelling behind the ear?', 'किस कान में परेशानी है? पानी / पस, कम सुनाई देना या कान के पीछे सूजन है?'),
    choice('sudden', 'Did you suddenly lose hearing?', 'क्या अचानक सुनाई देना कम हुआ?', yesNo),
  ]},
  { id: 'eye', en: 'eye symptoms', hi: 'आँख की परेशानी', pattern: /eye (?:pain|red|irritation)|vision|आँख|आंख|aankh/i, questions: [
    warning('warning', 'Have you suddenly lost vision, had a chemical splash, or severe eye pain?', 'क्या अचानक दिखना बंद हुआ, आँख में केमिकल गया या बहुत तेज़ आँख दर्द है?'),
    q('side', 'One eye or both? Any redness, discharge, injury, or contact lens use?', 'एक आँख या दोनों? लालपन, पानी / पस, चोट या कॉन्टैक्ट लेंस लगाते हैं?'),
  ]},
  { id: 'dental', en: 'dental pain', hi: 'दाँत की परेशानी', pattern: /tooth|dental|gum pain|दांत|दाँत|daant/i, questions: [
    warning('warning', 'Is there swelling of your face or neck with difficulty swallowing or breathing?', 'क्या चेहरे / गर्दन में सूजन के साथ निगलने या साँस में परेशानी है?'),
    q('location', 'Which tooth or gum hurts? Any swelling, fever, or pain with hot or cold food?', 'किस दाँत या मसूड़े में दर्द है? सूजन, बुखार या ठंडे / गर्म से दर्द है?'),
  ]},
  { id: 'menstrual', en: 'menstrual concern', hi: 'माहवारी की परेशानी', pattern: /period|menstrual|माहवारी|मासिक|पीरियड/i, questions: [
    warning('warning', 'Is there very heavy bleeding with dizziness, fainting, or severe one-sided abdominal pain?', 'क्या बहुत अधिक खून के साथ चक्कर, बेहोशी या पेट के एक तरफ तेज़ दर्द है?'),
    q('cycle', 'When was your last period? What has changed, and could you be pregnant?', 'आखिरी माहवारी कब हुई? क्या बदला है और गर्भावस्था की संभावना है?'),
  ]},
  { id: 'fatigue', en: 'fatigue', hi: 'थकान', pattern: /fatigue|tired|थकान|कमजोरी|thaka?n|kamzori/i, questions: [
    q('impact', 'How is tiredness affecting daily activities? Any fever, weight loss, or poor sleep?', 'थकान से रोज़ के काम कितने प्रभावित हैं? बुखार, वजन घटना या नींद की परेशानी है?'),
    q('diet', 'Any change in appetite, diet, bleeding, medicines, or existing health conditions?', 'भूख, खाना, खून बहना, दवा या पुरानी बीमारी में कोई बदलाव है?'),
  ]},
]

const normalize = text => String(text ?? '').normalize('NFC').toLowerCase().replace(/[०-९]/g, c => String('०१२३४५६७८९'.indexOf(c)))
// Negation is scoped to a clause, so "no fever but chest pain" still captures chest pain.
export function detectSymptoms(text) {
  const clauses = normalize(text).split(/[,.;!?।\n]|\bbut\b|\blekin\b|लेकिन|परंतु/)
  return symptomCatalog.filter(item => clauses.some(clause => {
    const match = item.pattern.exec(clause)
    if (!match) return false
    const before = clause.slice(Math.max(0, match.index - 25), match.index)
    const after = clause.slice(match.index + match[0].length)
    const negated = /(?:\bno\b|\bwithout\b|\bdenies\b)\s*(?:any\s*)?$/.test(before) || /^\s*(?:nahi|nahin|नहीं|नही)\s*(?:hai|है)?\s*$/.test(after)
    return !negated
  }))
}

const common = [
  q('onset', 'When did this problem start?', 'यह परेशानी कब से है?'),
  { ...q('severity', 'How severe is the problem from 0 to 10? 0 is none, 10 is the worst.', 'परेशानी 0 से 10 में कितनी है? 0 यानी नहीं, 10 यानी सबसे अधिक।', 'number'), min: 0, max: 10 },
  q('history', 'Any long-term illnesses or previous episodes of this problem?', 'कोई पुरानी बीमारी है या पहले भी यह परेशानी हुई है?'),
  q('medicines', 'Which medicines or remedies have you taken, and do you have any allergies?', 'आपने कौन सी दवा या घरेलू उपचार लिया? किसी दवा से एलर्जी है?'),
]

function localize(question, hi) {
  const { en, hi: hindi, options, ...rest } = question
  return { ...rest, text: hi ? hindi : en, ...(options ? { options: options.map(([value, english, hindiLabel]) => ({ value, label: hi ? hindiLabel : english })) } : {}) }
}

export function analyseIntake({ complaint, pathway = 'general', language = 'English', answers = {} }) {
  const hi = /हिन्दी|हिंदी|^hi(?:-|$)|hindi/i.test(language)
  const text = normalize(complaint)
  // New symptoms mentioned in free-text follow-ups also receive their own questions.
  const followupText = Object.entries(answers).filter(([id]) => id.endsWith('.associated') || id === 'clarify').map(([, answer]) => answer).join('. ')
  const symptoms = detectSymptoms(`${complaint}. ${followupText}`)
  const inferredAnswers = {}
  const duration = text.match(/(?:\d+|one|two|three|एक|दो|तीन|चार|पाँच|पांच|ek|do|teen|char)\s*(?:days?|weeks?|months?|years?|hours?|minutes?|दिन|हफ्ते|सप्ताह|महीन[ेों]*|साल|घंट[ेों]*|मिनट|din|hafte?|mahine?|saal|ghante?)(?:\s*(?:से|se))?/i) ?? text.match(/since (?:yesterday|today)|कल से|आज से|kal se|aaj se/i)
  if (duration) inferredAnswers.onset = duration[0]
  const severity = text.match(/(?:pain|severity|दर्द)\s*(?:is|है)?\s*(10|[0-9])\s*(?:\/\s*10|out of 10)/)
  if (severity) inferredAnswers.severity = severity[1]
  const allAnswers = { ...inferredAnswers, ...answers }
  const specific = symptoms.flatMap(item => item.questions.map(question => ({ ...question, id: `${item.id}.${question.id}` })))
  const warnings = specific.filter(question => question.redFlagAnswers)
  const details = specific.filter(question => !question.redFlagAnswers)
  const questions = [
    ...(symptoms.length ? warnings : [warning('general.warning', 'Do you have severe breathing difficulty, fainting, confusion, or heavy bleeding?', 'क्या साँस लेने में बहुत परेशानी, बेहोशी, उलझन या बहुत खून बह रहा है?')]),
    ...(!symptoms.length ? [q('clarify', 'Where is the problem, and what exactly are you feeling?', 'किस जगह परेशानी है और क्या महसूस हो रहा है?')] : []),
    ...common.slice(0, 2).map(question => question.id === 'onset' && symptoms.length === 1 ? { ...question, en: `When did the ${symptoms[0].en} start?`, hi: `${symptoms[0].hi} कब से है?` } : question),
    ...details,
    ...common.slice(2),
    ...(pathway === 'ayush' ? [q('ayush.digestion', 'How are your appetite, digestion, and bowel habits?', 'भूख, पाचन और मल की आदतें कैसी हैं?'), q('ayush.routine', 'How is your sleep, and what is your usual food and daily routine?', 'नींद कैसी है? आम तौर पर क्या खाते हैं और दिनचर्या कैसी है?')] : []),
  ]
  if (allAnswers['cough.kind'] === 'phlegm') questions.splice(questions.findIndex(item => item.id === 'cough.kind') + 1, 0, q('cough.phlegm', 'What colour is the phlegm, and how much are you bringing up?', 'बलगम का रंग कैसा है और कितना आता है?'))
  if (allAnswers['diarrhoea.fluids'] === 'no') questions.unshift(warning('diarrhoea.dehydration', 'Are you passing very little urine, fainting, or becoming very sleepy?', 'क्या बहुत कम पेशाब, बेहोशी या बहुत अधिक नींद आ रही है?'))

  const urgentReasons = questions.filter(question => question.redFlagAnswers?.includes(allAnswers[question.id])).map(question => hi ? question.hi : question.en)
  const reportedText = normalize(`${complaint}. ${Object.entries(answers).filter(([id]) => !id.endsWith('.warning')).map(([, value]) => value).join('. ')}`)
  const urgentText = reportedText.split(/[,.;!?।\n]|\bbut\b|लेकिन/).some(clause => {
    const negated = /\b(?:no|not|without|denies)\s+(?:fainting|unconscious|severe bleeding)|(?:बेहोश|खून)\s*(?:नहीं|नही)|behosh\s*nahi/i.test(clause)
    return !negated && /\bunconscious\b|\bfaint(?:ing|ed)\b|severe bleeding|cannot breathe|can't breathe|बेहोश|सां?ँ?स\s*(?:बिल्कुल\s*)?नहीं\s*(?:आ|ले)|saans nahi (?:aa|le)|बहुत खून/.test(clause)
  })
  const chest = symptoms.some(item => item.id === 'chest_pain')
  const chestEmergency = chest && (symptoms.some(item => item.id === 'breathlessness') || /sweat|पसीना|pasina|paseena/.test(text))
  if (urgentText || chestEmergency) urgentReasons.unshift(hi ? 'आपकी बताई परेशानी में तुरंत चिकित्सक की सहायता की ज़रूरत हो सकती है।' : 'Your reported symptoms may need immediate clinical attention.')
  if (allAnswers['ear.sudden'] === 'yes') urgentReasons.push(hi ? 'अचानक सुनाई कम देना: तुरंत चिकित्सक को बताएं।' : 'Sudden hearing loss: seek prompt clinical review.')
  const localized = questions.map(question => localize(question, hi))
  const symptomLabels = symptoms.map(item => hi ? item.hi : item.en)
  return {
    engine: 'adaptive-rules-v2',
    symptoms: symptoms.map(item => item.en), symptomLabels,
    summary: symptomLabels.length ? symptomLabels.join(' · ') : (hi ? 'आपकी परेशानी की और जानकारी ली जा रही है' : 'Gathering more detail about your concern'),
    questions: localized, inferredAnswers,
    urgent: urgentReasons.length > 0, urgentReasons,
    complete: localized.every(question => String(allAnswers[question.id] ?? '').trim().length > 0),
  }
}
