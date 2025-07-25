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
import { User, Search, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { adminUserAPI } from '@/api/admin'

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
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.header-left h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left p {
  color: var(--text-secondary);
  margin: 0;
}

.users-list {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table) {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

:deep(.el-table th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-table td) {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--bg-secondary);
}

:deep(.el-table--striped .el-table__fixed-right .el-table__body tr.el-table__row--striped td) {
  background-color: var(--bg-secondary);
}

:deep(.el-table__body tr:hover > td) {
  background-color: var(--bg-secondary) !important;
}

:deep(.el-table__fixed-right .el-table__body tr:hover > td) {
  background-color: var(--bg-secondary) !important;
}

:deep(.el-dialog) {
  border-radius: 12px;
  background-color: var(--bg-card);
}

:deep(.el-dialog__header) {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-dialog__body) {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

:deep(.el-dialog__footer) {
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-input__inner) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-textarea__inner) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
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
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
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
  color: var(--text-primary);
  min-width: 60px;
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
  

}
</style> 