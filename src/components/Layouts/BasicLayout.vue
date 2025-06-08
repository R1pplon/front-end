<template>
    <div class="layout-container">
        <header>
            <nav class="main-nav">
                <router-link to="/" class="logo">我的博客</router-link>
                <div class="nav-links">
                    <router-link to="/">首页</router-link>
                    <router-link to="/articles">文章</router-link>
                    <router-link to="/about">关于我</router-link>
                </div>
                <div class="user-actions">
                    <button class="theme-toggle" @click="toggleTheme" :aria-label="isDarkTheme ? '切换为亮色主题' : '切换为暗色主题'">
                        {{ themeIcon }}
                    </button>

                    <!-- 添加加载状态 -->
                    <div v-if="authStore.loading" class="auth-loading">
                        <span>检查登录状态...</span>
                    </div>

                    <!-- 使用全局状态 -->
                    <template v-else-if="authStore.isLoggedIn">
                        <router-link to="/profile" class="user-info">
                            <img :src="authStore.avatar || defaultAvatar" class="avatar" alt="用户头像">
                            <span>{{ authStore.username }}</span>
                        </router-link>
                        <button @click="logout" class="logout-btn">退出</button>
                    </template>
                    <template v-else>
                        <router-link to="/login" class="login-btn">登录</router-link>
                        <router-link to="/register" class="register-btn">注册</router-link>
                    </template>
                </div>
            </nav>
        </header>

        <main>
            <!-- 页面内容会插入到这里 -->
            <router-view />
        </main>

        <footer>
            <p>© 2023 我的个人博客 |
                <router-link to="/admin">管理员入口</router-link>
            </p>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { logout as authLogout } from '@/utils/auth';
import defaultAvatar from '@/assets/default-avatar.jpg';

const router = useRouter();

// 使用全局认证状态
const authStore = useAuthStore();
const { isLoggedIn, user } = storeToRefs(authStore);

// 用户头像处理
const userAvatar = ref(defaultAvatar);

// 监听头像加载错误
const handleAvatarError = () => {
    userAvatar.value = defaultAvatar;
};

// 在组件挂载时设置初始头像
onMounted(() => {
    if (authStore.user?.avatarUrl) {
        userAvatar.value = authStore.user.avatarUrl;
    }
});

// 登出功能
const logout = () => {
    // 清除本地凭证
    authLogout();

    // 更新全局状态
    authStore.logout();

    // 重定向到首页
    router.push('/');

    // 显示登出成功的消息
    showMessage('您已成功退出');
};

// 显示消息函数
const showMessage = (message) => {
    // 这里可以替换为项目中使用的通知组件
    console.log(message);
};

// 主题管理
const isDarkTheme = ref(false);

// 主题切换逻辑
const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    // 更新DOM属性
    document.documentElement.setAttribute(
        'data-theme',
        isDarkTheme.value ? 'dark' : ''
    );
    // 保存到本地存储
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
};

// 根据主题返回对应的图标
const themeIcon = computed(() => {
    return isDarkTheme.value ? '🌙' : '☀️';
});

// 初始化时检测保存的主题偏好
onMounted(() => {
    // 从本地存储读取
    const savedTheme = localStorage.getItem('theme');
    // 检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        isDarkTheme.value = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // 初始化认证状态
    authStore.init();
});
</script>

<style scoped>
/* 添加认证加载状态样式 */
.auth-loading {
    padding: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
}

/* 保持原有的样式不变 */
.layout-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

header {
    background-color: var(--bg-primary);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
    color: var(--text-primary);
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    text-decoration: none;
    color: var(--text-secondary);
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--text-link);
}

.nav-links a.router-link-active {
    color: var(--text-link);
    font-weight: 500;
}

.user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    gap: 0.5rem;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

/* 按钮样式 */
.login-btn,
.register-btn,
.logout-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s;
    cursor: pointer;
}

.login-btn {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.register-btn {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
}

.logout-btn {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.login-btn:hover,
.logout-btn:hover {
    background-color: var(--bg-secondary);
}

.register-btn:hover {
    background-color: var(--text-link-hover);
}

/* 主题切换按钮样式 */
.theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

/* 在暗色主题下悬停效果不同 */
[data-theme="dark"] .theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

footer {
    text-align: center;
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.9rem;
}

footer a {
    color: var(--text-link);
    text-decoration: none;
}

footer a:hover {
    text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-nav {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .nav-links {
        order: 3;
        width: 100%;
        justify-content: center;
        margin-top: 1rem;
    }
}
</style>