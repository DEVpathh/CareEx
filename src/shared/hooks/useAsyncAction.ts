import { useCallback, useState } from 'react'

export function useAsyncAction<TArgs extends unknown[], TResult>(action: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const execute = useCallback(async (...args: TArgs) => {
    setLoading(true)
    setError(null)
    try {
      return await action(...args)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unexpected request error'
      setError(message)
      throw cause
    } finally {
      setLoading(false)
    }
  }, [action])
  return { execute, loading, error }
}
