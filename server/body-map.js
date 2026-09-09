// Location labels and concern wording are owned by the backend; the client only
// draws hit targets. Selection records location, never a diagnosis or severity.
const location = (id,en,hi,concern) => ({id,en,hi,concern})
export const bodyLocations = [
  location('head','Head','सिर','head pain'), location('neck','Neck','गर्दन','pain in the neck'),
  location('chest','Chest','छाती','chest pain'), location('abdomen','Tummy','पेट','abdominal pain'),
  location('upper_back','Upper back','ऊपरी पीठ','upper back pain'),location('mid_back','Middle back','बीच की पीठ','middle back pain'),location('lower_back','Lower back','निचली पीठ','lower back pain'),location('buttocks','Bottom','नितंब','pain in the buttocks'),
  ...[['shoulder','Shoulder','कंधा'],['arm','Arm','बाँह'],['hand','Hand','हाथ'],['thigh','Thigh','जांघ'],['knee','Knee','घुटना'],['calf','Lower leg','पिंडली'],['foot','Foot','पैर']].flatMap(([id,en,hi])=>[
    location(`left_${id}`,`Left ${en.toLowerCase()}`,`बायाँ ${hi}`,`pain in the left ${id==='calf'?'calf':id}`),
    location(`right_${id}`,`Right ${en.toLowerCase()}`,`दायाँ ${hi}`,`pain in the right ${id==='calf'?'calf':id}`)
  ])
]
export function bodyMapContext(ids = [], complaint = '') {
  if (!Array.isArray(ids) || ids.length > bodyLocations.length || ids.some(id=>typeof id!=='string'||!bodyLocations.some(item=>item.id===id))) throw new Error('Choose a location shown on the body map.')
  const selected = [...new Set(ids)].map(id=>bodyLocations.find(item=>item.id===id))
  const description = selected.map(item=>item.concern).join('; ')
  const text = description && !complaint.includes(description) ? [complaint,description].filter(Boolean).join('. ') : complaint
  return { ids: selected.map(item=>item.id), description, complaint: text }
}
export function applyBodyLocations(analysis, context, submittedAnswers = {}) {
  if (!context.ids.length) return { ...analysis, bodyLocations: [], complaint: context.complaint }
  const inferredAnswers = { ...analysis.inferredAnswers, clarify: context.description }
  const answers = { ...inferredAnswers, ...(analysis.answers ?? submittedAnswers) }
  const nextQuestion = analysis.questions.find(q=>!String(answers[q.id]??'').trim()) ?? null
  return { ...analysis, bodyLocations: context.ids, complaint: context.complaint, inferredAnswers, nextQuestion: analysis.stopQuestionnaire||analysis.urgent ? null : nextQuestion, complete: !analysis.urgent && !analysis.stopQuestionnaire && !nextQuestion }
}
