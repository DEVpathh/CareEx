import { appConfig } from '../core/config'
import type { ApiEnvelope } from '../types/clinical'

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), appConfig.requestTimeoutMs)
  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      signal: controller.signal,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new ApiError(error?.message ?? `Request failed (${response.status})`, response.status)
    }
    const body = (await response.json()) as ApiEnvelope<T> | T
    return typeof body === 'object' && body !== null && 'data' in body
      ? (body as ApiEnvelope<T>).data
      : body
  } finally {
    window.clearTimeout(timeout)
  }
}
