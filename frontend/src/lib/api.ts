import type { PredictionResult } from './types'

export async function predict(file: File): Promise<PredictionResult> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/predict', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '识别失败' }))
    throw new Error(err.detail || '识别失败')
  }

  return res.json()
}
