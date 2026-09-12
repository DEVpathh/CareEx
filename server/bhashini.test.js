import assert from 'node:assert/strict'
import test from 'node:test'
import { createApp } from './app.js'

async function withServer(run) {
  const server = createApp().listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
  try { await run(`http://127.0.0.1:${server.address().port}`) }
  finally { await new Promise(resolve => server.close(resolve)) }
}

const json = async (base, route, body, method = 'POST') => {
  const response = await fetch(`${base}/api/v1${route}`, { method, headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  return { status: response.status, ...(await response.json()) }
}

test('Bhashini Model Registry endpoint returns all 14 task categories', () => withServer(async base => {
  const { status, data } = await json(base, '/bhashini/models', null, 'GET')
  assert.equal(status, 200)
  assert.ok(data.registry.ASR)
  assert.ok(data.registry.NMT)
  assert.ok(data.registry.Transliteration)
  assert.ok(data.registry.TTS)
  assert.ok(data.registry.AudioLangDetection)
  assert.ok(data.registry.TextLangDetection)
  assert.ok(data.registry.NER)
  assert.ok(data.registry.OCR)
  assert.ok(data.registry.SpeakerVerification)
  assert.ok(data.registry.SpeakerDiarization)
  assert.ok(data.registry.LanguageDiarization)
  assert.ok(data.registry.VoiceCloning)
  assert.ok(data.registry.LipSync)
  assert.ok(data.registry.KWS)
  assert.ok(data.pipelines)
}))

test('Bhashini Translation API processes requests cleanly', () => withServer(async base => {
  const { status, data } = await json(base, '/bhashini/translate', { text: 'Hello doctor, I have a fever', sourceLanguage: 'en', targetLanguage: 'hi' }, 'POST')
  assert.equal(status, 200)
  assert.ok(data.translatedText)
  assert.ok(data.serviceId)
}))

test('Bhashini Text Language Detection returns language details', () => withServer(async base => {
  const { status, data } = await json(base, '/bhashini/text-lang-detection', { text: 'मुझे दो दिन से सिर में दर्द है' }, 'POST')
  assert.equal(status, 200)
  assert.ok(data.detectedLanguage)
}))
