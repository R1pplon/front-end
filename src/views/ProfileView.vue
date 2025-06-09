<template>
    <div class="profile-container">
        <h1>个人资料</h1>
        <div class="profile-content">
            <div class="profile-card">
                <div class="profile-header">
                    <div class="avatar-container">
                        <img :src="authStore.avatar" alt="用户头像" class="avatar" />
                        <div class="avatar-upload">
                            <label for="avatar-input" class="upload-btn">
                                <i class="fas fa-camera"></i>
                                更换头像
                            </label>
                            <input
                                type="file"
                                id="avatar-input"
                                accept="image/*"
                                @change="handleAvatarUpload"
                                style="display: none"
                            />
                        </div>
                    </div>
                    <h2>{{ authStore.username }}</h2>
                    <div class="user-role" v-if="authStore.role === 'admin'">
                        <span class="badge admin">管理员</span>
                    </div>
                </div>

                <div class="profile-info" v-if="!isEditing">
                    

                    <div class="info-item">
                        <span class="label">个人简介:</span>
                        <p class="bio">{{ authStore.bio || '这个人很懒，什么都没留下...' }}</p>
                    </div>
                </div>

                <div class="profile-edit" v-else>
                    <div class="info-item">
                        <span class="label">用户名:</span>
                        <input v-model="editForm.username" type="text" class="edit-input" />
                    </div>

                    <div class="info-item">
                        <span class="label">新密码:</span>
                        <input v-model="editForm.password" type="password" class="edit-input" placeholder="留空表示不修改" />
                    </div>
                </div>

                <div class="profile-actions">
                    <template v-if="!isEditing">
                        <button @click="startEdit" class="edit-btn">编辑资料</button>
                    </template>
                    <template v-else>
                        <button @click="cancelEdit" class="cancel-btn">取消</button>
                        <button @click="saveProfile" class="save-btn">保存</button>
                    </template>
                </div>
            </div>


            <!-- 评论列表部分 -->
            <div class="comments-section">
                <h2>我的评论</h2>
                <div class="comments-list" v-if="comments.length > 0">
                    <div v-for="comment in comments" :key="comment.id" class="comment-card">
                        <div class="comment-header">
                            <span 
                                class="article-title clickable" 
                                @click="goToArticle(comment)"
                                :title="comment.articleTitle"
                            >
                                {{ comment.articleTitle }}
                            </span>
                            <span class="comment-time">{{ formatDateSimple(comment.createTime) }}</span>
                        </div>
                        <div class="comment-content">{{ truncateText(comment.content, 10) }}</div>
                    </div>
                </div>
                <div v-else class="no-comments">
                    暂无评论
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const comments = ref([]); // 用户评论列表

const isEditing = ref(false);
const editForm = ref({
    username: '',
    password: ''
});

// 获取用户评论列表
const fetchUserComments = async () => {
    try {
        const response = await request.get('/comment/');
        if (response.data.code === 200) {
            // 只获取当前用户的评论
            const userComments = response.data.data.filter(
                comment => comment.username === authStore.username
            );
            
            // 打印评论数据结构以便调试
            if (userComments.length > 0) {
                console.log('评论数据结构:', userComments[0]);
            }
            
            comments.value = userComments;
        }
    } catch (error) {
        console.error('获取评论列表失败:', error);
        ElMessage.error('获取评论列表失败');
    }
};

// 格式化日期显示
const formatDate = (dateString) => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 简化的日期格式化方法
const formatDateSimple = (dateString) => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

// 文本截断方法
const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

// 跳转到文章页面
const goToArticle = async (comment) => {
    // 首先检查评论数据中是否直接包含 articleId
    if (comment.articleId) {
        const routeUrl = router.resolve({ name: 'ArticleDetail', params: { id: comment.articleId } });
        window.open(routeUrl.href, '_blank');
        return;
    }
    
    // 如果没有 articleId，尝试通过获取所有文章来查找匹配的标题
    if (comment.articleTitle) {
        try {
            const response = await request.get('/article/');
            if (response.data.code === 200) {
                const articles = response.data.data;
                const matchedArticle = articles.find(article => 
                    article.title === comment.articleTitle
                );
                
                if (matchedArticle) {
                    const routeUrl = router.resolve({ name: 'ArticleDetail', params: { id: matchedArticle.id } });
                    window.open(routeUrl.href, '_blank');
                } else {
                    ElMessage.warning('无法找到对应的文章');
                }
            } else {
                ElMessage.warning('获取文章列表失败');
            }
        } catch (error) {
            console.error('查找文章失败:', error);
            ElMessage.error('查找文章失败');
        }
    } else {
        ElMessage.warning('无法找到对应的文章');
    }
};

// 开始编辑
const startEdit = () => {
    isEditing.value = true;
    editForm.value.username = authStore.username;
};

// 取消编辑
const cancelEdit = () => {
    isEditing.value = false;
    editForm.value.username = authStore.username;
    editForm.value.password = '';
};

// 保存资料
const saveProfile = async () => {
    try {
        const updateData = {
            username: editForm.value.username
        };
        
        if (editForm.value.password) {
            updateData.password = editForm.value.password;
        }

        const response = await request.put('/user/info', updateData);
        if (response.data.code === 200) {
            // 更新全局状态
            authStore.updateUser(response.data.data);
            isEditing.value = false;
            editForm.value.password = '';
            ElMessage.success('保存成功');
        }
    } catch (error) {
        ElMessage.error('保存失败');
        console.error('保存失败:', error);
    }
};

// 上传头像
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件');
        console.log('请上传图片文件');
        return;
    }

    // 验证文件大小（限制为 20MB）
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
        ElMessage.error(`图片大小不能超过 20MB，当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        console.log('文件过大:', file.size, '字节');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log('正在上传文件:', file.name, '大小:', (file.size / 1024).toFixed(2), 'KB');
        const response = await request.post('/user/upload', formData);
        console.log('response is ', response);

        if (response.data.code === 200) {
            // 更新用户头像
            const avatarUrl = response.data.data; // 后端返回的是图片URL
            // 更新全局状态中的头像URL
            authStore.updateAvatar(avatarUrl);
            ElMessage.success('头像上传成功');
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 413) {
                ElMessage.error('文件太大，服务器拒绝接收');
            } else {
                ElMessage.error(error.response.data.message || '头像上传失败');
            }
        } else if (error.code === 'ERR_NETWORK') {
            ElMessage.error('网络错误，请检查网络连接');
        } else {
            ElMessage.error('头像上传失败');
        }
        console.error('头像上传失败:', error);
    }
};

onMounted(async () => {
    // 检查token
    if (!authStore.isLoggedIn) {
        router.push('/login');
        return;
    }
    // 获取用户评论
    await fetchUserComments();
});
</script>

<style scoped>
.profile-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.profile-content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
}

.profile-card {
    flex: 2;
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--shadow);
}

.stats-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stats-card {
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    text-align: center;
    flex: 1;
}

.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
}

.avatar-container {
    position: relative;
    margin-bottom: 1rem;
}

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
}

.avatar-upload {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-container:hover .avatar-upload {
    opacity: 1;
}

.upload-btn {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.user-role {
    margin-top: 0.5rem;
}

.badge {
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}

.badge.admin {
    background-color: #f0ad4e;
    color: #fff;
}

.profile-info {
    margin-bottom: 2rem;
}

.info-item {
    margin-bottom: 1.5rem;
}

.label {
    display: block;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
    font-size: 1rem;
}

.value {
    color: var(--text-primary);
    font-size: 1.1rem;
}

.bio {
    color: var(--text-primary);
    line-height: 1.6;
    padding: 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: 6px;
}

.profile-edit {
    margin-bottom: 2rem;
}

.edit-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.profile-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}

.edit-btn, .save-btn {
    padding: 0.75rem 2rem;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
}

.cancel-btn {
    padding: 0.75rem 2rem;
    background-color: #909399;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
}

.edit-btn:hover, .save-btn:hover {
    background-color: #66b1ff;
}

.cancel-btn:hover {
    background-color: #a6a9ad;
}

.stat-label {
    display: block;
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-primary);
}

/* 评论列表样式 */
.comments-section {
    flex: 1;
    min-width: 300px;
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--shadow);
}

.comments-section h2 {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1.5rem;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comment-card {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1rem;
    transition: transform 0.2s;
}

.comment-card:hover {
    transform: translateY(-2px);
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.article-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.article-title.clickable {
    color: var(--text-link);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.article-title.clickable:hover {
    color: var(--text-link-hover);
    text-decoration: underline;
}

.comment-time {
    color: #999;
    font-size: 0.9rem;
}

.comment-content {
    color: var(--text-primary);
    line-height: 1.5;
    margin-top: 0.5rem;
    word-break: break-word;
    font-size: 1rem;
}

.no-comments {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem;
    font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .profile-content {
        flex-direction: column;
    }

    .comments-section {
        margin-top: 2rem;
    }
}
</style>