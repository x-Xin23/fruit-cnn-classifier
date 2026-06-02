export interface PredictionResult {
  fruit_en: string
  fruit_zh: string
  confidence: number
  emoji: string
  nutrition: {
    calories: string
    vitamin_c: string
    fiber: string
    benefits: string[]
    description: string
  }
  top3: {
    name_en: string
    name_zh: string
    confidence: number
  }[]
}

export type AppState = 'idle' | 'loading' | 'result' | 'error'
