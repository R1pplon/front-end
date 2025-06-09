<template>
    <div class="home-container">
        <header class="hero-section">
            <h1 class="welcome-text">你好，我是 <span class="highlight">R1pple</span></h1>
            <p class="tagline">Java 开发者 · 技术爱好者</p>
        </header>

        <section class="bio-section">
            <div class="bio-card">
                <div class="info-item">
                    <i class="icon">👤</i>
                    <span class="label">昵称:</span>
                    <span class="value">R1pple</span>
                </div>

                <div class="info-item">
                    <i class="icon">📧</i>
                    <span class="label">邮箱:</span>
                    <a href="mailto:your-email@example.com" class="value">your-email@example.com</a>
                </div>

                <div class="info-item">
                    <i class="icon">👨‍💻</i>
                    <span class="label">GitHub:</span>
                    <a href="https://github.com/R1pplon" target="_blank" class="value">github.com/R1pple</a>
                </div>

                <div class="info-item">
                    <i class="icon">📝</i>
                    <span class="label">技能:</span>
                    <span class="value">Java, Spring Boot, Vue.js, MySQL</span>
                </div>
            </div>
        </section>

        <section class="experience-section">
            <h2 class="section-title">工作经历</h2>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-date">2020 - 至今</div>
                    <div class="timeline-content">
                        <h3>Java 开发工程师 · 某科技公司</h3>
                        <p>负责核心业务系统开发，优化系统架构，提高系统性能和稳定性。</p>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-date">2018 - 2020</div>
                    <div class="timeline-content">
                        <h3>后端开发工程师 · 某创业公司</h3>
                        <p>参与公司产品后台系统的设计与开发，使用 Spring Boot 构建微服务架构。</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <router-link to="/articles" class="cta-button">查看我的文章</router-link>
            <router-link to="/about" class="cta-button secondary">了解更多</router-link>
        </section>
    </div>
</template>

<script setup>
// 如果后面需要添加交互逻辑可以在这里编写
</script>

<style scoped>
/* 全局容器使用主背景色 */
.home-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

/* 顶部区域 */
.hero-section {
    text-align: center;
    margin-bottom: 3rem;
}

.welcome-text {
    font-size: 2.5rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

/* 使用主链接色 */
.highlight {
    color: var(--text-link);
    font-weight: 600;
}

.tagline {
    font-size: 1.2rem;
    color: var(--text-secondary);
}

/* 信息卡片 */
.bio-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    /* 添加边框 */
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    margin-bottom: 2.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.icon {
    font-size: 1.2rem;
    margin-right: 1rem;
    width: 30px;
    text-align: center;
    color: var(--text-secondary);
}

.label {
    font-weight: 500;
    margin-right: 0.5rem;
    width: 80px;
    color: var(--text-secondary);
}

.value {
    color: var(--text-primary);
}

a.value {
    color: var(--text-link);
    text-decoration: none;
    transition: color 0.3s;
}

a.value:hover {
    color: var(--text-link-hover);
    text-decoration: underline;
}

/* 经历部分 */
.experience-section {
    margin-bottom: 2.5rem;
}

.section-title {
    font-size: 1.5rem;
    position: relative;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
}

.section-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: var(--text-link);
    /* 使用主题链接色 */
}

.timeline {
    position: relative;
    padding-left: 20px;
}

.timeline::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background-color: var(--border-color);
    /* 使用边框色 */
}

.timeline-item {
    position: relative;
    margin-bottom: 2rem;
}

.timeline-date {
    position: relative;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.timeline-date::before {
    content: "";
    position: absolute;
    left: -24px;
    top: 8px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--text-link);
    /* 使用主题链接色 */
    border: 2px solid var(--bg-card);
    /* 边框与卡片背景相同 */
    z-index: 1;
}

.timeline-content {
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
}

.timeline-content h3 {
    margin-top: 0;
    font-size: 1.2rem;
    color: var(--text-primary);
}

.timeline-content p {
    color: var(--text-secondary);
    margin-bottom: 0;
}

/* 行动按钮 */
.cta-section {
    text-align: center;
    margin-top: 3rem;
}

.cta-button {
    display: inline-block;
    padding: 0.8rem 2rem;
    margin: 0 0.5rem;
    background-color: var(--text-link);
    color: var(--text-on-accent);
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
}

.cta-button.secondary {
    background-color: transparent;
    color: var(--text-link);
    border: 1px solid var(--text-link);
}

.cta-button:hover {
    background-color: var(--text-link-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.cta-button.secondary:hover {
    background-color: var(--bg-secondary);
}
</style>