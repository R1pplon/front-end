<template>
    <div class="not-found-container">
        <div class="not-found-content">
            <div class="error-code">404</div>
            <h1 class="title">页面未找到</h1>
            <p class="description">
                很抱歉，您访问的页面可能已被移动、删除或暂时不可用。
            </p>

            <div class="actions">
                <button @click="goBack" class="action-btn back-btn">
                    <i class="fas fa-arrow-left"></i> 返回上一页
                </button>
                <router-link to="/" class="action-btn home-btn">
                    <i class="fas fa-home"></i> 返回首页
                </router-link>
            </div>

            <div class="links-section">
                <h3>您可能想访问以下页面：</h3>
                <div class="page-links">
                    <router-link to="/">首页</router-link>
                    <router-link to="/articles">文章列表</router-link>
                    <router-link to="/about">关于我</router-link>
                    <router-link to="/login">登录</router-link>
                    <router-link to="/register">注册</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 搜索功能
const search = () => {
    if (searchQuery.value.trim()) {
        router.push({ path: '/search', query: { q: searchQuery.value } });
    }
};
</script>

<style scoped>
.not-found-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--bg-secondary);
    padding: 20px;
}

.not-found-content {
    max-width: 650px;
    text-align: center;
    padding: 40px;
    background-color: var(--bg-card);
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

/* 添加一些装饰效果 */
.not-found-content:before {
    content: "";
    position: absolute;
    top: -30px;
    right: -30px;
    width: 120px;
    height: 120px;
    border: 10px solid var(--text-link);
    border-radius: 50%;
    opacity: 0.1;
}

.error-code {
    font-size: 8rem;
    font-weight: 900;
    line-height: 1;
    color: var(--text-primary);
    margin-bottom: 15px;
    opacity: 0.9;
    background: linear-gradient(135deg, #42b983, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

.title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: var(--text-primary);
}

.description {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 30px;
    line-height: 1.6;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
}

.action-btn {
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    text-decoration: none;
}

.back-btn {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.back-btn:hover {
    background-color: var(--bg-secondary);
    transform: translateY(-2px);
}

.home-btn {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
}

.home-btn:hover {
    background-color: var(--text-link-hover);
    transform: translateY(-2px);
}

.search-container {
    display: flex;
    margin-bottom: 30px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.search-input {
    flex: 1;
    padding: 14px 20px;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: var(--text-primary);
}

.search-input:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--text-link);
}

.search-btn {
    padding: 0 25px;
    border: none;
    background-color: var(--text-link);
    color: var(--text-on-accent);
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.search-btn:hover {
    background-color: var(--text-link-hover);
}

.links-section {
    background-color: var(--bg-primary);
    padding: 20px;
    border-radius: 8px;
    margin-top: 30px;
}

.links-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-secondary);
    font-weight: 500;
}

.page-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
}

.page-links a {
    padding: 8px 16px;
    background-color: var(--bg-secondary);
    border-radius: 6px;
    text-decoration: none;
    color: var(--text-secondary);
    transition: all 0.3s;
}

.page-links a:hover {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    transform: translateY(-2px);
}

/* 动画效果 */
@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

.error-code {
    animation: float 3s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .not-found-content {
        padding: 30px 20px;
    }

    .error-code {
        font-size: 6rem;
    }

    .title {
        font-size: 2rem;
    }

    .actions {
        flex-direction: column;
        gap: 10px;
    }

    .search-container {
        flex-direction: column;
    }

    .search-input {
        padding: 12px 15px;
    }

    .search-btn {
        padding: 12px;
    }
}
</style>