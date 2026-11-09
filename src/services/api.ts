import axios from 'axios'
import type { Model, InferenceRequest, InferenceResponse } from '../types/models'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const modelService = {
  getModels: async (): Promise<Model[]> => {
    const response = await api.get<Model[]>('/models')
    return response.data
  },

  getModel: async (id: string): Promise<Model> => {
    const response = await api.get<Model>(`/models/${id}`)
    return response.data
  },

  createModel: async (model: Partial<Model>): Promise<Model> => {
    const response = await api.post<Model>('/models', model)
    return response.data
  },

  updateModel: async (id: string, model: Partial<Model>): Promise<Model> => {
    const response = await api.put<Model>(`/models/${id}`, model)
    return response.data
  },

  deleteModel: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`)
  },

  runInference: async (request: InferenceRequest): Promise<InferenceResponse> => {
    const response = await api.post<InferenceResponse>('/inference', request)
    return response.data
  }
}

export default api
