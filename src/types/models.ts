export interface Model {
  id: string
  name: string
  description: string
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'vision' | 'custom'
  status: 'active' | 'training' | 'inactive' | 'error'
  accuracy?: number
  version: string
  createdAt: string
  updatedAt: string
  metrics?: ModelMetrics
}

export interface ModelMetrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  mae?: number
  mse?: number
  rmse?: number
  customMetrics?: Record<string, number>
}

export interface InferenceRequest {
  modelId: string
  input: Record<string, any>
  parameters?: Record<string, any>
}

export interface InferenceResponse {
  prediction: any
  confidence?: number
  processingTime: number
  timestamp: string
}
