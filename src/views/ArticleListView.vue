<template>
    <div class="article-list-container">
        <div class="header">
            <h1>文章列表</h1>
            <div class="header-controls">
                <div class="stats">
                    <span>共 {{ total }} 篇文章</span>
                    <span v-if="totalPages > 0" class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
                    <span v-else-if="!loading" class="page-info">暂无数据</span>
                </div>
                <div class="controls">
                    <div class="page-size-selector">
                        <label>每页显示：</label>
                        <select v-model="pageSize" @change="handlePageSizeChange">
                            <option value="5">5篇</option>
                            <option value="10">10篇</option>
                            <option value="20">20篇</option>
                            <option value="50">50篇</option>
                        </select>
                    </div>
                </div>
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
            <div class="debug-info" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; font-size: 0.8rem;">
                <p><strong>调试信息：</strong></p>
                <p>API返回的总数: {{ total }}</p>
                <p>当前页: {{ currentPage }}</p>
                <p>每页数量: {{ pageSize }}</p>
                <p>计算的总页数: {{ totalPages }}</p>
                <p>当前页文章数量: {{ articles.length }}</p>
                <p>请求参数: page={{ currentPage }}, size={{ pageSize }}</p>
            </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="!loading && totalPages > 1" class="pagination-container">
            <!-- 基础分页按钮 -->
            <div class="pagination-controls">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
                    <span>‹</span>
                    <span class="btn-text">上一页</span>
                </button>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages" class="pagination-btn">
                    <span class="btn-text">下一页</span>
                    <span>›</span>
                </button>
            </div>

            <!-- 页码导航 -->
            <div class="page-navigation">
                <!-- 第一页 -->
                <span v-if="paginationConfig.showFirst" 
                      @click="changePage(1)" 
                      class="page-num">
                    1
                </span>
                
                <!-- 第一个省略号 -->
                <span v-if="paginationConfig.showFirstEllipsis" class="ellipsis">...</span>
                
                <!-- 中间页码 -->
                <span v-for="page in paginationConfig.middlePages" 
                      :key="page" 
                      @click="changePage(page)"
                      :class="{ active: page === currentPage }" 
                      class="page-num">
                    {{ page }}
                </span>
                
                <!-- 最后一个省略号 -->
                <span v-if="paginationConfig.showLastEllipsis" class="ellipsis">...</span>
                
                <!-- 最后一页 -->
                <span v-if="paginationConfig.showLast" 
                      @click="changePage(totalPages)" 
                      class="page-num">
                    {{ totalPages }}
                </span>
            </div>

            <!-- 快速跳转 -->
            <div class="jump-to">
                <span>跳至</span>
                <input 
                    type="number" 
                    v-model.number="jumpPage" 
                    min="1" 
                    :max="totalPages"
                    @keyup.enter="handleJumpPage"
                    class="jump-input"
                />
                <span>页</span>
                <button @click="handleJumpPage" class="jump-btn">GO</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getArticles } from '@/api/article';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 状态管理
const articles = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const jumpPage = ref(1);
const isLoggedIn = computed(() => authStore.isLoggedIn);

// 计算属性
const totalPages = computed(() => {
    if (total.value === 0) return 0;
    return Math.ceil(total.value / pageSize.value);
});
// 页码导航的计算逻辑
const paginationConfig = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    
    if (total <= 7) {
        // 总页数少于等于7页时，显示所有页码
        const pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return {
            showFirst: false,
            showLastEllipsis: false,
            showFirstEllipsis: false,
            showLast: false,
            middlePages: pages
        };
    }
    
    // 总页数大于7页时的复杂逻辑
    const showFirst = current > 4;
    const showLast = current < total - 3;
    const showFirstEllipsis = current > 5;
    const showLastEllipsis = current < total - 4;
    
    let startPage, endPage;
    
    if (current <= 4) {
        // 当前页靠近开头
        startPage = 1;
        endPage = 5;
    } else if (current >= total - 3) {
        // 当前页靠近结尾
        startPage = total - 4;
        endPage = total;
    } else {
        // 当前页在中间
        startPage = current - 2;
        endPage = current + 2;
    }
    
    const middlePages = [];
    for (let i = startPage; i <= endPage; i++) {
        middlePages.push(i);
    }
    
    return {
        showFirst,
        showFirstEllipsis,
        showLastEllipsis,
        showLast,
        middlePages
    };
});

// 方法
const fetchArticles = async () => {
    loading.value = true;
    error.value = null;

    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value
        };

        console.log('请求参数:', params);
        const res = await getArticles(params);
        console.log('完整API响应:', res);
        console.log('响应数据结构:', res.data);
        
        if (res.data && res.data.code === 200) {
            const responseData = res.data.data || {};
            console.log('data字段内容:', responseData);
            
            // 重置数据
            articles.value = [];
            total.value = 0;
            
            // 根据实际API响应结构解析数据
            if (responseData.articles && Array.isArray(responseData.articles)) {
                // 标准分页结构：{ articles: [], total: number }
                articles.value = responseData.articles;
                total.value = responseData.total || 0;
                console.log('使用标准分页结构');
            } else if (Array.isArray(responseData)) {
                // data直接是数组的情况
                articles.value = responseData;
                // 查找total字段在响应的其他位置
                total.value = res.data.total || res.data.count || responseData.length;
                console.log('使用数组结构，total来源:', res.data.total ? 'res.data.total' : res.data.count ? 'res.data.count' : 'array.length');
            } else {
                // 其他结构，尝试找到合适的字段
                const articleArray = responseData.content || responseData.list || responseData.items || [];
                articles.value = Array.isArray(articleArray) ? articleArray : [];
                total.value = responseData.total || responseData.totalElements || responseData.count || 0;
                console.log('使用备用结构解析');
            }
            
            console.log('最终解析结果:', {
                articles: articles.value,
                articlesLength: articles.value.length,
                total: total.value,
                currentPage: currentPage.value,
                pageSize: pageSize.value
            });
        } else {
            throw new Error(res.data?.message || '获取文章列表失败');
        }
    } catch (err) {
        error.value = err.message || '加载文章失败，请稍后重试';
        console.error('获取文章列表失败:', err);
        articles.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

const changePage = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    currentPage.value = page;
    jumpPage.value = page; // 同步跳转输入框
    fetchArticles();

    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// 处理每页显示数量变化
const handlePageSizeChange = () => {
    // 重置到第一页，因为改变页面大小可能影响总页数
    currentPage.value = 1;
    jumpPage.value = 1;
    fetchArticles();
};

// 处理页面跳转
const handleJumpPage = () => {
    const page = parseInt(jumpPage.value);
    if (isNaN(page) || page < 1 || page > totalPages.value) {
        jumpPage.value = currentPage.value; // 重置为当前页
        return;
    }
    changePage(page);
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
onMounted(async () => {
    // 初始化认证状态
    await authStore.init();
    // 加载文章列表
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
    margin-bottom: 2rem;
}

.header h1 {
    margin-bottom: 1rem;
}

.header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.stats {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.page-info {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.page-size-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.page-size-selector label {
    color: var(--text-secondary);
}

.page-size-selector select {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-card);
    color: var(--text-primary);
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
.pagination-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-top: 3rem;
}

.pagination-controls {
    display: flex;
    gap: 1rem;
}

.pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background-color: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.9rem;
}

.pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
    border-color: var(--text-link);
    color: var(--text-link);
    background-color: rgba(59, 130, 246, 0.05);
}

.pagination-btn:not(:disabled):active {
    transform: translateY(1px);
}

.page-navigation {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: var(--shadow);
}

.page-num {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    user-select: none;
}

.page-num:hover {
    background-color: var(--bg-secondary);
    color: var(--text-link);
}

.page-num.active {
    background-color: var(--text-link);
    color: var(--text-on-accent);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.ellipsis {
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-weight: bold;
    user-select: none;
}

.jump-to {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.jump-input {
    width: 60px;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-card);
    color: var(--text-primary);
    text-align: center;
    font-size: 0.9rem;
    transition: border-color 0.3s;
}

.jump-input:focus {
    outline: none;
    border-color: var(--text-link);
}

.jump-btn {
    padding: 0.4rem 0.8rem;
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.3s;
}

.jump-btn:hover {
    background-color: var(--text-link-hover);
    transform: translateY(-1px);
}

/* 无文章提示 */
.no-articles {
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
    color: var(--text-secondary);
}

/* 响应式布局 */
@media (max-width: 768px) {
    .header-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .controls {
        width: 100%;
        justify-content: space-between;
    }

    .pagination-container {
        gap: 1rem;
    }

    .pagination-controls {
        order: 2;
    }

    .page-navigation {
        order: 1;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.2rem;
        padding: 0.4rem;
    }

    .page-num {
        min-width: 36px;
        height: 36px;
        font-size: 0.9rem;
    }

    .pagination-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }

    .btn-text {
        display: none;
    }

    .jump-to {
        order: 3;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .page-size-selector {
        width: 100%;
    }
}
</style>