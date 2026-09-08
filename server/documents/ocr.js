import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
const run = promisify(execFile)
export function decodeImage(value) {
  const match = typeof value === 'string' && /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match || match[2].length > 7_000_000) throw new Error('A camera JPEG/PNG under 5 MB is required.')
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length < 32 || !(match[1] === 'png' ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255)) throw new Error('Invalid camera image.')
  return { buffer, mime: `image/${match[1]}`, base64: match[2] }
}
export function createOcr({ env = process.env, fetchImpl = fetch } = {}) {
  const cloud = Boolean(env.GOOGLE_CLOUD_VISION_API_KEY)
  return {
    status: { available: cloud || process.platform === 'darwin', provider: cloud ? 'google-vision' : process.platform === 'darwin' ? 'apple-vision' : 'unconfigured', handwriting: cloud, reviewRequired: true },
    async recognize(image) {
      const { buffer, base64 } = decodeImage(image)
      if (cloud) {
        const response = await fetchImpl('https://vision.googleapis.com/v1/images:annotate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.GOOGLE_CLOUD_VISION_API_KEY }, body: JSON.stringify({ requests: [{ image: { content: base64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }] }), signal: AbortSignal.timeout(45000) })
        if (!response.ok) throw new Error('Cloud OCR unavailable. Retake or keep the scan for doctor review.')
        const data = (await response.json()).responses?.[0]
        if (!data || data.error) throw new Error('Cloud OCR could not read this scan.')
        const annotation = data.fullTextAnnotation
        const lines = annotation?.pages?.flatMap(page => page.blocks?.flatMap(block => block.paragraphs?.map(p => ({ text: p.words?.map(w => w.symbols?.map(s => s.text).join('')).join(' '), confidence: p.confidence ?? 0 })) ?? []) ?? []) ?? []
        return { text: annotation?.text ?? '', lines, provider: 'google-vision', languages: [] }
      }
      if (process.platform !== 'darwin') throw new Error('OCR is not configured. The camera scan can still be saved for doctor review.')
      const dir = await mkdtemp(join(tmpdir(), 'carex-ocr-'))
      try {
        const path = join(dir, 'capture.png'); await writeFile(path, buffer, { mode: 0o600 })
        const { stdout } = await run('/usr/bin/swift', ['-module-cache-path', join(tmpdir(), 'carex-swift-cache'), fileURLToPath(new URL('./ocr.swift', import.meta.url)), path], { timeout: 120000, maxBuffer: 2_000_000 })
        return { ...JSON.parse(stdout), provider: 'apple-vision' }
      } finally { await rm(dir, { recursive: true, force: true }) }
    }
  }
}
