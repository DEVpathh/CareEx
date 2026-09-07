import { useCallback, useEffect, useRef, useState } from 'react'

type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>; resultIndex: number }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void; abort: () => void
}
type RecognitionWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
export type VoiceStatus = 'idle' | 'speaking' | 'listening'

export function useKioskVoice({ language, enabled, onTranscript }: { language: string; enabled: boolean; onTranscript: (text: string) => void }) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const recognition = useRef<Recognition | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const sequence = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const settings = useRef({ language, enabled, onTranscript })
  settings.current = { language, enabled, onTranscript }
  const hi = language !== 'English'

  const stop = useCallback(() => {
    sequence.current += 1
    clearTimeout(timer.current)
    if (recognition.current) {
      recognition.current.onend = null
      recognition.current.onresult = null
      recognition.current.onerror = null
      recognition.current.abort()
      recognition.current = null
    }
    if (utterance.current) { utterance.current.onend = null; utterance.current.onerror = null; utterance.current = null }
    window.speechSynthesis?.cancel()
    setStatus('idle'); setInterim('')
  }, [])

  const listen = useCallback(() => {
    stop(); setError('')
    const currentHi = settings.current.language !== 'English'
    const Ctor = (window as RecognitionWindow).SpeechRecognition ?? (window as RecognitionWindow).webkitSpeechRecognition
    if (!Ctor) { setError(currentHi ? 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। नीचे अपना जवाब लिखें।' : 'Voice recognition is unavailable in this browser. Enter your answer below.'); return }
    const instance = new Ctor()
    const current = sequence.current
    instance.lang = currentHi ? 'hi-IN' : 'en-IN'
    instance.continuous = false; instance.interimResults = true
    instance.onresult = event => {
      if (current !== sequence.current) return
      const results = Array.from(event.results)
      const text = results.map(result => result[0].transcript).join(' ').trim()
      setInterim(text)
      if (results.some(result => result.isFinal) && text) {
        stop()
        settings.current.onTranscript(text)
      }
    }
    instance.onerror = event => {
      if (current !== sequence.current || event.error === 'aborted') return
      const denied = ['not-allowed', 'service-not-allowed'].includes(event.error)
      setError(currentHi
        ? denied ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र में अनुमति दें या जवाब लिखें।' : event.error === 'no-speech' ? 'आवाज़ सुनाई नहीं दी। माइक दबाकर फिर कोशिश करें।' : 'आवाज़ पहचान नहीं हो पाई। कनेक्शन जांचें या जवाब लिखें।'
        : denied ? 'Microphone permission is blocked. Allow it in your browser or enter an answer.' : event.error === 'no-speech' ? 'No speech was heard. Press the microphone to try again.' : 'Voice recognition could not connect. Try again or enter an answer.')
      setStatus('idle')
    }
    instance.onend = () => { if (current === sequence.current) { recognition.current = null; setStatus('idle'); setInterim('') } }
    recognition.current = instance
    try { instance.start(); setStatus('listening') } catch { recognition.current = null; setStatus('idle'); setError(currentHi ? 'माइक शुरू नहीं हुआ। फिर कोशिश करें।' : 'The microphone could not start. Try again.') }
  }, [stop])

  const speak = useCallback((text: string, listenAfter = false) => {
    stop(); setError('')
    if (!settings.current.enabled || !text) return
    const currentHi = settings.current.language !== 'English'
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setError(currentHi ? 'इस ब्राउज़र में ऑडियो उपलब्ध नहीं है। स्क्रीन पर सवाल पढ़ें।' : 'Audio is unavailable in this browser. Read the question on screen.'); return
    }
    const current = sequence.current
    const message = new SpeechSynthesisUtterance(text)
    const prefix = currentHi ? 'hi' : 'en'
    message.lang = currentHi ? 'hi-IN' : 'en-IN'
    message.rate = currentHi ? 0.9 : 0.95
    const voices = window.speechSynthesis.getVoices()
    const selected = voices.find(voice => voice.lang === message.lang) ?? voices.find(voice => voice.lang.startsWith(prefix))
    if (selected) message.voice = selected
    message.onend = () => {
      if (current !== sequence.current) return
      utterance.current = null; setStatus('idle')
      clearTimeout(timer.current)
      if (listenAfter) timer.current = setTimeout(() => { if (current === sequence.current) listen() }, 300)
    }
    message.onerror = event => {
      if (current !== sequence.current || event.error === 'interrupted' || event.error === 'canceled') return
      clearTimeout(timer.current); setStatus('idle'); utterance.current = null
      setError(currentHi ? 'हिन्दी आवाज़ नहीं चल पाई। डिवाइस में हिन्दी voice जोड़ें या नीचे जवाब लिखें।' : 'Audio could not play. Check the device voice settings or enter your answer.')
    }
    utterance.current = message
    setStatus('speaking')
    window.speechSynthesis.resume()
    window.speechSynthesis.speak(message)
    timer.current = setTimeout(() => { if (current === sequence.current) { stop(); setError(currentHi ? 'आवाज़ रुक गई। सवाल फिर सुनें या जवाब लिखें।' : 'Audio timed out. Replay the question or enter your answer.') } }, 45000)
  }, [listen, stop])

  useEffect(() => { stop(); setError('') }, [language, enabled, stop])
  useEffect(() => () => { sequence.current += 1; clearTimeout(timer.current); recognition.current?.abort(); window.speechSynthesis?.cancel() }, [])
  return { status, interim, error, speak, listen, stop, clearError: () => setError(''), hi }
}
