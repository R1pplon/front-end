<template>
    <div class="article-detail-container">
        <!-- 返回按钮 -->
        <router-link to="/articles" class="back-button">
            &lt; 返回文章列表
        </router-link>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
            <div class="loader"></div>
            <p>加载文章中...</p>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="error">
            <p>❌ {{ error }}</p>
            <button class="retry-btn" @click="fetchArticle">重试</button>
        </div>

        <!-- 文章内容 -->
        <div v-if="article" class="article-container">
            <header class="article-header">
                <h1 class="title">{{ article.title }}</h1>
                <div class="meta">
                    <div class="author">
                        <div class="info">
                            <div class="date-info">
                                <span>发表于: {{ formatDate(article.createTime) }}</span>
                                <span v-if="article.updateTime">
                                    &nbsp;&nbsp;•&nbsp;&nbsp;更新于: {{ formatDate(article.updateTime) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <CodeThemeSelector />
                        <button v-if="isAuthor" class="edit-btn">编辑</button>
                    </div>
                </div>
            </header>

            <div class="article-image" v-if="article.imageUrl">
                <img :src="article.imageUrl" :alt="article.title">
            </div>

            <div class="article-content" v-html="renderedContent"></div>

            <div class="article-footer">
                <div class="tags" v-if="article.tags && article.tags.length">
                    <span class="tag-label">标签:</span>
                    <span v-for="tag in article.tags" :key="tag" class="tag">
                        {{ tag }}
                    </span>
                </div>

            </div>
        </div>

        <!-- 评论区域 -->
        <div v-if="article" class="comments-section">
            <h2>评论 ({{ comments.length }})</h2>

            <div class="comment-form">
                <div class="form-group">
                    <img :src="currentUser.avatar || defaultAvatar" :alt="currentUser.username" class="avatar" />
                    <textarea v-model="newComment" placeholder="写下您的评论..." :rows="commentRows" ref="commentTextarea"
                        @input="adjustCommentHeight"></textarea>
                </div>

                <div class="form-actions">
                    <button class="submit-btn" @click="submitComment"
                        :disabled="isCommentSubmitting || newComment.trim().length === 0">
                        {{ isCommentSubmitting ? '提交中...' : '提交评论' }}
                    </button>
                </div>
            </div>

            <div class="comments-list">
                <CommentTree v-if="comments.length" :comments="commentsTree" :article-id="article.id"
                    :current-user="currentUser" @reply="onCommentReply" @delete="handleDeleteComment" />

                <div v-else class="no-comments">
                    还没有评论，来发表第一条评论吧！
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleById } from '@/api/article';
import { renderMarkdown, applyCodeHighlight } from '@/utils/markdown';
import CommentTree from '@/components/comments/CommentTree.vue';
import CodeThemeSelector from '@/components/CodeThemeSelector.vue';
import { getArticleComments, addComment, deleteComment } from '@/api/article';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';
import hljs from 'highlight.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 文章数据
const article = ref(null);
const loading = ref(true);
const error = ref(null);

// 评论数据
const newComment = ref('');
const comments = ref([]);

// 用户交互状态
const isLiked = ref(false);
const isAuthor = ref(false);

// 作者信息（这些应该从全局状态或用户系统中获取）
const authorName = 'R1pple'; // 博客主人名称
const authorAvatar = 'https://i.pravatar.cc/100'; // 作者头像占位图

// 计算属性
const renderedContent = computed(() => {
    if (!article.value || !article.value.content) {
        return '';
    }
    
    console.log('准备渲染的文章内容:', article.value.content);
    const rendered = renderMarkdown(article.value.content);
    console.log('渲染后的HTML:', rendered);
    
    // 在下一个 tick 中应用代码高亮
    nextTick(() => {
        applyCodeHighlight();
    });
    
    return rendered;
});

const commentCount = computed(() => comments.value.length);

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// 评论状态
const isCommentSubmitting = ref(false);
const commentTextarea = ref(null);
const commentRows = ref(4);
const replyingTo = ref(null); // 当前正在回复的评论
const defaultAvatar = 'https://i.pravatar.cc/100';

// 获取当前用户信息
const currentUser = computed(() => {
    if (authStore.isLoggedIn && authStore.user) {
        // 获取真正的用户数据（从 data 字段中）
        const userData = authStore.user.data || authStore.user;
        
        return {
            id: userData.id,
            username: userData.username || authStore.username,
            avatar: userData.avatar || authStore.avatar
        };
    }
    
    return {
        id: null,
        username: '',
        avatar: 'https://i.pravatar.cc/100?id=3'
    };
});

// 将平铺评论转换为树形结构
const commentsTree = computed(() => {
    const map = {};
    const result = [];

    // 创建映射
    comments.value.forEach(comment => {
        map[comment.id] = { ...comment, replies: [] };
    });

    // 构建树形结构
    comments.value.forEach(comment => {
        if (comment.parentId) {
            if (map[comment.parentId]) {
                map[comment.parentId].replies.push(map[comment.id]);
            }
        } else {
            result.push(map[comment.id]);
        }
    });

    // 按时间倒序排序
    return result.sort((a, b) =>
        new Date(b.createTime) - new Date(a.createTime)
    );
});

// 调整评论框高度
const adjustCommentHeight = () => {
    if (commentTextarea.value) {
        commentTextarea.value.style.height = 'auto';
        commentTextarea.value.style.height = `${Math.min(commentTextarea.value.scrollHeight, 200)}px`;
    }
};

// 获取评论列表
const fetchComments = async () => {
    try {
        const res = await getArticleComments(parseInt(route.params.id));
        if (res.data && res.data.code === 200) {
            comments.value = res.data.data;
        } else {
            ElMessage.error(res.data?.message || '获取评论失败');
        }
    } catch (error) {
        console.error('获取评论失败:', error);
        ElMessage.error('获取评论失败，请稍后重试');
    }
};

// 提交评论
const submitComment = async () => {
    // 检查用户是否已登录
    if (!authStore.isLoggedIn) {
        ElMessage.warning('请先登录后再评论');
        router.push('/login');
        return;
    }

    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容');
        return;
    }

    isCommentSubmitting.value = true;
    try {
        const commentData = {
            content: newComment.value.trim(),
            articleId: parseInt(route.params.id),
            parentId: null // 顶级评论
        };

        const res = await addComment(commentData);
        if (res.data && res.data.code === 200) {
            ElMessage.success('评论发表成功');
            newComment.value = ''; // 清空输入框
            await fetchComments(); // 重新获取评论列表
        } else {
            throw new Error(res.data?.message || '评论发表失败');
        }
    } catch (error) {
        console.error('提交评论失败:', error);
        ElMessage.error(error.message || '评论发表失败，请稍后重试');
    } finally {
        isCommentSubmitting.value = false;
    }
};

// 回复评论
const onCommentReply = async (comment, content) => {
    // 如果没有content参数，说明是点击回复按钮，不需要处理
    if (!content) {
        return;
    }

    // 检查用户是否已登录
    if (!authStore.isLoggedIn) {
        ElMessage.warning('请先登录后再回复');
        router.push('/login');
        return;
    }

    if (!content.trim()) {
        ElMessage.warning('请输入回复内容');
        return;
    }

    try {
        const replyData = {
            content: content.trim(),
            articleId: parseInt(route.params.id),
            parentId: comment.id
        };

        const res = await addComment(replyData);
        if (res.data && res.data.code === 200) {
            ElMessage.success('回复发表成功');
            await fetchComments(); // 重新获取评论列表
        } else {
            throw new Error(res.data?.message || '回复发表失败');
        }
    } catch (error) {
        console.error('提交回复失败:', error);
        ElMessage.error(error.message || '回复发表失败，请稍后重试');
    }
};

// 删除评论
const handleDeleteComment = async (commentId) => {
    try {
        // 使用原生确认对话框
        const confirmed = confirm('确定要删除这条评论吗？');
        
        if (!confirmed) {
            return;
        }

        const res = await deleteComment(commentId);
        
        if (res.data && res.data.code === 200) {
            ElMessage.success('评论删除成功');
            await fetchComments(); // 重新获取评论列表
        } else {
            throw new Error(res.data?.message || '删除评论失败');
        }
    } catch (error) {
        console.error('删除评论失败:', error);
        ElMessage.error(error.message || '删除评论失败，请稍后重试');
    }
};

// 在获取文章成功后获取评论
const fetchArticle = async () => {
    loading.value = true;
    error.value = null;
    const articleId = route.params.id;

    try {
        const res = await getArticleById(articleId);
        if (res.data && res.data.code === 200) {
            article.value = res.data.data;
            console.log('文章详情:', article.value);
            // 获取文章评论
            await fetchComments();
        } else {
            throw new Error(res.data?.message || '加载文章失败');
        }
    } catch (err) {
        error.value = err.message || '加载文章失败，请稍后重试';
        console.error('获取文章详情失败:', err);
    } finally {
        loading.value = false;
    }
};

// 合并两个 onMounted 钩子
onMounted(async () => {
    try {
        // 暴露 hljs 到全局 window 对象，供主题切换使用
        window.hljs = hljs;
        
        // 1. 获取文章详情
        await fetchArticle();

        // 2. 如果文章获取成功且有 ID 才获取评论
        if (article.value && article.value.id) {
            await fetchComments();
        } else {
            console.warn('文章数据不完整，跳过获取评论');
        }

    } catch (err) {
        console.error('初始化加载失败:', err);
    }
});
</script>

<style scoped>
.article-detail-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.back-button {
    display: inline-block;
    margin-bottom: 2rem;
    color: var(--text-link);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
}

.back-button:hover {
    color: var(--text-link-hover);
    text-decoration: underline;
}

.loading,
.error {
    text-align: center;
    padding: 3rem;
}

.loader {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--text-link);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: var(--text-link);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.article-container {
    background-color: var(--bg-card);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow);
    margin-bottom: 3rem;
}

.article-header {
    padding: 2rem;
    border-bottom: 1px solid var(--border-color);
}

.title {
    font-size: 2.2rem;
    margin: 0 0 1.5rem;
    line-height: 1.3;
    color: var(--text-primary);
}

.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.author {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.info {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: 500;
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
    color: var(--text-primary);
}

.date-info {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.actions {
    display: flex;
    gap: 0.8rem;
}

.edit-btn,
.share-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.edit-btn {
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

.edit-btn:hover {
    background-color: var(--bg-primary);
    border-color: var(--text-link);
    color: var(--text-link);
}

.share-btn {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
}

.share-btn:hover {
    background-color: var(--text-link-hover);
}

.article-image {
    aspect-ratio: 16/9;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-content {
    padding: 2rem;
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-primary);
}

.article-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tags {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
}

.tag-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.tag {
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
}

.like-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background-color: var(--bg-secondary);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.like-btn:hover {
    color: var(--text-link);
}

.like-btn i {
    color: var(--text-link);
}

/* 评论区域 */
.comments-section {
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    margin-top: 3rem;
}

.comments-section h2 {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.comment-form {
    margin-bottom: 2rem;
}

.comment-form .form-group {
    display: flex;
    gap: 1rem;
}

.comment-form textarea {
    flex-grow: 1;
    padding: 1rem;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
}

.comment-form .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    align-self: flex-start;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.submit-btn {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
    background-color: var(--text-link-hover);
}

.submit-btn:hover {
    background-color: var(--text-link-hover);
}

.no-comments {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

.comments-list {
    margin-top: 2rem;
}

.comment {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.comment:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.comment .avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.comment .content {
    flex-grow: 1;
}

.comment .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.comment .name {
    font-weight: 500;
    color: var(--text-primary);
}

.comment .date {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.comment .text {
    line-height: 1.5;
}

.no-comments {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .title {
        font-size: 1.8rem;
    }

    .meta {
        flex-direction: column;
        align-items: flex-start;
    }

    .actions {
        width: 100%;
        justify-content: flex-start;
    }

    .article-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .comment {
        flex-direction: column;
    }

    .comment-form .form-group {
        flex-direction: column;
    }

    .comment-form .avatar {
        width: 40px;
        height: 40px;
    }
}
</style>

<style>
/* Markdown 渲染的全局样式 */
.markdown-heading {
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    color: var(--text-primary);
}

.markdown-heading:first-child {
    margin-top: 0;
}

.article-content p {
    margin-bottom: 1.2em;
}

.article-content a {
    color: var(--text-link);
    text-decoration: underline;
}

.article-content a:hover {
    color: var(--text-link-hover);
}

.article-content pre {
    background-color: #f6f8fa;
    padding: 1.2rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    border: 1px solid #e1e4e8;
    position: relative;
}

.article-content pre code {
    font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background: none;
    padding: 0;
    border: none;
    border-radius: 0;
}

.article-content code {
    font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
    font-size: 0.9rem;
    background-color: rgba(175, 184, 193, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    border: 1px solid rgba(175, 184, 193, 0.3);
}

/* 暗色主题下的代码块样式 */
[data-theme="dark"] .article-content pre {
    background-color: #161b22;
    border-color: #30363d;
}

[data-theme="dark"] .article-content code {
    background-color: rgba(18, 19, 21, 0.4);
    border-color: rgba(34, 37, 40, 0.5);
}

.article-content blockquote {
    border-left: 4px solid var(--text-link);
    padding: 0.5rem 1rem;
    margin: 1.5rem 0;
    background-color: var(--bg-secondary);
    border-radius: 0 4px 4px 0;
}

.article-content blockquote p {
    margin: 0;
}

.article-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
}

.article-content ul,
.article-content ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
}

.article-content li {
    margin-bottom: 0.5rem;
}
</style>