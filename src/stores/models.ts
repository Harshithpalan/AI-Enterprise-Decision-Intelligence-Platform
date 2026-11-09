import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Model } from '../types/models'
import { modelService } from '../services/api'

export const useModelStore = defineStore('models', () => {
  const models = ref<Model[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedModel = ref<Model | null>(null)

  const activeModels = computed(() =>
    models.value.filter(model => model.status === 'active')
  )

  const trainingModels = computed(() =>
    models.value.filter(model => model.status === 'training')
  )

  const fetchModels = async () => {
    loading.value = true
    error.value = null
    try {
      models.value = await modelService.getModels()
    } catch (err) {
      error.value = 'Failed to fetch models'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchModel = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      selectedModel.value = await modelService.getModel(id)
    } catch (err) {
      error.value = 'Failed to fetch model'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createModel = async (model: Partial<Model>) => {
    loading.value = true
    error.value = null
    try {
      const newModel = await modelService.createModel(model)
      models.value.push(newModel)
      return newModel
    } catch (err) {
      error.value = 'Failed to create model'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateModel = async (id: string, model: Partial<Model>) => {
    loading.value = true
    error.value = null
    try {
      const updatedModel = await modelService.updateModel(id, model)
      const index = models.value.findIndex(m => m.id === id)
      if (index !== -1) {
        models.value[index] = updatedModel
      }
      if (selectedModel.value?.id === id) {
        selectedModel.value = updatedModel
      }
      return updatedModel
    } catch (err) {
      error.value = 'Failed to update model'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteModel = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await modelService.deleteModel(id)
      models.value = models.value.filter(m => m.id !== id)
      if (selectedModel.value?.id === id) {
        selectedModel.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete model'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setSelectedModel = (model: Model | null) => {
    selectedModel.value = model
  }

  return {
    models,
    loading,
    error,
    selectedModel,
    activeModels,
    trainingModels,
    fetchModels,
    fetchModel,
    createModel,
    updateModel,
    deleteModel,
    setSelectedModel
  }
})
