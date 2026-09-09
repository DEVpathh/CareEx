import { mkdir, cp, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const root = new URL('../',import.meta.url)
const target = new URL('public/gesture-runtime/',root)
await mkdir(target,{recursive:true})
await cp(new URL('node_modules/@mediapipe/tasks-vision/wasm/',root),new URL('wasm/',target),{recursive:true})
const modelPath = new URL('gesture_recognizer.task',target)
const source = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'
let model
try { model = await readFile(modelPath) } catch {
  const response = await fetch(source,{signal:AbortSignal.timeout(60000)})
  if(!response.ok)throw new Error(`Gesture model download failed (${response.status}). Retry npm run prepare:gestures with internet access.`)
  model=Buffer.from(await response.arrayBuffer())
}
if(createHash('sha256').update(model).digest('hex')!=='97952348cf6a6a4915c2ea1496b4b37ebabc50cbbf80571435643c455f2b0482')throw new Error('Gesture model checksum mismatch. Re-download the pinned model.');
if(model.length<1_000_000 || model.length>20_000_000)throw new Error('Unexpected gesture model size.')
await writeFile(modelPath,model)
console.log(`Gesture assets ready: ${fileURLToPath(target)}; model SHA256 ${createHash('sha256').update(model).digest('hex')}`)
