import { useState, useCallback } from 'react'
import type { AppState, PredictionResult } from '../lib/types'
import { predict } from '../lib/api'

export function usePrediction() {
  const [state, setState] = useState<AppState>('idle')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string>('')

  const runPrediction = useCallback(async (file: File) => {
    setState('loading')
    setError('')
    try {
      const data = await predict(file)
      setResult(data)
      setState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '识别出了点小状况')
      setState('error')
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError('')
  }, [])

  return { state, result, error, runPrediction, reset }
}
