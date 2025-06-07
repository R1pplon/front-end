<template>
    <div class="profile-container">
        <h1>个人资料</h1>
        <div class="profile-content">
            <div class="profile-card">
                <div class="profile-header">
                    <img :src="user.avatar || '/default-avatar.jpg'" alt="用户头像" class="avatar" />
                    <h2>{{ user.username }}</h2>
                    <div class="user-role" v-if="user.role === 'admin'">
                        <span class="badge admin">管理员</span>
                    </div>
                </div>

                <div class="profile-info">
                    <div class="info-item">
                        <span class="label">邮箱:</span>
                        <span class="value">{{ user.email || '未设置' }}</span>
                    </div>

                    <div class="info-item">
                        <span class="label">注册日期:</span>
                        <span class="value">{{ formatDate(user.createdAt) }}</span>
                    </div>

                    <div class="info-item">
                        <span class="label">个人简介:</span>
                        <p class="bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>
                    </div>
                </div>

                <div class="profile-actions">
                    <button @click="editProfile" class="edit-btn">编辑资料</button>
                </div>
            </div>

            <div class="stats-section">
                <div class="stats-card">
                    <span class="stat-label">评论总数</span>
                    <span class="stat-value">{{ user.stats?.comments || 0 }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getToken } from '@/utils/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref({
    id: 1,
    username: '加载中...',
    email: 'user@example.com',
    avatar: null,
    bio: '',
    createdAt: new Date().toISOString(),
    role: 'user',
    stats: {
        comments: 42
    }
});

// 格式化日期显示
const formatDate = (dateString) => {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// 获取用户信息
const fetchUserProfile = async () => {
    // 这里调用API获取用户信息
    // 模拟API调用
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id: 1,
                username: '张三',
                email: 'zhangsan@example.com',
                avatar: null,
                bio: '热爱编程的前端工程师，专注于Vue和React开发',
                createdAt: '2023-01-15T10:30:00.000Z',
                role: 'user',
                stats: {
                    comments: 42,
                }
            });
        }, 800);
    });
};

// 编辑资料
const editProfile = () => {
    router.push('/settings');
};

onMounted(async () => {
    // 检查token
    const token = getToken();
    if (!token) {
        router.push('/login');
        return;
    }

    try {
        const userData = await fetchUserProfile();
        user.value = userData;
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
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

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
    background-color: #f0f0f0;
    border: 2px solid #ddd;
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

.profile-actions {
    display: flex;
    justify-content: center;
}

.edit-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--text-link);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
}

.edit-btn:hover {
    background-color: var(--text-link-hover);
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

/* 响应式设计 */
@media (max-width: 768px) {
    .profile-content {
        flex-direction: column;
    }
}
</style>