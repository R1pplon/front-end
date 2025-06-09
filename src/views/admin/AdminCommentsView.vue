<template>
  <div class="admin-comments">
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
          <el-icon><ChatDotRound /></el-icon>
          评论管理
        </h1>
        <p>管理所有用户评论</p>
      </div>

    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <el-table 
        :data="commentList" 
        v-loading="loading"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="150">
          <template #default="scope">
            <div class="user-info">
              <el-avatar 
                :src="scope.row.avatarUrl" 
                :size="32"
                style="margin-right: 8px"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
              <span>{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评论内容" min-width="300">
          <template #default="scope">
            <div class="comment-content">
              <p>{{ scope.row.content }}</p>
              <el-tag v-if="scope.row.parentId" size="small" type="info">
                回复评论
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="articleTitle" label="文章标题" min-width="200" />
        <el-table-column prop="createTime" label="评论时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteComment(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="评论详情"
      width="600px"
    >
      <div v-if="currentComment" class="comment-detail">
        <div class="detail-item">
          <label>用户：</label>
          <div class="user-info">
            <el-avatar 
              :src="currentComment.avatarUrl" 
              :size="40"
              style="margin-right: 12px"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <span>{{ currentComment.username }}</span>
          </div>
        </div>
        
        <div class="detail-item">
          <label>文章：</label>
          <span>{{ currentComment.articleTitle }}</span>
        </div>
        
        <div class="detail-item">
          <label>评论时间：</label>
          <span>{{ formatDate(currentComment.createTime) }}</span>
        </div>
        
        <div class="detail-item">
          <label>评论类型：</label>
          <el-tag v-if="currentComment.parentId" size="small" type="info">
            回复评论
          </el-tag>
          <el-tag v-else size="small" type="primary">
            主评论
          </el-tag>
        </div>
        
        <div class="detail-item">
          <label>评论内容：</label>
          <div class="content-box">
            {{ currentComment.content }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="danger" 
          @click="deleteComment(currentComment)"
        >
          删除评论
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, User, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { adminCommentAPI } from '@/api/admin'

const router = useRouter()

// 数据状态
const loading = ref(false)
const commentList = ref([])
const detailDialogVisible = ref(false)
const currentComment = ref(null)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    const response = await adminCommentAPI.getAllComments()
    
    if (response.data && response.data.code === 200) {
      commentList.value = response.data.data || []
    } else {
      ElMessage.error('获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
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
      detailDialogVisible.value = false
      await fetchComments()
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

// 查看评论详情
const viewCommentDetail = (comment) => {
  currentComment.value = comment
  detailDialogVisible.value = true
}

// 返回管理后台
const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.admin-comments {
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

.comments-list {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.user-info {
  display: flex;
  align-items: center;
}

.comment-content p {
  margin: 0 0 8px 0;
  line-height: 1.5;
  max-width: 300px;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.comment-detail {
  padding: 1rem 0;
}

.detail-item {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 100px;
  margin-right: 1rem;
}

.content-box {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid var(--text-link);
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 400px;
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

.back-button {
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateX(-2px);
}

@media (max-width: 768px) {
  .admin-comments {
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
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table .el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .comment-content p {
    max-width: 200px;
    -webkit-line-clamp: 2;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-item label {
    min-width: auto;
    margin-right: 0;
  }
  
  .content-box {
    max-width: 100%;
  }
}
</style> 