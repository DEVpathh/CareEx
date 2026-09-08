// The intake engine chooses the urgency. This contract makes every client stop
// for red/yellow triage and preserves that decision for the whole visit.
export function stopForTriage(analysis, language, previousLevel) {
  // Preserve the app's existing >=7/10 priority-review threshold. This is an
  // application rule, not a validated implementation of the WHO triage tool.
  const severity = Number(analysis.answers?.severity ?? analysis.inferredAnswers?.severity ?? 0)
  const priority = severity >= 7 && severity <= 10
  const level = analysis.urgent || analysis.triageLevel === 'red' || previousLevel === 'red' ? 'red' : priority || analysis.triageLevel === 'yellow' || previousLevel === 'yellow' ? 'yellow' : 'green'
  if (level === 'green') return { ...analysis, triageLevel: level, stopQuestionnaire: false }
  const hi = !/^english|^en\b/i.test(language ?? '')
  return { ...analysis, triageLevel: level, stopQuestionnaire: true, status: 'emergency', urgent: true, complete: false, questions: [], nextQuestion: null,
    emergency: analysis.emergency ?? { title: hi ? 'अब स्टाफ की मदद लें' : 'Please get staff assistance now', message: hi ? 'सवाल रोक दिए गए हैं। कृपया पास के स्टाफ को बुलाएं और उन्हें अपनी परेशानी बताएं।' : 'Questions have stopped. Please call nearby staff and tell them your concern.', actionLabel: hi ? 'स्टाफ को बुलाएं' : 'Request staff assistance' } }
}
