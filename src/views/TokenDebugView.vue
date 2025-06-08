<template>
  <div class="token-debug">
    <div class="debug-container">
      <h1>JWT Token 调试信息</h1>
      
      <div class="debug-section">
        <h2>Cookie 中的 Token</h2>
        <div class="code-block">
          <pre>{{ tokenFromCookie || '未找到 jwt_token cookie' }}</pre>
        </div>
      </div>

      <div class="debug-section">
        <h2>解析后的 Token 信息</h2>
        <div class="code-block">
          <pre>{{ JSON.stringify(tokenInfo, null, 2) }}</pre>
        </div>
      </div>

      <div class="debug-section">
        <h2>权限检查结果</h2>
        <div class="permission-results">
          <div class="permission-item">
            <span class="label">是否为管理员:</span>
            <span class="value" :class="{ 'success': isAdminResult, 'error': !isAdminResult }">
              {{ isAdminResult ? '是' : '否' }}
            </span>
          </div>
          <div class="permission-item">
            <span class="label">是否为普通用户:</span>
            <span class="value" :class="{ 'success': isUserResult, 'error': !isUserResult }">
              {{ isUserResult ? '是' : '否' }}
            </span>
          </div>
          <div class="permission-item">
            <span class="label">Token 是否过期:</span>
            <span class="value" :class="{ 'error': isExpired, 'success': !isExpired }">
              {{ isExpired ? '是' : '否' }}
            </span>
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h2>Auth Store 状态</h2>
        <div class="code-block">
          <pre>{{
            JSON.stringify({
              isLoggedIn: authStore.isLoggedIn,
              userRole: authStore.userRole,
              isAdmin: authStore.isAdmin,
              isUserRole: authStore.isUserRole,
              user: authStore.user
            }, null, 2)
          }}</pre>
        </div>
      </div>

      <div class="debug-actions">
        <el-button @click="refreshData">刷新数据</el-button>
        <el-button @click="clearToken" type="danger">清除 Token</el-button>
        <el-button @click="$router.push('/')" type="primary">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { 
  getJwtTokenFromCookie, 
  getTokenInfo, 
  isTokenExpired,
  getUserRoleFromToken,
  getUserIdFromToken
} from '@/utils/jwt'
import { isAdmin, isUser } from '@/utils/permission'

const authStore = useAuthStore()

const tokenFromCookie = ref('')
const tokenInfo = ref(null)

const isAdminResult = computed(() => isAdmin())
const isUserResult = computed(() => isUser())
const isExpired = computed(() => isTokenExpired())

const loadTokenData = () => {
  tokenFromCookie.value = getJwtTokenFromCookie()
  tokenInfo.value = getTokenInfo()
  
  console.log('=== Token 调试信息 ===')
  console.log('Token from cookie:', tokenFromCookie.value)
  console.log('Parsed token info:', tokenInfo.value)
  console.log('Is admin:', isAdminResult.value)
  console.log('Is user:', isUserResult.value)
  console.log('Is expired:', isExpired.value)
  console.log('Auth store state:', {
    isLoggedIn: authStore.isLoggedIn,
    userRole: authStore.userRole,
    isAdmin: authStore.isAdmin,
    isUserRole: authStore.isUserRole
  })
}

const refreshData = () => {
  loadTokenData()
}

const clearToken = () => {
  // 清除cookie中的token
  document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  // 清除本地存储
  localStorage.removeItem('user_info')
  // 更新store状态
  authStore.logout()
  // 刷新数据
  loadTokenData()
}

onMounted(() => {
  loadTokenData()
})
</script>

<style scoped>
.token-debug {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.debug-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.debug-container h1 {
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.debug-section {
  margin-bottom: 2rem;
}

.debug-section h2 {
  color: #555;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}

.permission-results {
  display: grid;
  gap: 1rem;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #dee2e6;
}

.permission-item .label {
  font-weight: 500;
  color: #555;
}

.permission-item .value {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.permission-item .value.success {
  background: #d4edda;
  color: #155724;
}

.permission-item .value.error {
  background: #f8d7da;
  color: #721c24;
}

.debug-actions {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .token-debug {
    padding: 1rem;
  }
  
  .debug-container {
    padding: 1rem;
  }
  
  .debug-actions {
    flex-direction: column;
  }
}
</style> 