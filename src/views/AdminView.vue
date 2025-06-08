<template>
  <div class="admin-container">
    <!-- 如果当前路由不是主管理页面，显示子路由内容 -->
    <router-view v-if="$route.name !== 'Admin'" />
    
    <!-- 否则显示管理员主页面 -->
    <div v-else class="admin-dashboard">
      <div class="dashboard-header">
        <h1 class="page-title">
          <el-icon><Setting /></el-icon>
          管理后台
        </h1>
        <p class="page-subtitle">欢迎来到管理后台，请选择要管理的内容</p>
      </div>

      <div class="dashboard-grid">
        <router-link to="/admin/articles" class="dashboard-card articles-card">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <h3>文章管理</h3>
            <p>创建、编辑和删除文章</p>
            <span class="card-action">进入管理 →</span>
          </div>
        </router-link>

        <router-link to="/admin/users" class="dashboard-card users-card">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <h3>用户管理</h3>
            <p>查看和管理用户信息</p>
            <span class="card-action">进入管理 →</span>
          </div>
        </router-link>

        <router-link to="/admin/comments" class="dashboard-card comments-card">
          <div class="card-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="card-content">
            <h3>评论管理</h3>
            <p>审核和管理用户评论</p>
            <span class="card-action">进入管理 →</span>
          </div>
        </router-link>
      </div>

      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.articles }}</div>
            <div class="stat-label">文章总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">用户总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.comments }}</div>
            <div class="stat-label">评论总数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon, ElMessage } from 'element-plus'
import { Setting, Document, User, ChatDotRound } from '@element-plus/icons-vue'
import { adminUserAPI, adminCommentAPI } from '@/api/admin'
import { getArticles } from '@/api/article'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 统计数据
const stats = ref({
  articles: 0,
  users: 0,
  comments: 0,
  pendingComments: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    // 并行获取各项统计数据
    const [usersRes, commentsRes, pendingCommentsRes] = await Promise.all([
      adminUserAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
      adminCommentAPI.getAllComments().catch(() => ({ data: { data: [] } })),
      adminCommentAPI.getPendingComments().catch(() => ({ data: { data: [] } }))
    ])

    // 获取文章数据（使用公共API）
    const articlesRes = await getArticles({ page: 1, limit: 1000 }).catch(() => ({ data: { data: { articles: [] } } }))

    stats.value = {
      articles: articlesRes.data?.data?.length || articlesRes.data?.data?.articles?.length || 0,
      users: usersRes.data?.data?.length || 0,
      comments: commentsRes.data?.data?.length || 0,
      pendingComments: pendingCommentsRes.data?.data?.length || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.warning('获取统计数据失败')
  }
}

onMounted(async () => {
  // 额外的权限检查
  const isAdminUser = await authStore.checkIsAdmin();
  if (!isAdminUser) {
    ElMessage.error('您没有权限访问管理后台')
    router.push('/unauthorized')
    return
  }
  fetchStats()
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.dashboard-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.dashboard-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.articles-card:hover::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.users-card:hover::before {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.comments-card:hover::before {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.users-card .card-icon {
  color: #f5576c;
}

.comments-card .card-icon {
  color: #4facfe;
}

.card-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.card-content p {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.card-action {
  color: #667eea;
  font-weight: 600;
  font-size: 0.95rem;
}

.users-card .card-action {
  color: #f5576c;
}

.comments-card .card-action {
  color: #4facfe;
}

.stats-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .dashboard-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>