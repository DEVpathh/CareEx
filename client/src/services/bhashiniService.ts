import { appRoutes } from '../app/app.routes'
import { apiRequest } from './apiClient'

export interface BhashiniASRResponse {
  transcript: string
  serviceId: string
  engine?: string
  fallback?: boolean
}

export interface BhashiniTTSResponse {
  audioContent: string | null
  audioFormat: string
  serviceId: string
  engine?: string
  fallback?: boolean
}

export interface BhashiniTranslateResponse {
  translatedText: string
  serviceId: string
  engine?: string
  fallback?: boolean
}

export interface BhashiniTransliterateResponse {
  transliteratedText: string
  suggestions: string[]
  serviceId: string
  engine?: string
  fallback?: boolean
}

export function requestBhashiniASR(audioBase64: string, language = 'hi'): Promise<BhashiniASRResponse> {
  return apiRequest<BhashiniASRResponse>(appRoutes.bhashiniASR, {
    method: 'POST',
    body: JSON.stringify({ audioBase64, language }),
  })
}

export function requestBhashiniTTS(text: string, language = 'hi', gender = 'female'): Promise<BhashiniTTSResponse> {
  return apiRequest<BhashiniTTSResponse>(appRoutes.bhashiniTTS, {
    method: 'POST',
    body: JSON.stringify({ text, language, gender }),
  })
}

export function requestBhashiniTranslate(text: string, sourceLanguage = 'en', targetLanguage = 'hi'): Promise<BhashiniTranslateResponse> {
  return apiRequest<BhashiniTranslateResponse>(appRoutes.bhashiniTranslate, {
    method: 'POST',
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  })
}

export function requestBhashiniTransliterate(text: string, sourceLanguage = 'en', targetLanguage = 'hi'): Promise<BhashiniTransliterateResponse> {
  return apiRequest<BhashiniTransliterateResponse>(appRoutes.bhashiniTransliterate, {
    method: 'POST',
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  })
}
