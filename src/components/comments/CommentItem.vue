<template>
    <div class="comment-item">
        <div class="comment-header">
            <img :src="avatarUrl" :alt="comment.username" class="avatar" />
            <div class="info">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ formatTime(comment.createTime) }}</span>
            </div>

            <div class="actions">
                <button class="action-btn" @click="toggleReplyForm">
                    <i class="fas fa-reply"></i> 回复
                </button>
            </div>
        </div>

        <div class="comment-content">
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
    }
});

const emit = defineEmits(['reply', 'like']);

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
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.action-btn:hover {
    background-color: var(--bg-secondary);
    color: var(--text-link);
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
}
</style>