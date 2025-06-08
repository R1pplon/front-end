<template>
  <div class="role-test">
    <div class="test-container">
      <h1>用户角色测试</h1>
      
      <div class="test-section">
        <el-button @click="testGetUserRole" type="primary">测试获取用户角色</el-button>
        <el-button @click="testPermissionCheck" type="success">测试权限检查</el-button>
        <el-button @click="clearCache" type="warning">清除缓存</el-button>
      </div>

      <div class="result-section">
        <h3>API响应结果:</h3>
        <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
      </div>

      <div class="result-section">
        <h3>权限检查结果:</h3>
        <pre>{{ JSON.stringify(permissionResult, null, 2) }}</pre>
      </div>

      <div class="result-section">
        <h3>Store状态:</h3>
        <pre>{{ JSON.stringify(storeState, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getUserRole } from '@/api/auth'
import { isAdmin, isUser, fetchUserRole, clearRoleCache, getUserRoleInfo } from '@/utils/permission'

const authStore = useAuthStore()

const apiResult = ref(null)
const permissionResult = ref(null)
const storeState = ref({})

const updateStoreState = () => {
  storeState.value = {
    isLoggedIn: authStore.isLoggedIn,
    user: authStore.user,
    userRole: authStore.userRole
  }
}

const testGetUserRole = async () => {
  try {
    console.log('=== 开始测试getUserRole API ===')
    const response = await getUserRole()
    console.log('API直接响应:', response)
    apiResult.value = response
    
    // 测试权限工具函数
    const role = await fetchUserRole()
    console.log('权限工具函数结果:', role)
    
    updateStoreState()
  } catch (error) {
    console.error('测试失败:', error)
    apiResult.value = { error: error.message }
  }
}

const testPermissionCheck = async () => {
  try {
    console.log('=== 开始测试权限检查 ===')
    
    const [isAdminResult, isUserResult, roleInfo] = await Promise.all([
      isAdmin(),
      isUser(),
      getUserRoleInfo()
    ])
    
    permissionResult.value = {
      isAdmin: isAdminResult,
      isUser: isUserResult,
      roleInfo
    }
    
    console.log('权限检查结果:', permissionResult.value)
    updateStoreState()
  } catch (error) {
    console.error('权限检查失败:', error)
    permissionResult.value = { error: error.message }
  }
}

const clearCache = () => {
  clearRoleCache()
  apiResult.value = null
  permissionResult.value = null
  console.log('缓存已清除')
}

// 初始化时更新状态
updateStoreState()
</script>

<style scoped>
.role-test {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.test-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-container h1 {
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.test-section {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.result-section {
  margin-bottom: 2rem;
}

.result-section h3 {
  color: #555;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 