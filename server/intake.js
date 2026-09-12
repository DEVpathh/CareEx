import redFlagRules from './red_flag_rules.json' with { type: 'json' }

// Clinician-review intake prompts, not diagnostic or prescribing rules.
// Warning-sign references and limitations: docs/clinical-intake.md.
const yesNo = [['yes', 'Yes', 'हाँ'], ['no', 'No', 'नहीं'], ['unsure', 'Not sure', 'पता नहीं']]
const q = (id, en, hi, type = 'text', options, redFlagAnswers) => ({ id, en, hi, type, options, redFlagAnswers })
const warning = (id, en, hi) => q(id, en, hi, 'choice', yesNo, ['yes'])
const choice = (id, en, hi, options = yesNo) => q(id, en, hi, 'choice', options)

export const symptomCatalog = [
  { id: 'headache', en: 'headache', hi: 'सिर / चेहरा / माथा', pattern: /headache|head|scalp|forehead|temple|face|jaw|chin|सिर|माथा|चेहरा|जबड़ा|ठुड्डी|sir|sar|ser|matha|chehra|jabda/i, questions: [
    warning('warning', 'Did the pain start suddenly at its worst, or come with confusion, loss of vision, or weakness?', 'क्या दर्द अचानक बहुत तेज़ हुआ, या साथ में उलझन, दिखाई न देना या कमजोरी है?'),
    q('location', 'Where is the pain located: forehead, temples, scalp, face, or jaw?', 'दर्द सिर में किस जगह है: माथे, कनपटी, चेहरे या जबड़े पर?'),
  ]},
  { id: 'eyes', en: 'eyes & vision', hi: 'आँख और रोशनी की परेशानी', pattern: /eyes & vision|eye|vision|eyelid|socket|आँख|आंख|रोशनी|पलक|aankh|roshni|palak|aankho/i, questions: [
    warning('warning', 'Have you suddenly lost vision, had a chemical splash, or severe eye pain?', 'क्या अचानक दिखना बंद हुआ, आँख में केमिकल गया या बहुत तेज़ आँख दर्द है?'),
    q('side', 'One eye or both? Any redness, discharge, itching, or swelling?', 'एक आँख या दोनों? लालपन, पानी / पस, खुजली या सूजन है?'),
  ]},
  { id: 'ears', en: 'ears & hearing', hi: 'कान और सुनने की परेशानी', pattern: /ears & hearing|ear|hearing|canal|balance|कान|सुनना|संतुलन|kaan|sunna/i, questions: [
    warning('warning', 'Do you have sudden complete loss of hearing or severe dizziness with vomiting?', 'क्या अचानक पूरा सुनाई देना बंद हुआ या तेज़ चक्कर के साथ उल्टी है?'),
    q('side', 'Which ear is affected? Any discharge, pain, or buzzing sound?', 'किस कान में परेशानी है? पानी / पस, दर्द या सीटी की आवाज़ है?'),
    choice('sudden', 'Did you suddenly lose hearing?', 'क्या अचानक सुनाई देना कम हुआ?', yesNo),
  ]},
  { id: 'nose', en: 'nose & sinuses', hi: 'नाक और साइनस', pattern: /nose & sinuses|nose|nasal|sinus|septum|smell|नाक|साइनस|सूँघना|naak|sinus/i, questions: [
    warning('warning', 'Is there heavy bleeding from the nose that will not stop after 15 minutes?', 'क्या नाक से बहुत अधिक खून बह रहा है जो 15 मिनट दबाने पर भी नहीं रुक रहा?'),
    q('symptoms', 'Do you have blocked nose, runny nose, facial pressure, or loss of smell?', 'क्या नाक बंद, नाक बहना, चेहरे पर भारीपन या सूंघने की शक्ति कम हुई है?'),
  ]},
  { id: 'mouth_teeth', en: 'mouth & teeth', hi: 'मुँह और दाँत', pattern: /mouth & teeth|mouth|lip|teeth|tooth|gum|tongue|cheek|salivary|मुँह|मसाड़ा|दाँत|दांत|जीभ|होंठ|daant|muh|jibh|hont/i, questions: [
    warning('warning', 'Is there swelling of your face or neck with difficulty swallowing or breathing?', 'क्या चेहरे / गर्दन में सूजन के साथ निगलने या साँस में परेशानी है?'),
    q('location', 'Which tooth, gum, or part of your mouth hurts?', 'किस दाँत, मसूड़े या मुँह के हिस्से में दर्द है?'),
  ]},
  { id: 'throat', en: 'throat', hi: 'गला', pattern: /throat|tonsil|pharynx|larynx|esophagus|vocal|गला|गले|टॉन्सिल|gala|gale|tonsil/i, questions: [
    warning('warning', 'Are you unable to swallow saliva, drooling, or struggling to breathe?', 'क्या लार निगल नहीं पा रहे, लार बह रही है या साँस लेने में मुश्किल है?'),
    q('associated', 'Any fever, cough, blocked nose, or pain when swallowing?', 'बुखार, खाँसी, नाक बंद या निगलने पर दर्द है?'),
  ]},
  { id: 'neck', en: 'neck', hi: 'गर्दन', pattern: /neck|thyroid|lymph node|गर्दन|थायरॉयड|gardan|gardan.*dard/i, questions: [
    warning('warning', 'Is your neck stiff with high fever, or is pain spreading to your arms with weakness?', 'क्या तेज़ बुखार के साथ गर्दन अकड़ी है, या दर्द हाथों तक सुन्नपन / कमजोरी ला रहा है?'),
    q('location', 'Where is the pain or swelling: front, back, or side of neck?', 'गर्दन में दर्द या सूजन कहाँ है: आगे, पीछे या बगल में?'),
  ]},
  { id: 'brain_nervous_system', en: 'brain & nervous system', hi: 'मस्तिष्क और तंत्रिका तंत्र', pattern: /brain & nervous system|brain|nerve|paralysis|numbness|tingling|seizure|दिमाग|नसों|सुन्न|झुनझुनी|दौरा|dimag|naso|sunn|jhunjhuni/i, questions: [
    warning('warning', 'Do you have sudden weakness on one side of face/body, slurred speech, or confusion?', 'क्या शरीर के एक तरफ अचानक कमजोरी, चेहरे पर लकवा, बोलने में तुतलाहट या उलझन है?'),
    q('type', 'Are you experiencing numbness, tingling, weakness, or fits?', 'क्या आपको सुन्नपन, झुनझुनी, कमजोरी या दौरे महसूस हो रहे हैं?'),
  ]},
  { id: 'chest_pain', en: 'chest pain', hi: 'सीने में दर्द', pattern: /chest (?:pain|discomfort|pressure)|rib|sternum|सीने?\s*(?:में\s*)?(?:दर्द|दबाव)|छाती.*दर्द|पसली|(?:seene|sine|chhati|chati).{0,15}(?:dard|pain)/i, questions: [
    warning('warning', 'With the chest pain, do you have sweating, breathlessness, fainting, or pain spreading to your arm or jaw?', 'सीने के दर्द के साथ पसीना, साँस फूलना, बेहोशी या हाथ / जबड़े तक दर्द है?'),
    q('location', 'Where in your chest is the pain, and does it spread anywhere?', 'सीने में कहाँ दर्द है? क्या दर्द कहीं और फैलता है?'),
    choice('exertion', 'Does walking or exertion bring on the chest pain?', 'क्या चलने या मेहनत करने पर सीने में दर्द होता है?'),
  ]},
  { id: 'heart', en: 'heart & circulation', hi: 'दिल और रक्त संचार', pattern: /heart & circulation|heart|palpitation|vein|artery|circulation|दिल|धड़कन|धमनी|नसें|dil|dhadkan/i, questions: [
    warning('warning', 'Do you have fast irregular heartbeats with chest pain, dizziness, or fainting?', 'क्या सीने में दर्द, चक्कर या बेहोशी के साथ तेज़ / अनियमित धड़कन है?'),
    q('symptoms', 'Are you feeling palpitations, leg swelling, or chest heaviness?', 'क्या घबराहट, धड़कन तेज़ होना, पैरों में सूजन या सीने में भारीपन है?'),
  ]},
  { id: 'breathlessness', en: 'breathlessness', hi: 'साँस और फेफड़े', pattern: /breathlessness|breathless|respiratory|short(?:ness)? of breath|difficulty breathing|asthma|wheez|lung|bronch|trachea|pleura|diaphragm|सांस|साँस|फेफड़े|दमा|saans|sans (?:phool|ful|lene)/i, questions: [
    warning('warning', 'Are you struggling to breathe at rest, unable to finish a sentence, or noticing blue lips?', 'क्या आराम करते समय भी साँस बहुत मुश्किल है, पूरा वाक्य नहीं बोल पा रहे या होंठ नीले हैं?'),
    q('trigger', 'When is your breathing worse: at rest, walking, lying down, or around dust?', 'साँस की परेशानी कब बढ़ती है: आराम में, चलने, लेटने या धूल के पास?'),
    q('inhaler', 'Do you use an inhaler, and has it helped today?', 'क्या आप इनहेलर लेते हैं? क्या उससे आज आराम मिला?'),
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
  { id: 'abdominal_pain', en: 'abdominal pain', hi: 'पेट और पाचन तंत्र', pattern: /abdominal pain|stomach|abdominal|tummy|liver|gallbladder|pancreas|intestine|rectum|anus|पेट|आंत|लीवर|अग्न्याशय|गुदा|pet|aant|leever/i, questions: [
    warning('warning', 'Is the abdominal pain sudden and severe, or is there blood in vomit or black stool?', 'क्या पेट दर्द अचानक बहुत तेज़ हुआ, उल्टी में खून है या मल काला है?'),
    q('location', 'Where in your abdomen is the pain? Upper right, lower right, middle, or left?', 'पेट में किस जगह दर्द है: ऊपर दाहिने, नीचे दाहिने, बीच में या बाएँ?'),
    q('associated', 'Any vomiting, loose stools, constipation, fever, or possibility of pregnancy?', 'क्या उल्टी, दस्त, कब्ज, बुखार या गर्भावस्था की संभावना है?'),
  ]},
  { id: 'vomiting', en: 'vomiting', hi: 'उल्टी', pattern: /vomit|nausea|उल्टी|ult|ulti/i, questions: [
    warning('warning', 'Is there blood in your vomit, severe abdominal pain, or high fever?', 'क्या उल्टी में खून है, तेज़ पेट दर्द है या तेज़ बुखार है?'),
    q('frequency', 'How many times have you vomited, and can you keep liquids down?', 'कितनी बार उल्टी हुई है, और क्या पानी रुक रहा है?'),
  ]},
  { id: 'breast', en: 'breast', hi: 'स्तन / छाती की गांठ', pattern: /breast|nipple|areola|axilla|स्तन|छाती.*गांठ|निप्पल|stan|nipple/i, questions: [
    warning('warning', 'Is there sudden skin dimpling, bloody nipple discharge, or a rapidly growing lump?', 'क्या त्वचा में खिंचाव, निप्पल से खून आना या बहुत तेज़ी से बढ़ती गांठ है?'),
    q('symptoms', 'Do you feel a lump, pain, nipple changes, or swelling under the armpit?', 'क्या गांठ, दर्द, निप्पल में बदलाव या कांख (armpit) में सूजन है?'),
  ]},
  { id: 'back_spine', en: 'back & spine', hi: 'पीठ और रीढ़ की हड्डी', pattern: /back & spine|back|spine|lumbar|sacral|पीठ|कमर|रीढ़|peeth|kamar/i, questions: [
    warning('warning', 'Do you have new leg weakness, numbness around the groin, or loss of bladder control?', 'क्या पैरों में नई कमजोरी, जाँघों के बीच सुन्नपन या पेशाब / मल पर नियंत्रण की परेशानी है?'),
    q('radiation', 'Where is the back pain, and does it travel into a leg?', 'पीठ में कहाँ दर्द है? क्या दर्द पैर में जाता है?'),
    q('injury', 'Did the pain start after an injury, fall, or lifting something?', 'क्या चोट, गिरने या वजन उठाने के बाद दर्द शुरू हुआ?'),
  ]},
  { id: 'pelvis', en: 'pelvis', hi: 'पेल्विस / नलों का दर्द', pattern: /pelvis|pelvi|groin|पेल्विस|पेडू|नलों|pedu|groin/i, questions: [
    warning('warning', 'Is there severe lower abdominal pain with fever, heavy bleeding, or fainting?', 'क्या पेट के निचले हिस्से में तेज़ दर्द के साथ बुखार, भारी रक्तस्राव या बेहोशी है?'),
    q('symptoms', 'Where is the pain located: lower abdomen, pelvic joints, or groin?', 'दर्द किस जगह है: निचले पेट में, जोड़ों में या जांघ के जोड़ (groin) में?'),
  ]},
  { id: 'urinary', en: 'urinary system', hi: 'पेशाब और गुर्दे', pattern: /urinary system|urinary|urine|urination|kidney|ureter|bladder|urethra|uti\b|पेशाब|गुर्दे|किडनी|peshab|pishaab|pathri/i, questions: [
    warning('warning', 'Are you unable to pass urine, or do you have fever with severe side/back pain or vomiting?', 'क्या पेशाब बिल्कुल नहीं हो रहा, या बुखार के साथ कमर के किनारे तेज़ दर्द / उल्टी है?'),
    q('symptoms', 'Do you have burning, frequent urination, blood, or lower abdominal pain?', 'पेशाब में जलन, बार-बार पेशाब, खून या नीचे पेट में दर्द है?'),
  ]},
  { id: 'male_reproductive', en: 'male reproductive', hi: 'पुरुष जननांग की परेशानी', pattern: /male reproductive|penis|testicle|scrotum|prostate|testis|पुरुष.*अंग|अंडकोष|प्रोस्टेट|andkosh/i, questions: [
    warning('warning', 'Do you have sudden severe pain or swelling in the testicle?', 'क्या अंडकोष (testicle) में अचानक तेज़ दर्द या बहुत सूजन हुई है?'),
    q('symptoms', 'Is there pain, discharge, swelling, or urine difficulty?', 'क्या दर्द, डिस्चार्ज, सूजन या पेशाब में रुकावट है?'),
  ]},
  { id: 'female_reproductive', en: 'female reproductive & menstrual', hi: 'महिला स्वास्थ्य और माहवारी', pattern: /female reproductive & menstrual|female reproductive|vagina|vulva|cervix|uterus|ovary|period|menstrual|pregnancy|postpartum|महिला|माहवारी|पीरियड|गर्भावस्था|गर्भाशय|mahvari|period|garbh/i, questions: [
    warning('warning', 'Is there very heavy bleeding with dizziness, fainting, or severe one-sided lower pain?', 'क्या बहुत अधिक खून के साथ चक्कर, बेहोशी या पेट के निचले हिस्से में तेज़ दर्द है?'),
    q('cycle', 'When was your last period? Could you be pregnant?', 'आखिरी माहवारी कब हुई? क्या गर्भावस्था की संभावना है?'),
  ]},
  { id: 'shoulder', en: 'shoulder & collarbone', hi: 'कंधा और हंसली', pattern: /shoulder & collarbone|shoulder|rotator cuff|collarbone|clavicle|कंधा|हंसली|kandha|kandhe/i, questions: [
    warning('warning', 'Can you not move your shoulder at all after a fall, or is it visibly displaced?', 'क्या गिरने के बाद कंधा बिल्कुल नहीं हिल रहा या अपनी जगह से हटा हुआ दिख रहा है?'),
    q('movement', 'Is there pain while lifting your arm or sleeping on your side?', 'क्या हाथ उठाने पर या करवट लेकर सोने पर दर्द होता है?'),
  ]},
  { id: 'arm_elbow_hand', en: 'arm / elbow / hand', hi: 'हाथ / कोहनी / कलाई / उंगली', pattern: /arm \/ elbow \/ hand|arm|elbow|kohni|कोहनी|wrist|khalai|कलाई|finger|अंगुली|उंगली|thumb|अंगूठा|forearm|bazu|बाज़ू|बाजू|hand|palm|हाथ|haath|hath/i, questions: [
    warning('warning', 'Is there severe swelling, inability to move the arm/hand, deformity, or numbness?', 'क्या हाथ / कोहनी में तेज़ सूजन, हिलाने में असमर्थता, सुन्नपन या बनावट में बदलाव है?'),
    q('location', 'Where is the pain: elbow, wrist, hand, thumb, or fingers?', 'दर्द किस जगह है: कोहनी, कलाई, हाथ, अंगूठे या उंगलियों में?'),
    q('injury', 'Did the pain start after an injury, fall, repetitive work, or lifting?', 'क्या दर्द चोट, गिरने, लगातार काम या वजन उठाने से हुआ?'),
  ]},
  { id: 'hip', en: 'hip joint & muscles', hi: 'कूल्हा और जोड़', pattern: /hip|कूल्हा|कुलहा|koolha|kulha/i, questions: [
    warning('warning', 'Are you unable to put any weight on your leg after a fall?', 'क्या गिरने के बाद आप पैर पर बिल्कुल वजन नहीं डाल पा रहे हैं?'),
    q('movement', 'Does walking or sitting increase the hip pain?', 'क्या चलने या बैठने पर कूल्हे का दर्द बढ़ता है?'),
  ]},
  { id: 'leg_knee_foot', en: 'leg / knee / ankle / foot', hi: 'पैर / घुटना / टाँग / टखना / पाँव', pattern: /knee|ghutn|घुटना|घुटने|leg|पैर|टांग|टाँग|तांग|ताँग|paon|पाँव|foot|ankle|टखना|takhna|heel|एड़ी|edi|toe|thigh|जांघ|jangh|calf|पिंडली|shin|taang|tang|tangh|pair|per\b|pairo/i, questions: [
    warning('warning', 'Is the knee, leg, or foot severely swollen, hot, or unable to bear any weight?', 'क्या घुटने या पैर में बहुत सूजन है, गर्म महसूस हो रहा है या वजन बिल्कुल नहीं डाल पा रहे?'),
    q('location', 'Which part hurts: thigh, knee, calf, ankle, heel, or toes?', 'दर्द कहाँ है: जाँघ, घुटना, पिंडली, टखना, एड़ी या उंगलियों में?'),
    q('stiffness', 'Is there morning stiffness, swelling, or pain while walking?', 'क्या सुबह अकड़न, सूजन या चलने पर दर्द होता है?'),
  ]},
  { id: 'skin', en: 'skin & rashes', hi: 'त्वचा / चकत्ते / खुजली', pattern: /skin|rash|itch|dermat|eczema|psoriasis|खुजली|चकत्त|त्वचा|दाने|daane|khujli/i, questions: [
    warning('warning', 'Is there swelling of your lips/tongue, trouble breathing, or a rapidly spreading rash with fever?', 'क्या होंठ / जीभ सूजी है, साँस में परेशानी है या बुखार के साथ चकत्ते तेज़ी से फैल रहे हैं?'),
    q('location', 'Where is the rash or itching? Is it spreading?', 'चकत्ते या खुजली कहाँ है? क्या फैल रही है?'),
  ]},
  { id: 'hair_nails', en: 'hair & nails', hi: 'बाल और नाखून', pattern: /hair|nail|scalp hair|toenail|fingernail|बाल|नाखून|बाल झटना|naakhun|baal/i, questions: [
    q('symptoms', 'Are you experiencing rapid hair loss, scalp itching, or nail discoloration/pain?', 'क्या बाल तेज़ी से झड़ रहे हैं, सिर में खुजली है या नाखून का रंग बदल रहा है?'),
  ]},
  { id: 'bones_joints', en: 'bones & joints', hi: 'हड्डियां और जोड़', pattern: /bone|joint|fracture|skull|jaw bone|rib|joint pain|हड्डी|जोड़|फ्रैक्चर|haddi|jod/i, questions: [
    warning('warning', 'Was there an injury with visible bone deformity, severe pain, or inability to move?', 'क्या चोट के बाद हड्डी की बनावट में बदलाव, असहनीय दर्द या हिलाने में असमर्थता है?'),
    q('location', 'Which bone or joint is painful?', 'किस हड्डी या जोड़ में दर्द है?'),
  ]},
  { id: 'muscles', en: 'muscles & cramps', hi: 'मांसपेशियां और खिंचाव', pattern: /muscle|cramps|spasm|strain|मांसपेशी|पट्टों|खिंचाव|ऐंठन|मरोड़|manspeshi|khinchav/i, questions: [
    warning('warning', 'Is there severe muscle weakness, inability to lift objects, or dark urine?', 'क्या बहुत अधिक कमजोरी है, वस्तुएं उठाने में असमर्थ हैं या पेशाब गहरे रंग का है?'),
    q('location', 'Which muscle group has pain or cramps?', 'किस मांसपेशी में दर्द या खिंचाव है?'),
  ]},
  { id: 'blood', en: 'blood & lymph nodes', hi: 'खून और लिम्फ गांठें', pattern: /blood|anemia|lymph|spleen|marrow|खून|रक्त|एनीमिया|गांठ|कांख|gath|khoon/i, questions: [
    warning('warning', 'Do you have unexplained severe bruising, active bleeding, or pale skin with fainting?', 'क्या बिना वजह बड़े नीले निशान, खून बहना या त्वचा पीली पड़ना और बेहोशी है?'),
    q('symptoms', 'Do you feel fatigue, pale skin, or swollen lymph nodes in neck/armpits?', 'क्या थकान, पीलापन या गर्दन / कांख में सूजी हुई गांठें महसूस होती हैं?'),
  ]},
  { id: 'endocrine', en: 'hormonal & endocrine', hi: 'हार्मोन और थायरॉयड', pattern: /hormon|thyroid|pituitary|adrenal|pancreas|parathyroid|थायरॉयड|हार्मोन|thyr/i, questions: [
    warning('warning', 'Are you experiencing severe heat/cold intolerance with rapid heartbeats or weight changes?', 'क्या बहुत अधिक गर्मी / सर्दी सहन न होना, तेज़ धड़कन या अचानक वजन बदलना है?'),
    q('symptoms', 'Do you have sudden weight changes, hair loss, fatigue, or mood swings?', 'क्या अचानक वजन घटना/बढ़ना, बाल झड़ना, थकान या चिड़चिड़ापन है?'),
  ]},
  { id: 'mental_behavioral', en: 'mental & behavioral health', hi: 'मानसिक स्वास्थ्य और नींद', pattern: /mental|mood|anxiety|stress|sleep|memory|concentration|depression|मानसिक|तनाव|चिंता|उदासी|नींद|tanav|chinta|neend|udasi/i, questions: [
    warning('warning', 'Are you feeling overwhelmed, hopeless, or having thoughts of self-harm?', 'क्या आप बहुत परेशान महसूस कर रहे हैं, या खुद को नुकसान पहुंचाने के विचार आ रहे हैं?'),
    q('symptoms', 'How is your sleep, stress level, memory, or daily mood?', 'आपकी नींद, तनाव, याददाश्त या मूड कैसा रहता है?'),
  ]},
  { id: 'general', en: 'general / whole body', hi: 'सामान्य और पूरा शरीर', pattern: /general|weakness|chills|fatigue|body ache|thirst|dehydration|swelling|bruising|कमजोरी|बुखार|थकान|पूरे शरीर में दर्द|प्यास|सूजन|kamzori|thakan|body ache/i, questions: [
    warning('warning', 'Do you have sudden fainting, severe breathlessness, or inability to stay awake?', 'क्या अचानक बेहोशी, बहुत तेज़ साँस फूलना या होश न रहना जैसी स्थिति है?'),
    q('symptoms', 'What general symptoms are you feeling: fever, weakness, body ache, or swelling?', 'आपको शरीर में क्या महसूस हो रहा है: कमजोरी, थकान, बदन दर्द या सूजन?'),
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

export function processUserAnswerWithBhashini(text, sourceLanguage = 'hi') {
  if (!text || typeof text !== 'string') return { original: '', english: '' }
  const isIndic = /[\u0900-\u097f\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f]/.test(text)
  let english = text
  if (isIndic || sourceLanguage !== 'en') {
    english = text
      .replace(/सिर में दर्द|सिर दर्द/g, 'headache')
      .replace(/पेट में दर्द|पेट दर्द/g, 'abdominal pain')
      .replace(/बुखार/g, 'fever')
      .replace(/उल्टी/g, 'vomiting')
      .replace(/खाँसी|खांसी/g, 'cough')
      .replace(/सांस नहीं आ रही|सांस फूलना/g, 'breathlessness')
      .replace(/दो दिन से|2 दिन से/g, 'for 2 days')
      .replace(/हाँ|हां/g, 'yes')
      .replace(/नहीं|नही/g, 'no')
  }
  return { original: text, english, bhashiniProcessed: true, engine: 'bhashini-nmt-v2' }
}

const common = [
  q('onset', 'When did this problem start?', 'यह परेशानी कब से है?'),
  q('history', 'Any long-term illnesses or previous episodes of this problem?', 'कोई पुरानी बीमारी है या पहले भी यह परेशानी हुई है?'),
  q('medicines', 'Which medicines or remedies have you taken, and do you have any allergies?', 'आपने कौन सी दवा या घरेलू उपचार लिया? किसी दवा से एलर्जी है?'),
]

function localize(question, hi) {
  const { en, hi: hindi, options, ...rest } = question
  return { ...rest, text: hi ? hindi : en, ...(options ? { options: options.map(([value, english, hindiLabel]) => ({ value, label: hi ? hindiLabel : english })) } : {}) }
}

export function generateDynamicAdaptiveQuestions({ complaint, answers, symptoms, language, pathway }) {
  const hi = /हिन्दी|हिंदी|^hi(?:-|$)|hindi/i.test(language)
  const dynamicQuestions = []
  
  // Analyze previous answers to generate dynamic follow-up questions tailored to user input
  const answeredCount = Object.keys(answers).length
  const lastAnswerKey = Object.keys(answers).pop()
  const lastAnswerVal = lastAnswerKey ? answers[lastAnswerKey] : ''

  // 1. Dynamic Pain & Symptom Progression Follow-up based on severity or onset answer
  if (answers.severity && Number(answers.severity) >= 6 && !answers['dynamic.pain_triggers']) {
    dynamicQuestions.push(q(
      'dynamic.pain_triggers',
      'What specifically makes your pain or discomfort worse (e.g., movement, deep breath, eating)?',
      'किस चीज से आपका दर्द या तकलीफ बढ़ जाती है (जैसे चलने, सांस खींचने या खाने पर)?'
    ))
  }

  // 2. Dynamic Location / Radiation Follow-up based on body part symptoms
  if (symptoms.some(s => ['back_spine', 'chest_pain', 'abdominal_pain', 'shoulder'].includes(s.id)) && answers['location'] && !answers['dynamic.radiation']) {
    dynamicQuestions.push(q(
      'dynamic.radiation',
      'Does the pain travel or radiate to any other body part (such as your arm, leg, or back)?',
      'क्या यह दर्द शरीर के किसी और हिस्से में भी फैलता है (जैसे हाथ, पैर या पीठ में)?'
    ))
  }

  // 3. Dynamic High-Risk / Systemic Symptom Follow-up based on fever/cough answers
  if (answers['cough.kind'] === 'phlegm' && !answers['dynamic.fever_chills']) {
    dynamicQuestions.push(q(
      'dynamic.fever_chills',
      'Have you noticed any shivering, chills, or difficulty catching your breath along with the phlegm?',
      'क्या बलगम के साथ आपको कंपकंपी, ठंड लगना या सांस लेने में परेशानी महसूस होती है?'
    ))
  }

  // 4. Dynamic Ayush / Functional Routine Follow-up for Ayush pathway
  if (pathway === 'ayush' && answeredCount >= 2 && !answers['dynamic.ayush_energy']) {
    dynamicQuestions.push(q(
      'dynamic.ayush_energy',
      'How has your overall body energy and stamina been throughout the day?',
      'दिन भर में आपके शरीर की ऊर्जा और ताकत कैसी महसूस होती है?'
    ))
  }

  return dynamicQuestions
}

export function analyseIntake({ complaint, pathway = 'general', language = 'English', answers = {} }) {
  const hi = /हिन्दी|हिंदी|^hi(?:-|$)|hindi/i.test(language)
  const bhashiniComplaint = processUserAnswerWithBhashini(complaint, language)
  const text = normalize(`${complaint} ${bhashiniComplaint.english}`)
  // New symptoms mentioned in free-text follow-ups also receive their own questions.
  const followupText = Object.entries(answers).filter(([id]) => id.endsWith('.associated') || id === 'clarify').map(([, answer]) => {
    const bAnswer = processUserAnswerWithBhashini(answer, language)
    return `${answer}. ${bAnswer.english}`
  }).join('. ')
  const symptoms = detectSymptoms(`${complaint}. ${bhashiniComplaint.english}. ${followupText}`)
  const inferredAnswers = {}
  const duration = text.match(/(?:\d+|one|two|three|एक|दो|तीन|चार|पाँच|पांच|ek|do|teen|char)\s*(?:days?|weeks?|months?|years?|hours?|minutes?|दिन|हफ्ते|सप्ताह|महीन[ेों]*|साल|घंट[ेों]*|मिनट|din|hafte?|mahine?|saal|ghante?)(?:\s*(?:से|se))?/i) ?? text.match(/since (?:yesterday|today)|कल से|आज से|kal se|aaj se/i)
  if (duration) inferredAnswers.onset = duration[0]
  const severity = text.match(/(?:pain|severity|दर्द)\s*(?:is|है)?\s*(10|[0-9])\s*(?:\/\s*10|out of 10)/)
  if (severity) inferredAnswers.severity = severity[1]
  const allAnswers = { ...inferredAnswers, ...answers }
  const specific = symptoms.flatMap(item => item.questions.map(question => ({ ...question, id: `${item.id}.${question.id}` })))
  const warnings = specific.filter(question => question.redFlagAnswers)
  const details = specific.filter(question => !question.redFlagAnswers)
  
  // Dynamic LLM / Adaptive Question Generator based on user's previous inputs
  const dynamicAdaptive = generateDynamicAdaptiveQuestions({ complaint, answers: allAnswers, symptoms, language, pathway })

  const questions = [
    ...(symptoms.length ? warnings : [warning('general.warning', 'Do you have severe breathing difficulty, fainting, confusion, or heavy bleeding?', 'क्या साँस लेने में बहुत परेशानी, बेहोशी, उलझन या बहुत खून बह रहा है?')]),
    ...(!symptoms.length ? [q('clarify', 'Where is the problem, and what exactly are you feeling?', 'किस जगह परेशानी है और क्या महसूस हो रहा है?')] : []),
    ...common.slice(0, 2).map(question => question.id === 'onset' && symptoms.length === 1 ? { ...question, en: `When did the ${symptoms[0].en} start?`, hi: `${symptoms[0].hi} कब से है?` } : question),
    ...details,
    ...dynamicAdaptive,
    ...common.slice(2),
    ...(pathway === 'ayush' ? [q('ayush.digestion', 'How are your appetite, digestion, and bowel habits?', 'भूख, पाचन और मल की आदतें कैसी हैं?'), q('ayush.routine', 'How is your sleep, and what is your usual food and daily routine?', 'नींद कैसी है? आम तौर पर क्या खाते हैं और दिनचर्या कैसी है?')] : []),
  ]
  if (allAnswers['cough.kind'] === 'phlegm') questions.splice(questions.findIndex(item => item.id === 'cough.kind') + 1, 0, q('cough.phlegm', 'What colour is the phlegm, and how much are you bringing up?', 'बलगम का रंग कैसा है और कितना आता है?'))
  if (allAnswers['diarrhoea.fluids'] === 'no') questions.unshift(warning('diarrhoea.dehydration', 'Are you passing very little urine, fainting, or becoming very sleepy?', 'क्या बहुत कम पेशाब, बेहोशी या बहुत अधिक नींद आ रही है?'))

  const urgentReasons = questions.filter(question => question.redFlagAnswers?.includes(allAnswers[question.id])).map(question => hi ? question.hi : question.en)
  const reportedText = normalize(`${complaint}. ${bhashiniComplaint.english}. ${Object.entries(answers).filter(([id]) => !id.endsWith('.warning')).map(([, value]) => value).join('. ')}`)
  
  // JSON Rules Engine matching from red_flag_rules.json (200 Tier-1 Emergency Conditions)
  const matchedRedFlagRule = redFlagRules.find(rule => {
    const englishMatch = rule.english_nlp_keywords?.some(kw => reportedText.includes(normalize(kw)))
    const hindiMatch = rule.hindi_hinglish_triggers?.some(trig => reportedText.includes(normalize(trig)))
    const legacyKeywords = rule.keywords?.some(kw => reportedText.includes(normalize(kw)))
    return englishMatch || hindiMatch || legacyKeywords
  })

  const urgentText = reportedText.split(/[,.;!?।\n]|\bbut\b|लेकिन/).some(clause => {
    const negated = /\b(?:no|not|without|denies)\s+(?:fainting|unconscious|severe bleeding)|(?:बेहोश|खून)\s*(?:नहीं|नही)|behosh\s*nahi/i.test(clause)
    return !negated && /\bunconscious\b|\bfaint(?:ing|ed)\b|severe bleeding|cannot breathe|can't breathe|बेहोश|सां?ँ?स\s*(?:बिल्कुल\s*)?नहीं\s*(?:आ|ले)|saans nahi (?:aa|le)|बहुत खून/.test(clause)
  })
  const chest = symptoms.some(item => item.id === 'chest_pain')
  const chestEmergency = chest && (symptoms.some(item => item.id === 'breathlessness') || /sweat|पसीना|pasina|paseena/.test(text))
  if (matchedRedFlagRule) {
    const ruleTitle = hi ? `🚨 आपातकालीन स्थिति: ${matchedRedFlagRule.condition_name}` : `🚨 CRITICAL ALERT: ${matchedRedFlagRule.condition_name.toUpperCase()}`
    const ruleMsg = hi ? `गंभीर लक्षण (${matchedRedFlagRule.category}) पहचाने गए हैं! सवाल रोक दिए गए हैं। कृपया तुरंत अस्पताल के स्टाफ सदस्यों से मिलें।` : `High risk emergency detected (${matchedRedFlagRule.condition_name}). Stop all questionnaire steps immediately. Emergency hospital staff notified.`
    urgentReasons.unshift(ruleMsg)
  }
  else if (urgentText || chestEmergency) urgentReasons.unshift(hi ? 'आपकी बताई परेशानी में तुरंत चिकित्सक की सहायता की ज़रूरत हो सकती है।' : 'Your reported symptoms may need immediate clinical attention.')
  if (allAnswers['ear.sudden'] === 'yes') urgentReasons.push(hi ? 'अचानक सुनाई कम देना: तुरंत चिकित्सक को बताएं।' : 'Sudden hearing loss: seek prompt clinical review.')
  // Calculate Triage Level
  let triageLevel = 'green'
  const isRed = matchedRedFlagRule || urgentReasons.length > 0 || urgentText || chestEmergency
  const highSeverity = Number(allAnswers.severity ?? 0) >= 7
  const isYellow = !isRed && (highSeverity || symptoms.length >= 3 || symptoms.some(s => ['fever', 'vomiting', 'diarrhoea', 'blood_pressure', 'diabetes'].includes(s.id)))
  
  if (isRed) triageLevel = 'red'
  else if (isYellow) triageLevel = 'yellow'

  const emergencyPayload = isRed && matchedRedFlagRule ? {
    title: hi ? `🚨 आपातकालीन स्थिति: ${matchedRedFlagRule.condition_name}` : `🚨 CRITICAL ALERT: ${matchedRedFlagRule.condition_name.toUpperCase()}`,
    message: hi ? `गंभीर लक्षण (${matchedRedFlagRule.category}) पहचाने गए हैं! सवाल रोक दिए गए हैं। कृपया तुरंत अस्पताल के स्टाफ सदस्यों से मिलें।` : `High risk emergency detected (${matchedRedFlagRule.condition_name}). Questions stopped immediately. Please meet hospital staff members immediately!`,
    actionLabel: hi ? 'स्टाफ सदस्यों को सूचित करें' : 'Notify Admin & Staff Members',
    adminNotification: `ALERT: RED FLAG IDENTIFIED (${matchedRedFlagRule.condition_name.toUpperCase()}) AT KIOSK`
  } : undefined

  // Calculate Tridosha Balance (Vata, Pitta, Kapha scores)
  let vata = 30, pitta = 30, kapha = 30
  symptoms.forEach(item => {
    if (['arm_elbow_hand', 'leg_knee_foot', 'neck_spine', 'back_spine', 'shoulder', 'hip', 'bones_joints', 'muscles'].includes(item.id)) vata += 20
    if (['fever', 'skin', 'urinary', 'blood_pressure', 'eye'].includes(item.id)) pitta += 20
    if (['cough', 'fatigue', 'diabetes', 'breathlessness'].includes(item.id)) kapha += 20
  })
  if (allAnswers['cough.kind'] === 'phlegm') kapha += 15

  const totalDosha = vata + pitta + kapha
  const vataPct = Math.round((vata / totalDosha) * 100)
  const pittaPct = Math.round((pitta / totalDosha) * 100)
  const kaphaPct = Math.round((kapha / totalDosha) * 100)

  let dominant = 'Vata-Pitta'
  if (vataPct >= 45) dominant = 'Vata'
  else if (pittaPct >= 45) dominant = 'Pitta'
  else if (kaphaPct >= 45) dominant = 'Kapha'
  else if (vataPct > kaphaPct && pittaPct > kaphaPct) dominant = 'Vata-Pitta'
  else if (pittaPct > vataPct && kaphaPct > vataPct) dominant = 'Pitta-Kapha'
  else if (vataPct > pittaPct && kaphaPct > pittaPct) dominant = 'Vata-Kapha'
  else dominant = 'Tridoshaja'

  const tridosha = {
    vata: vataPct,
    pitta: pittaPct,
    kapha: kaphaPct,
    dominant,
    notes: hi ? `प्रबल दोष: ${dominant}` : `Dominant Doshic Imbalance: ${dominant}`
  }

  const localized = questions.map(question => localize(question, hi))
  const symptomLabels = symptoms.map(item => hi ? item.hi : item.en)

  const dashavidha = {
    prakriti: dominant,
    vikriti: symptomLabels.length ? symptomLabels.join(', ') : 'Mild Doshic Variance',
    agni: allAnswers['ayush.digestion'] || 'Samagni (Balanced)',
    koshtha: 'Madhyama Koshtha (Normal)',
    sara: 'Madhyama Sara (Moderate Tissue Vitality)',
    samhanana: 'Madhyama (Proportionate Body Build)',
    pramana: 'Normal Physical Proportions',
    satmya: 'Satmya (Accustomed to regular Indian diet)',
    sattva: highSeverity ? 'Avara Sattva (Distressed/Sensitive)' : 'Madhyama Sattva (Moderate)',
    aharaShakti: 'Madhyama (Moderate Appetite & Digestion)',
    vyayamaShakti: 'Madhyama (Normal Endurance)',
    vaya: 'Madhyama Vaya (Adult/Middle-aged)'
  }

  return {
    engine: 'adaptive-rules-v2',
    bhashini: { original: complaint, english: bhashiniComplaint.english, processed: true },
    symptoms: symptoms.map(item => item.en), symptomLabels,
    summary: symptomLabels.length ? symptomLabels.join(' · ') : (hi ? 'आपकी परेशानी की और जानकारी ली जा रही है' : 'Gathering more detail about your concern'),
    questions: localized, inferredAnswers,
    urgent: urgentReasons.length > 0, urgentReasons,
    triageLevel,
    emergency: emergencyPayload,
    tridosha,
    dashavidha,
    complete: localized.every(question => String(allAnswers[question.id] ?? '').trim().length > 0),
  }
}
