import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
let recognizer: GestureRecognizer | null = null
const scope = globalThis as unknown as { onmessage: ((event:MessageEvent) => void) | null; postMessage: (message:unknown) => void }
scope.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const files = await FilesetResolver.forVisionTasks(`${data.origin}/gesture-runtime/wasm`, true)
      recognizer = await GestureRecognizer.createFromOptions(files, {
        baseOptions: { modelAssetPath: `${data.origin}/gesture-runtime/gesture_recognizer.task`, delegate: 'CPU' },
        canvas: new OffscreenCanvas(320,240), runningMode: 'VIDEO', numHands: 1,
        minHandDetectionConfidence: .65, minHandPresenceConfidence: .65, minTrackingConfidence: .65,
      })
      scope.postMessage({ type: 'ready' })
    } catch { scope.postMessage({ type: 'error', message: 'Hand controls could not load. You can still tap the screen.' }) }
  }
  if (data.type === 'frame') {
    try {
      if (!recognizer) return
      const result = recognizer.recognizeForVideo(data.frame, data.timestamp)
      const gesture = result.gestures[0]?.[0]
      scope.postMessage({ type: 'result', gesture: gesture?.categoryName ?? 'None', confidence: gesture?.score ?? 0, landmarks: result.landmarks[0] ?? [], timestamp: data.timestamp })
    } catch { scope.postMessage({ type: 'error', message: 'Hand tracking stopped. Retry or use touch.' }) }
    finally { data.frame.close() }
  }
}
