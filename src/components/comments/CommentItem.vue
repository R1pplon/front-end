<template>
    <div class="comment-item" :class="{ 'reply-comment': indent > 0 }">
        <div class="comment-header">
            <img :src="avatarUrl" :alt="comment.username" class="avatar" />
            <div class="info">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ formatTime(comment.createTime) }}</span>
            </div>

            <div class="actions">
                <button class="action-btn" @click="toggleReplyForm" v-if="currentUser.id">
                    <i class="fas fa-reply"></i> 回复
                </button>
                <button class="action-btn delete-btn" @click="handleDelete" v-if="canDelete">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>

        <div class="comment-content">
            <span v-if="comment.parentUsername" class="reply-to">回复 @{{ comment.parentUsername }}：</span>
            {{ comment.content }}
        </div>

        <ReplyForm v-if="showReplyForm" :parent-id="comment.id" :article-id="articleId" :current-user="currentUser"
            @submit="onSubmitReply" @cancel="cancelReply" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ReplyForm from './ReplyForm.vue';
import { formatDate } from '@/utils/date';  // 确保路径正确
import defaultAvatar from '@/assets/default-avatar.jpg';
import { API_CONFIG } from '@/config';

const props = defineProps({
    comment: {
        type: Object,
        required: true
    },
    articleId: {
        type: [String, Number],
        required: true
    },
    currentUser: {
        type: Object,
        default: () => ({})
    },
    indent: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['reply', 'like', 'delete']);

const showReplyForm = ref(false);
const likeCount = ref(props.comment.likeCount || 0);


const toggleReplyForm = () => {
    showReplyForm.value = !showReplyForm.value;
    if (showReplyForm.value) {
        emit('reply', props.comment);
    }
};

const cancelReply = () => {
    showReplyForm.value = false;
};

const onSubmitReply = (content) => {
    emit('reply', props.comment, content);
    showReplyForm.value = false;
};

// 时间格式化函数
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }
    // 小于24小时
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 小于30天
    if (diff < 2592000000) {
        return `${Math.floor(diff / 86400000)}天前`;
    }
    
    // 超过30天显示具体日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 处理头像URL的计算属性
const avatarUrl = computed(() => {
    if (!props.comment.avatarUrl) {
        return defaultAvatar;
    }
    // 如果已经是完整的URL（以http开头），直接返回
    if (props.comment.avatarUrl.startsWith('http')) {
        return props.comment.avatarUrl;
    }
    // 否则，拼接基础URL
    return `${API_CONFIG.BASE_URL}${props.comment.avatarUrl}`;
});

// 判断是否可以删除评论
const canDelete = computed(() => {
    // 检查用户是否已登录且有用户数据
    if (!props.currentUser || !props.currentUser.id) {
        return false;
    }
    
    // 检查评论数据是否完整
    if (!props.comment || !props.comment.username) {
        return false;
    }
    
    // 通过用户名判断是否为当前用户的评论
    const currentUsername = String(props.currentUser.username || '').trim();
    const commentUsername = String(props.comment.username || '').trim();
    
    return currentUsername === commentUsername;
});

// 处理删除评论
const handleDelete = () => {
    emit('delete', props.comment.id);
};
</script>

<style scoped>
.comment-item {
    background-color: var(--bg-card);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    margin-bottom: 1.5rem;
}

.comment-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.8rem;
}

.info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
}

.timestamp {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: none;
    border: none;
    padding: 0.3rem 0.5rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    position: relative;
    overflow: hidden;
}

.action-btn:hover {
    background-color: var(--bg-secondary);
    color: var(--text-link);
    transform: translateY(-1px); /* 轻微上浮效果 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.action-btn:active {
    transform: translateY(0); /* 点击时恢复位置 */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 为回复按钮添加特殊的hover效果 */
.action-btn:not(.delete-btn)::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.6s;
}

.action-btn:not(.delete-btn):hover::before {
    left: 100%;
}

.comment-content {
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--text-primary);
    padding: 0 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .comment-header {
        flex-wrap: wrap;
    }

    .actions {
        width: 100%;
        margin-top: 0.5rem;
        justify-content: flex-end;
    }
    
    /* 移动端二级评论进一步缩小 */
    .reply-comment {
        padding: 0.6rem;
    }
    
    .reply-comment .avatar {
        width: 24px;
        height: 24px;
    }
}

.reply-to {
    color: var(--text-link);
    margin-right: 0.5rem;
}

.delete-btn {
    color: var(--text-secondary); /* 默认状态和回复按钮一样的灰色 */
    position: relative;
    overflow: hidden;
}

.delete-btn:hover {
    background-color: #fef2f2; /* 浅红色背景 */
    color: #dc2626; /* hover时变成红色 */
    transform: translateY(-1px); /* 轻微上浮效果 */
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2); /* 红色阴影 */
}

.delete-btn:active {
    transform: translateY(0); /* 点击时恢复位置 */
    box-shadow: 0 1px 2px rgba(220, 38, 38, 0.2);
}

/* 为删除按钮添加特殊的hover效果 */
.delete-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
    transition: left 0.6s;
}

.delete-btn:hover::before {
    left: 100%;
}

/* 二级评论的样式调整 */
.reply-comment {
    padding: 0.8rem; /* 减少内边距 */
    margin-bottom: 1rem; /* 减少下边距 */
    background-color: var(--bg-secondary); /* 稍微不同的背景色 */
    border-left: 3px solid var(--text-link); /* 添加左边框指示这是回复 */
}

.reply-comment .avatar {
    width: 28px; /* 缩小头像 */
    height: 28px;
    margin-right: 0.6rem;
}

.reply-comment .username {
    font-size: 0.85rem; /* 缩小用户名字体 */
    font-weight: 500; /* 减轻字体权重 */
}

.reply-comment .time {
    font-size: 0.75rem; /* 缩小时间字体 */
}

.reply-comment .comment-content {
    font-size: 0.9rem; /* 缩小内容字体 */
    padding: 0 0.3rem; /* 减少内容内边距 */
}

.reply-comment .action-btn {
    padding: 0.2rem 0.4rem; /* 缩小按钮 */
    font-size: 0.8rem;
}

.reply-comment .comment-header {
    margin-bottom: 0.6rem; /* 减少头部下边距 */
}
</style>