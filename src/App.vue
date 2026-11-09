<template>
  <div id="app">
    <el-container>
      <el-aside width="200px">
        <div class="logo">
          <h2>Decision AI</h2>
        </div>
        <el-menu
          :default-active="currentRoute"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/models">
            <el-icon><Box /></el-icon>
            <span>Models</span>
          </el-menu-item>
          <el-menu-item index="/inference">
            <el-icon><MagicStick /></el-icon>
            <span>Inference</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Box, MagicStick } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #545c64;
  color: #fff;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.logo h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}
</style>
