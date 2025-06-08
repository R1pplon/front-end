<template>
  <div class="admin-users">
    <div class="page-header">
      <div class="header-left">
        <div class="header-top">
          <el-button 
            type="info" 
            size="default"
            @click="goBack"
            :icon="ArrowLeft"
            class="back-button"
          >
            返回管理后台
          </el-button>
        </div>
        <h1>
          <el-icon><User /></el-icon>
          用户管理
        </h1>
        <p>管理所有用户信息</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          style="width: 250px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-list">
      <el-table 
        :data="filteredUserList" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <el-avatar 
              :src="getAvatarUrl(scope.row.avatarUrl)" 
              :size="40"
              style="border: 2px solid #f0f0f0"
              @error="handleAvatarError"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button 
              type="info" 
              size="small" 
              @click="viewUserDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="editUser(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteUser(scope.row)"
              :disabled="scope.row.role === 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentUserDetail" class="user-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>头像：</label>
              <el-avatar 
                :src="getAvatarUrl(currentUserDetail.avatarUrl)" 
                :size="60"
                style="border: 2px solid #f0f0f0"
                @error="handleAvatarError"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>
            <div class="info-item">
              <label>ID：</label>
              <span>{{ currentUserDetail.id }}</span>
            </div>
            <div class="info-item">
              <label>用户名：</label>
              <span>{{ currentUserDetail.username }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ currentUserDetail.email }}</span>
            </div>
            <div class="info-item">
              <label>角色：</label>
              <el-tag 
                :type="getUserRoleType(currentUserDetail.role)"
                size="small"
              >
                {{ getUserRoleText(currentUserDetail.role) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ formatDate(currentUserDetail.createTime) }}</span>
            </div>
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDate(currentUserDetail.updateTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="detail-section" v-if="currentUserDetail.comments?.length > 0">
          <div class="section-header">
            <h3>最近评论</h3>
            <el-tag type="primary" size="small">
              共 {{ currentUserDetail.comments?.length || 0 }} 条评论
            </el-tag>
          </div>
          <div class="comment-list">
            <div 
              v-for="comment in currentUserDetail.comments.slice(0, 5)" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <span 
                  class="comment-article-title" 
                  @click="() => goToArticle(comment)"
                  :title="getArticleTitle(comment)"
                >
                  {{ getArticleTitle(comment) }}
                </span>
                <el-tag 
                  v-if="comment.parent" 
                  size="small" 
                  type="info"
                >
                  回复评论
                </el-tag>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-meta">
                <span>{{ formatDate(comment.createTime) }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteComment(comment)"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="editUserFromDetail"
        >
          编辑用户
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            type="email"
            placeholder="请输入邮箱"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="留空则不修改密码"
            maxlength="50"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitUser"
          :loading="submitting"
        >
          更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Search, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { adminUserAPI, adminCommentAPI } from '@/api/admin'

const router = useRouter()

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const userList = ref([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentUserId = ref(null)
const currentUserDetail = ref(null)
const searchKeyword = ref('')

// 表单相关
const userFormRef = ref()
const userForm = reactive({
  username: '',
  email: '',
  password: ''
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 搜索过滤
const filteredUserList = computed(() => {
  if (!searchKeyword.value) {
    return userList.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return userList.value.filter(user => 
    user.username.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword)
  )
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取头像URL
const getAvatarUrl = (avatarUrl) => {
  // 如果头像URL为空、null、undefined或者只是空字符串，返回null让el-avatar显示默认内容
  if (!avatarUrl || avatarUrl.trim() === '') {
    return null
  }
  
  // 如果是相对路径，添加基础URL
  if (avatarUrl.startsWith('/')) {
    return `http://localhost:8080${avatarUrl}`
  }
  
  // 如果已经是完整URL，直接返回
  return avatarUrl
}

// 处理头像加载错误
const handleAvatarError = () => {
  // 头像加载失败时，el-avatar会自动显示默认的slot内容（User图标）
  console.log('头像加载失败，显示默认图标')
}

// 获取用户角色文本
const getUserRoleText = (role) => {
  const roleMap = {
    0: '管理员',
    1: '普通用户'
  }
  return roleMap[role] || '未知'
}

// 获取用户角色类型
const getUserRoleType = (role) => {
  const typeMap = {
    0: 'danger',
    1: 'primary'
  }
  return typeMap[role] || 'info'
}

// 搜索处理
const handleSearch = () => {
  // 实时搜索，通过computed已经实现
}

// 获取评论对应的文章
const getCommentArticle = (comment) => {
  if (!currentUserDetail.value?.articles) {
    return null
  }
  
  // 通过评论在文章的comments数组中查找对应的文章
  for (const article of currentUserDetail.value.articles) {
    if (article.comments?.some(c => c.id === comment.id)) {
      return article
    }
  }
  
  return null
}

// 获取文章标题
const getArticleTitle = (comment) => {
  const article = getCommentArticle(comment)
  return article ? article.title : '未知文章'
}

// 获取文章ID
const getArticleId = (comment) => {
  const article = getCommentArticle(comment)
  return article ? article.id : null
}

// 跳转到文章页面
const goToArticle = (comment) => {
  const articleId = getArticleId(comment)
  if (articleId) {
    // 在新窗口打开文章页面
    const routeUrl = router.resolve({ name: 'ArticleDetail', params: { id: articleId } })
    window.open(routeUrl.href, '_blank')
  } else {
    ElMessage.warning('无法找到对应的文章')
  }
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await adminUserAPI.getAllUsers()
    if (response.data && response.data.code === 200) {
      userList.value = response.data.data || []
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 查看用户详情
const viewUserDetail = async (user) => {
  try {
    const response = await adminUserAPI.getUserById(user.id)
    if (response.data && response.data.code === 200) {
      currentUserDetail.value = response.data.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 从详情页编辑用户
const editUserFromDetail = () => {
  if (currentUserDetail.value) {
    currentUserId.value = currentUserDetail.value.id
    userForm.username = currentUserDetail.value.username
    userForm.email = currentUserDetail.value.email
    userForm.password = ''
    detailDialogVisible.value = false
    dialogVisible.value = true
  }
}

// 编辑用户
const editUser = (user) => {
  currentUserId.value = user.id
  userForm.username = user.username
  userForm.email = user.email
  userForm.password = ''
  dialogVisible.value = true
}

// 删除用户
const deleteUser = async (user) => {
  if (user.role === 0) {
    ElMessage.warning('不能删除管理员用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除用户《${user.username}》吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminUserAPI.deleteUser(user.id)
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      await fetchUsers()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 删除评论
const deleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条评论吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminCommentAPI.deleteComment(comment.id)
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      // 重新获取用户详情以刷新评论列表
      await refreshUserDetail()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 刷新用户详情
const refreshUserDetail = async () => {
  if (!currentUserDetail.value) return
  
  try {
    const response = await adminUserAPI.getUserById(currentUserDetail.value.id)
    if (response.data && response.data.code === 200) {
      currentUserDetail.value = response.data.data
    }
  } catch (error) {
    console.error('刷新用户详情失败:', error)
  }
}

// 提交用户信息
const submitUser = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    submitting.value = true

    // 准备提交数据，如果密码为空则不包含密码字段
    const submitData = {
      username: userForm.username,
      email: userForm.email
    }
    if (userForm.password) {
      submitData.password = userForm.password
    }

    const response = await adminUserAPI.updateUser(currentUserId.value, submitData)
    if (response.data && response.data.code === 200) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      await fetchUsers()
    } else {
      ElMessage.error(response.data?.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}

// 返回管理后台
const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left p {
  color: #718096;
  margin: 0;
}

.users-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  background-color: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #2d3748;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #4a5568;
}

:deep(.el-avatar) {
  transition: transform 0.2s;
  background-color: #f0f2f5;
}

:deep(.el-avatar:hover) {
  transform: scale(1.1);
}

:deep(.el-avatar .el-icon) {
  color: #909399;
}

.back-button {
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateX(-2px);
}

/* 用户详情样式 */
.user-detail {
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #4a5568;
  min-width: 60px;
}

.comment-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #667eea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-article-title {
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-article-title:hover {
  color: #4c51bf;
  text-decoration: underline;
}

.comment-content {
  color: #2d3748;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.comment-meta span {
  flex: 1;
}

@media (max-width: 768px) {
  .admin-users {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table .el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .comment-article-title {
    max-width: 100%;
  }
  
  .comment-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comment-meta span {
    flex: none;
  }
}
</style> 