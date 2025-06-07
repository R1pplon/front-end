<template>
    <div class="comment-tree">
        <div v-for="comment in comments" :key="comment.id" class="comment-node"
            :class="{ 'has-replies': comment.replies && comment.replies.length }"
            :style="{ 'margin-left': `${indent * 20}px` }">
            <CommentItem :comment="comment" :article-id="articleId" :current-user="currentUser" @reply="onReply"
                @like="onLike" />

            <CommentTree v-if="comment.replies && comment.replies.length" :comments="comment.replies"
                :article-id="articleId" :indent="indent + 1" :current-user="currentUser" @reply="onReply"
                @like="onLike" />
        </div>
    </div>
</template>

<script setup>
import CommentItem from './CommentItem.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    comments: {
        type: Array,
        required: true
    },
    articleId: {
        type: [String, Number],
        required: true
    },
    indent: {
        type: Number,
        default: 0
    },
    currentUser: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['reply', 'like']);

const onReply = (comment) => {
    emit('reply', comment);
};

const onLike = (commentId) => {
    emit('like', commentId);
};
</script>

<style scoped>
.comment-tree {
    position: relative;
}

.comment-node {
    margin-bottom: 1.5rem;
    transition: all 0.3s;
}

.comment-node:before {
    content: "";
    position: absolute;
    left: -15px;
    top: 24px;
    bottom: 10px;
    width: 1px;
    background-color: var(--border-color);
}

.comment-node:not(:first-child) {
    padding-top: 1rem;
    border-top: 1px dashed var(--border-color);
}

.comment-node.has-replies {
    margin-bottom: 2rem;
    padding-bottom: 0.5rem;
}
</style>