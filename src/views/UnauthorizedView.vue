<template>
  <div class="unauthorized-container">
    <div class="unauthorized-content">
      <div class="icon-container">
        <el-icon class="unauthorized-icon">
          <Lock />
        </el-icon>
      </div>
      
      <h1 class="title">访问受限</h1>
      <p class="message">抱歉，您没有权限访问此页面</p>
      <p class="sub-message">只有管理员才能访问管理后台</p>
      
      <div class="actions">
        <el-button type="primary" @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>
      
      <div class="info-box">
        <el-icon><InfoFilled /></el-icon>
        <span>如果您是管理员，请确保已正确登录管理员账户</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Lock, House, ArrowLeft, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.unauthorized-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.unauthorized-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.icon-container {
  margin-bottom: 2rem;
}

.unauthorized-icon {
  font-size: 5rem;
  color: #f56565;
  background: #fed7d7;
  border-radius: 50%;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(245, 101, 101, 0.2);
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.message {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.sub-message {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.actions .el-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.info-box {
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2b6cb0;
  font-size: 0.9rem;
}

.info-box .el-icon {
  font-size: 1.2rem;
  color: #3182ce;
}

@media (max-width: 768px) {
  .unauthorized-container {
    padding: 1rem;
  }
  
  .unauthorized-content {
    padding: 2rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style> 