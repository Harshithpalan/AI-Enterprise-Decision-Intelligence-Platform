import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/models'
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('../views/ModelsView.vue')
  },
  {
    path: '/models/:id',
    name: 'ModelDetail',
    component: () => import('../views/ModelDetailView.vue')
  },
  {
    path: '/inference',
    name: 'Inference',
    component: () => import('../views/InferenceView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
