<template>
  <div class="admin-articles">
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
          <el-icon><Document /></el-icon>
          文章管理
        </h1>
        <p>管理所有文章内容</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新建文章
        </el-button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-list">
      <el-table 
        :data="articleList" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope?.row?.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope?.row?.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="editArticle(scope?.row)"
              v-if="scope?.row"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteArticle(scope?.row)"
              v-if="scope?.row"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建/编辑文章对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑文章' : '新建文章'"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="articleFormRef"
        :model="articleForm"
        :rules="articleRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="articleForm.title"
            placeholder="请输入文章标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            placeholder="请输入文章内容（支持Markdown格式）"
            :rows="15"
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitArticle"
          :loading="submitting"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { adminArticleAPI } from '@/api/admin'
import { getArticles, getArticleById } from '@/api/article'

const router = useRouter()

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const articleList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentArticleId = ref(null)

// 表单相关
const articleFormRef = ref()
const articleForm = reactive({
  title: '',
  content: ''
})

const articleRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await getArticles({ page: 1, limit: 1000 })
    console.log('文章列表API响应:', response.data)
    
    if (response.data && response.data.code === 200) {
      // API返回的数据可能是 {articles: [...]} 或者直接是 [...]
      const responseData = response.data.data
      if (Array.isArray(responseData)) {
        articleList.value = responseData
      } else if (responseData && Array.isArray(responseData.articles)) {
        articleList.value = responseData.articles
      } else {
        articleList.value = []
        console.warn('未找到文章数据，响应数据结构:', responseData)
      }
    } else {
      ElMessage.error('获取文章列表失败')
      articleList.value = []
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
    articleList.value = []
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  currentArticleId.value = null
  articleForm.title = ''
  articleForm.content = ''
  dialogVisible.value = true
}

// 编辑文章
const editArticle = async (article) => {
  try {
    // 获取文章详情
    const response = await getArticleById(article.id)
    if (response.data && response.data.code === 200) {
      const articleData = response.data.data
      isEdit.value = true
      currentArticleId.value = article.id
      articleForm.title = articleData.title
      articleForm.content = articleData.content
      dialogVisible.value = true
    } else {
      ElMessage.error('获取文章详情失败')
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

// 删除文章
const deleteArticle = async (article) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章《${article.title}》吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminArticleAPI.deleteArticle(article.id)
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      await fetchArticles()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  }
}

// 提交文章
const submitArticle = async () => {
  if (!articleFormRef.value) return

  try {
    await articleFormRef.value.validate()
    submitting.value = true

    let response
    if (isEdit.value) {
      response = await adminArticleAPI.updateArticle(currentArticleId.value, articleForm)
      if (response.data && response.data.code === 200) {
        ElMessage.success('更新成功')
      } else {
        ElMessage.error(response.data?.message || '更新失败')
        return
      }
    } else {
      response = await adminArticleAPI.createArticle(articleForm)
      if (response.data && response.data.code === 200) {
        ElMessage.success('创建成功')
      } else {
        ElMessage.error(response.data?.message || '创建失败')
        return
      }
    }

    dialogVisible.value = false
    await fetchArticles()
  } catch (error) {
    console.error('提交文章失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 返回管理后台
const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.admin-articles {
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

.articles-list {
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

:deep(.el-textarea__inner) {
  font-family: 'Courier New', Monaco, monospace;
  line-height: 1.6;
}

.back-button {
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateX(-2px);
}

@media (max-width: 768px) {
  .admin-articles {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-right {
    align-self: flex-start;
  }
  
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
}
</style> 