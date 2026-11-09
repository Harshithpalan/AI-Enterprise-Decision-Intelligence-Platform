<template>
  <div class="models-view">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>AI Model Management</h1>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            New Model
          </el-button>
        </div>
      </el-header>

      <el-main>
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <el-statistic title="Total Models" :value="models.length" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <el-statistic title="Active" :value="activeModels.length" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <el-statistic title="Training" :value="trainingModels.length" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <el-statistic title="Avg Accuracy" :value="avgAccuracy" :precision="2" suffix="%" />
            </el-card>
          </el-col>
        </el-row>

        <el-card class="models-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>Models</span>
              <el-input
                v-model="searchQuery"
                placeholder="Search models..."
                :prefix-icon="Search"
                style="width: 300px"
                clearable
              />
            </div>
          </template>

          <el-table :data="filteredModels" stripe style="width: 100%">
            <el-table-column prop="name" label="Name" min-width="200" />
            <el-table-column prop="type" label="Type" width="150">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" label="Accuracy" width="120">
              <template #default="{ row }">
                {{ row.accuracy ? `${(row.accuracy * 100).toFixed(1)}%` : 'N/A' }}
              </template>
            </el-table-column>
            <el-table-column prop="version" label="Version" width="100" />
            <el-table-column prop="updatedAt" label="Last Updated" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" :icon="View" @click="viewModel(row.id)" />
                  <el-button size="small" :icon="Edit" @click="editModel(row)" />
                  <el-button size="small" :icon="Delete" type="danger" @click="confirmDelete(row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog v-model="showCreateDialog" title="Create New Model" width="500px">
      <el-form :model="newModel" label-width="120px">
        <el-form-item label="Name">
          <el-input v-model="newModel.name" placeholder="Model name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newModel.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="newModel.type" placeholder="Select type">
            <el-option label="Classification" value="classification" />
            <el-option label="Regression" value="regression" />
            <el-option label="Clustering" value="clustering" />
            <el-option label="NLP" value="nlp" />
            <el-option label="Vision" value="vision" />
            <el-option label="Custom" value="custom" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreateModel" :loading="loading">
          Create
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete } from '@element-plus/icons-vue'
import { useModelStore } from '../stores/models'
import type { Model } from '../types/models'

const router = useRouter()
const modelStore = useModelStore()

const { models, loading, activeModels, trainingModels } = modelStore

const searchQuery = ref('')
const showCreateDialog = ref(false)
const newModel = ref<Partial<Model>>({
  name: '',
  description: '',
  type: 'classification',
  status: 'inactive',
  version: '1.0.0'
})

const filteredModels = computed(() => {
  if (!searchQuery.value) return models
  const query = searchQuery.value.toLowerCase()
  return models.filter(
    model =>
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.type.toLowerCase().includes(query)
  )
})

const avgAccuracy = computed(() => {
  const activeWithAccuracy = activeModels.value.filter(m => m.accuracy !== undefined)
  if (activeWithAccuracy.length === 0) return 0
  const total = activeWithAccuracy.reduce((sum, m) => sum + (m.accuracy || 0), 0)
  return (total / activeWithAccuracy.length) * 100
})

const getTypeTagType = (type: string) => {
  const types: Record<string, any> = {
    classification: 'primary',
    regression: 'success',
    clustering: 'warning',
    nlp: 'info',
    vision: 'danger',
    custom: ''
  }
  return types[type] || ''
}

const getStatusTagType = (status: string) => {
  const statuses: Record<string, any> = {
    active: 'success',
    training: 'warning',
    inactive: 'info',
    error: 'danger'
  }
  return statuses[status] || ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const viewModel = (id: string) => {
  router.push(`/models/${id}`)
}

const editModel = (model: Model) => {
  ElMessage.info('Edit functionality coming soon')
}

const confirmDelete = (model: Model) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete model "${model.name}"?`,
    'Delete Model',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await modelStore.deleteModel(model.id)
      ElMessage.success('Model deleted successfully')
    } catch (error) {
      ElMessage.error('Failed to delete model')
    }
  })
}

const handleCreateModel = async () => {
  if (!newModel.value.name) {
    ElMessage.warning('Please enter a model name')
    return
  }

  try {
    await modelStore.createModel({
      ...newModel.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    ElMessage.success('Model created successfully')
    showCreateDialog.value = false
    newModel.value = {
      name: '',
      description: '',
      type: 'classification',
      status: 'inactive',
      version: '1.0.0'
    }
  } catch (error) {
    ElMessage.error('Failed to create model')
  }
}

onMounted(() => {
  modelStore.fetchModels()
})
</script>

<style scoped>
.models-view {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.models-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
