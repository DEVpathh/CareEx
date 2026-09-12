// The intake engine chooses the urgency. This contract makes every client stop
// for red/yellow triage and preserves that decision for the whole visit.
export function stopForTriage(analysis, language, previousLevel) {
  const level = analysis.urgent || analysis.triageLevel === 'red' || previousLevel === 'red' ? 'red' : analysis.triageLevel === 'yellow' || previousLevel === 'yellow' ? 'yellow' : 'green'
  if (level === 'green') return { ...analysis, triageLevel: level, stopQuestionnaire: false }
  const hi = !/^english|^en\b/i.test(language ?? '')
  return {
    ...analysis,
    triageLevel: level,
    stopQuestionnaire: true,
    status: 'emergency',
    urgent: true,
    complete: false,
    questions: [],
    nextQuestion: null,
    emergency: analysis.emergency ?? {
      title: hi ? '🚨 ध्यान दें: गंभीर स्थिति वाला मरीज!' : '🚨 CRITICAL ALERT: SERIOUS PATIENT IDENTIFIED',
      message: hi ? 'आपके लक्षणों में रेड-फ्लैग (गंभीर स्थिति) पाई गई है! सवाल रोक दिए गए हैं। कृपया तुरंत अस्पताल के स्टाफ सदस्यों से मिलें।' : 'Emergency Red Flag Identified! Questions have been stopped. Admin/Staff have been notified. Please meet hospital staff members immediately!',
      actionLabel: hi ? 'स्टाफ सदस्यों को सूचित करें' : 'Notify Admin & Staff Members',
      adminNotification: 'ALERT: A SERIOUS PATIENT HAS BEEN IDENTIFIED AT THE KIOSK'
    }
  }
}
