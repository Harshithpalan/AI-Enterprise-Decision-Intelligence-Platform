<template>
  <div class="inference-view">
    <el-container>
      <el-header>
        <h1>Model Inference</h1>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="input-card">
              <template #header>
                <span>Input Configuration</span>
              </template>

              <el-form :model="inferenceForm" label-width="120px">
                <el-form-item label="Select Model">
                  <el-select
                    v-model="inferenceForm.modelId"
                    placeholder="Choose a model"
                    style="width: 100%"
                    @change="onModelChange"
                  >
                    <el-option
                      v-for="model in activeModels"
                      :key="model.id"
                      :label="model.name"
                      :value="model.id"
                    >
                      <span>{{ model.name }}</span>
                      <span style="float: right; color: #8492a6; font-size: 12px">
                        {{ model.type }}
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="Input Data">
                  <el-input
                    v-model="inputJson"
                    type="textarea"
                    :rows="10"
                    placeholder='{"feature1": 1.0, "feature2": 2.0}'
                  />
                </el-form-item>

                <el-form-item label="Parameters">
                  <el-input
                    v-model="paramsJson"
                    type="textarea"
                    :rows="4"
                    placeholder='{"temperature": 0.7, "max_tokens": 100}'
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :icon="MagicStick"
                    @click="runInference"
                    :loading="loading"
                    :disabled="!inferenceForm.modelId"
                    block
                  >
                    Run Inference
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="output-card">
              <template #header>
                <span>Prediction Results</span>
              </template>

              <el-empty v-if="!result" description="No results yet" />

              <div v-else class="result-container">
                <el-alert
                  v-if="result.confidence"
                  :title="`Confidence: ${(result.confidence * 100).toFixed(2)}%`"
                  :type="result.confidence > 0.8 ? 'success' : result.confidence > 0.5 ? 'warning' : 'info'"
                  :closable="false"
                  style="margin-bottom: 16px"
                />

                <div class="result-section">
                  <h3>Prediction</h3>
                  <pre class="json-output">{{ JSON.stringify(result.prediction, null, 2) }}</pre>
                </div>

                <el-descriptions :column="1" border class="meta-section">
                  <el-descriptions-item label="Processing Time">
                    {{ result.processingTime }}ms
                  </el-descriptions-item>
                  <el-descriptions-item label="Timestamp">
                    {{ formatDate(result.timestamp) }}
                  </el-descriptions-item>
                </el-descriptions>

                <el-button :icon="Download" @click="downloadResult" block style="margin-top: 16px">
                  Download Result
                </el-button>
              </div>
            </el-card>

            <el-card class="history-card">
              <template #header>
                <span>Recent Inferences</span>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in inferenceHistory"
                  :key="index"
                  :timestamp="formatDate(item.timestamp)"
                >
                  <div>{{ item.modelName }}</div>
                  <div style="font-size: 12px; color: #909399">
                    Processing time: {{ item.processingTime }}ms
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Download } from '@element-plus/icons-vue'
import { useModelStore } from '../stores/models'
import { modelService } from '../services/api'
import type { InferenceRequest, InferenceResponse } from '../types/models'

const modelStore = useModelStore()
const { activeModels, loading } = modelStore

const inferenceForm = ref<InferenceRequest>({
  modelId: '',
  input: {},
  parameters: {}
})

const inputJson = ref('{\n  "feature1": 1.0,\n  "feature2": 2.0\n}')
const paramsJson = ref('{}')
const result = ref<InferenceResponse | null>(null)
const inferenceHistory = ref<Array<{
  modelName: string
  timestamp: string
  processingTime: number
}>>([])

const onModelChange = () => {
  // Could load model-specific input templates here
}

const runInference = async () => {
  try {
    // Parse JSON inputs
    const inputData = JSON.parse(inputJson.value)
    const paramsData = JSON.parse(paramsJson.value)

    inferenceForm.value.input = inputData
    inferenceForm.value.parameters = paramsData

    const response = await modelService.runInference(inferenceForm.value)
    result.value = response

    // Add to history
    const selectedModel = activeModels.value.find(m => m.id === inferenceForm.value.modelId)
    if (selectedModel) {
      inferenceHistory.value.unshift({
        modelName: selectedModel.name,
        timestamp: response.timestamp,
        processingTime: response.processingTime
      })
      if (inferenceHistory.value.length > 5) {
        inferenceHistory.value.pop()
      }
    }

    ElMessage.success('Inference completed successfully')
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      ElMessage.error('Invalid JSON format in input')
    } else {
      ElMessage.error('Failed to run inference')
      console.error(error)
    }
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const downloadResult = () => {
  if (!result.value) return

  const data = JSON.stringify(result.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inference-result-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('Result downloaded')
}

onMounted(() => {
  modelStore.fetchModels()
})
</script>

<style scoped>
.inference-view {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.input-card,
.output-card {
  margin-bottom: 20px;
}

.history-card {
  margin-top: 20px;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.json-output {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}

.meta-section {
  margin-top: 8px;
}
</style>
