<template>
    <div class="article-list-container">
        <div class="header">
            <h1>文章列表</h1>
            <div class="stats">
                <span>共 {{ total }} 篇文章</span>
                <router-link v-if="isLoggedIn" to="/article/create" class="create-btn">
                    <i class="icon">📝</i> 新建文章
                </router-link>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
            <div class="loader"></div>
            <p>加载文章中...</p>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="error">
            <p>❌ {{ error }}</p>
            <button class="retry-btn" @click="fetchArticles">重试</button>
        </div>

        <!-- 文章列表 -->
        <div v-if="articles.length > 0" class="article-list">
            <div v-for="article in articles" :key="article.id" class="article-card"
                @click="$router.push(`/article/${article.id}`)">
                <div class="article-header">
                    <h2 class="title">{{ article.title }}</h2>
                    <div class="date">
                        <span>发表于: {{ formatDate(article.createTime) }}</span>
                        <span v-if="article.updateTime">
                            更新于: {{ formatDate(article.updateTime) }}
                        </span>
                    </div>
                </div>
                <div class="article-excerpt" v-if="article.excerpt">
                    {{ article.excerpt }}
                </div>
                <div class="meta">
                    <span class="category" v-if="article.category">
                        {{ article.category }}
                    </span>
                    <div class="tags">
                        <span v-for="tag in article.tags" :key="tag" class="tag">
                            {{ tag }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 无文章提示 -->
        <div v-if="!loading && articles.length === 0 && !error" class="no-articles">
            <p>暂无文章</p>
        </div>

        <!-- 分页控件 -->
        <div v-if="total > pageSize" class="pagination">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
                上一页
            </button>
            <div class="page-nums">
                <span v-for="page in visiblePages" :key="page" @click="changePage(page)"
                    :class="{ active: page === currentPage }" class="page-num">
                    {{ page }}
                </span>
                <span v-if="showEllipsis" class="ellipsis">...</span>
            </div>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages" class="pagination-btn">
                下一页
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getArticles } from '@/api/article';
import { useRouter } from 'vue-router';

const router = useRouter();

// 状态管理
const articles = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const isLoggedIn = ref(false); // 暂时硬编码，后续替换为实际状态

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
const visiblePages = computed(() => {
    const pages = [];
    const startPage = Math.max(1, currentPage.value - 2);
    const endPage = Math.min(totalPages.value, currentPage.value + 2);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

const showEllipsis = computed(() => visiblePages.value.length < totalPages.value &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value
);

// 方法
const fetchArticles = async () => {
    loading.value = true;
    error.value = null;

    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value
        };

        const res = await getArticles(params);
        const response = res.data;
        articles.value = response.articles || [];
        total.value = response.total || response.articles.length || 0;
    } catch (err) {
        error.value = err.message || '加载文章失败，请稍后重试';
        console.error('获取文章列表失败:', err);
    } finally {
        loading.value = false;
    }
};

const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    fetchArticles();

    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// 初始化加载
onMounted(() => {
    fetchArticles();
});
</script>

<style scoped>
.article-list-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.stats {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.create-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--text-link);
    color: var(--text-on-accent);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.3s;
}

.create-btn:hover {
    background-color: var(--text-link-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

/* 加载状态样式 */
.loading {
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

/* 错误样式 */
.error {
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
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

/* 文章列表样式 */
.article-list {
    display: grid;
    gap: 1.5rem;
}

.article-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s;
    cursor: pointer;
    box-shadow: var(--shadow);
}

.article-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    border-color: var(--text-link);
}

.article-header {
    margin-bottom: 0.5rem;
}

.title {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
    color: var(--text-primary);
}

.date {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.article-excerpt {
    margin-top: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.6;
}

.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.2rem;
    font-size: 0.9rem;
}

.category {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
}

.tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tag {
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
}

/* 分页样式 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 3rem;
}

.pagination-btn {
    padding: 0.5rem 1rem;
    background-color: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
    border-color: var(--text-link);
    color: var(--text-link);
}

.page-nums {
    display: flex;
    gap: 0.5rem;
}

.page-num {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
}

.page-num:hover {
    background-color: var(--bg-secondary);
}

.page-num.active {
    background-color: var(--text-link);
    color: var(--text-on-accent);
}

.ellipsis {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 无文章提示 */
.no-articles {
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
    color: var(--text-secondary);
}

/* 响应式布局 */
@media (max-width: 600px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .pagination {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .page-nums {
        order: 2;
        width: 100%;
        justify-content: center;
        margin: 0.5rem 0;
    }

    .pagination-btn {
        padding: 0.5rem;
    }
}
</style>