<template>
  <div class="model-detail-view">
    <el-container>
      <el-header>
        <div class="header-content">
          <el-button :icon="ArrowLeft" @click="goBack">Back</el-button>
          <h1 v-if="model">{{ model.name }}</h1>
          <el-skeleton v-else :rows="1" animated />
        </div>
      </el-header>

      <el-main v-loading="loading">
        <template v-if="model">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-card class="detail-card">
                <template #header>
                  <span>Model Information</span>
                </template>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="ID">{{ model.id }}</el-descriptions-item>
                  <el-descriptions-item label="Version">{{ model.version }}</el-descriptions-item>
                  <el-descriptions-item label="Type">
                    <el-tag :type="getTypeTagType(model.type)">{{ model.type }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="Status">
                    <el-tag :type="getStatusTagType(model.status)">{{ model.status }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="Created At">
                    {{ formatDate(model.createdAt) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Updated At">
                    {{ formatDate(model.updatedAt) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Description" :span="2">
                    {{ model.description || 'No description' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>

              <el-card class="detail-card">
                <template #header>
                  <span>Performance Metrics</span>
                </template>
                <el-empty v-if="!model.metrics" description="No metrics available" />
                <div v-else class="metrics-grid">
                  <div v-for="(value, key) in model.metrics" :key="key" class="metric-item">
                    <div class="metric-label">{{ formatMetricKey(key) }}</div>
                    <div class="metric-value">{{ formatMetricValue(key, value) }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="action-card">
                <template #header>
                  <span>Actions</span>
                </template>
                <el-space direction="vertical" style="width: 100%" :size="12">
                  <el-button type="primary" :icon="MagicStick" @click="runInference" block>
                    Run Inference
                  </el-button>
                  <el-button :icon="Edit" @click="editModel" block>
                    Edit Model
                  </el-button>
                  <el-button :icon="Download" @click="exportModel" block>
                    Export Model
                  </el-button>
                  <el-button :icon="Refresh" @click="refreshModel" block>
                    Refresh
                  </el-button>
                  <el-button type="danger" :icon="Delete" @click="confirmDelete" block>
                    Delete Model
                  </el-button>
                </el-space>
              </el-card>

              <el-card class="action-card">
                <template #header>
                  <span>Quick Stats</span>
                </template>
                <el-statistic title="Accuracy" :value="model.accuracy ? (model.accuracy * 100).toFixed(1) : 'N/A'" suffix="%" />
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  MagicStick,
  Edit,
  Download,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import { useModelStore } from '../stores/models'
import type { Model } from '../types/models'

const router = useRouter()
const route = useRoute()
const modelStore = useModelStore()

const { loading, selectedModel: model } = modelStore

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
  return new Date(date).toLocaleString()
}

const formatMetricKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const formatMetricValue = (key: string, value: number) => {
  if (key.toLowerCase().includes('accuracy') || key.toLowerCase().includes('precision') || key.toLowerCase().includes('recall') || key.toLowerCase().includes('f1')) {
    return `${(value * 100).toFixed(2)}%`
  }
  return value.toFixed(4)
}

const goBack = () => {
  router.push('/models')
}

const runInference = () => {
  router.push('/inference')
}

const editModel = () => {
  ElMessage.info('Edit functionality coming soon')
}

const exportModel = () => {
  ElMessage.info('Export functionality coming soon')
}

const refreshModel = () => {
  modelStore.fetchModel(route.params.id as string)
}

const confirmDelete = () => {
  if (!model.value) return

  ElMessageBox.confirm(
    `Are you sure you want to delete model "${model.value.name}"?`,
    'Delete Model',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await modelStore.deleteModel(model.value!.id)
      ElMessage.success('Model deleted successfully')
      router.push('/models')
    } catch (error) {
      ElMessage.error('Failed to delete model')
    }
  })
}

onMounted(() => {
  modelStore.fetchModel(route.params.id as string)
})
</script>

<style scoped>
.model-detail-view {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.detail-card {
  margin-bottom: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.metric-item {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
</style>
