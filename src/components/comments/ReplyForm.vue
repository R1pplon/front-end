<template>
    <div class="reply-form">

        <div class="form-group">
            <textarea v-model="content" placeholder="写下您的回复..." :rows="rows" ref="textarea"
                @input="adjustTextareaHeight"></textarea>
        </div>

        <div class="form-actions">
            <button class="cancel-btn" @click="cancel">取消</button>
            <button class="submit-btn" @click="submit" :disabled="isSubmitting || content.trim().length === 0">
                <span v-if="isSubmitting">提交中...</span>
                <span v-else>提交回复</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
    parentId: {
        type: [String, Number],
        required: true
    },
    articleId: {
        type: [String, Number],
        required: true
    },
    currentUser: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['submit', 'cancel']);

const content = ref('');
const isSubmitting = ref(false);
const textarea = ref(null);
const rows = ref(3);
const defaultAvatar = 'https://i.pravatar.cc/100';

const adjustTextareaHeight = () => {
    nextTick(() => {
        if (textarea.value) {
            textarea.value.style.height = 'auto';
            textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 200)}px`;
        }
    });
};

const submit = async () => {
    if (content.value.trim().length === 0) return;

    isSubmitting.value = true;

    try {
        // 构建回复数据
        const replyData = {
            content: content.value.trim(),
            articleId: props.articleId,
            parentId: props.parentId
        };

        // 发出提交事件
        emit('submit', content.value.trim());
        content.value = '';

    } catch (error) {
        console.error('提交回复失败:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const cancel = () => {
    emit('cancel');
};

onMounted(() => {
    if (textarea.value) {
        textarea.value.focus();
    }
});
</script>

<style scoped>
.reply-form {
    margin-top: 1rem;
    border-radius: 8px;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
}

.form-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.form-header .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 0.5rem;
    object-fit: cover;
}

textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    resize: vertical;
    min-height: 100px;
    background-color: var(--bg-card);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.95rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.8rem;
    gap: 0.8rem;
}

.cancel-btn,
.submit-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.cancel-btn {
    background-color: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

.cancel-btn:hover {
    background-color: var(--bg-primary);
    border-color: var(--text-link);
    color: var(--text-link);
}

.submit-btn {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
    background-color: var(--text-link-hover);
}
</style>