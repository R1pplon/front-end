<template>
    <div class="comment-item">
        <div class="comment-header">
            <img :src="comment.avatarUrl || defaultAvatar" :alt="comment.username" class="avatar" />
            <div class="info">
                <span class="username">{{ comment.username }}</span>
                <span class="timestamp">{{ formatDate(comment.createTime) }}</span>
            </div>

            <div class="actions">
                <button class="action-btn" @click="toggleReplyForm">
                    <i class="fas fa-reply"></i> 回复
                </button>
                <button class="action-btn" @click="toggleLike">
                    <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                    {{ likeCount }}
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
import { ref, computed, onMounted } from 'vue';
import ReplyForm from './ReplyForm.vue';
import { formatDate } from '@/utils/date';  // 确保路径正确

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
const isLiked = ref(false);
const likeCount = ref(props.comment.likeCount || 0);
const defaultAvatar = 'https://i.pravatar.cc/100';

onMounted(() => {
    // 初始化点赞状态（实际应用中应从用户信息中获取）
    isLiked.value = props.currentUser.id ?
        (props.comment.likedBy || []).includes(props.currentUser.id) :
        false;

    // 如果评论有点赞计数，则使用它
    if (props.comment.likeCount !== undefined) {
        likeCount.value = props.comment.likeCount;
    }
});

const toggleReplyForm = () => {
    showReplyForm.value = !showReplyForm.value;
    if (showReplyForm.value) {
        emit('reply', props.comment);
    }
};

const cancelReply = () => {
    showReplyForm.value = false;
};

const toggleLike = async () => {
    if (!props.currentUser.id) {
        // 实际应用中应该提示用户登录
        alert('请先登录后再操作');
        return;
    }

    try {
        // 模拟调用API
        // await likeComment(props.comment.id);

        isLiked.value = !isLiked.value;

        // 更新点赞计数
        if (isLiked.value) {
            likeCount.value += 1;
        } else {
            likeCount.value = Math.max(0, likeCount.value - 1);
        }

        // 通知父组件点赞状态已更新
        emit('like', props.comment.id);
    } catch (error) {
        console.error('点赞失败:', error);
    }
};

const onSubmitReply = (content) => {
    emit('reply', props.comment, content);
    showReplyForm.value = false;
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