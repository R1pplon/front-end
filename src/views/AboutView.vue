<template>
    <div class="about-container">
        <div class="about-header">
            <div class="profile-image">
                <img :src="profileImageUrl" alt="个人照片" />
            </div>
            <h1>关于我</h1>
            <div class="social-links">
                <a href="https://github.com/yourusername" target="_blank" class="social-link">
                    <i class="fab fa-github"></i>
                </a>
                <a href="mailto:your.email@example.com" class="social-link">
                    <i class="fas fa-envelope"></i>
                </a>
                <a href="https://linkedin.com/in/yourusername" target="_blank" class="social-link">
                    <i class="fab fa-linkedin"></i>
                </a>
            </div>
        </div>

        <div class="about-content">
            <section class="intro-section">
                <h2>👋 你好，我是一名全栈开发者</h2>
                <p class="intro-text">
                    热爱编程，热爱创造，热爱分享。我相信技术能够改变世界，而分享知识能让这个改变来得更快。
                    这个博客就是我记录学习、分享经验的地方。
                </p>
            </section>

            <section class="skills-section">
                <h2>🛠️ 技术栈</h2>
                <div class="skills-grid">
                    <div class="skill-category">
                        <h3>前端开发</h3>
                        <ul>
                            <li>Vue.js</li>
                            <li>React</li>
                            <li>TypeScript</li>
                            <li>HTML5 & CSS3</li>
                        </ul>
                    </div>
                    <div class="skill-category">
                        <h3>后端开发</h3>
                        <ul>
                            <li>Java & Spring Boot</li>
                            <li>Node.js</li>
                            <li>Python</li>
                            <li>RESTful APIs</li>
                        </ul>
                    </div>
                    <div class="skill-category">
                        <h3>数据库</h3>
                        <ul>
                            <li>MySQL</li>
                            <li>MongoDB</li>
                            <li>Redis</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section class="journey-section">
                <h2>🎯 我的历程</h2>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="time">2023 - 现在</div>
                        <div class="content">
                            <h3>全栈开发工程师</h3>
                            <p>专注于构建现代化的 Web 应用，同时维护这个技术博客，分享学习心得。</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="time">2021 - 2023</div>
                        <div class="content">
                            <h3>后端开发工程师</h3>
                            <p>负责企业级应用的后端开发，主要使用 Java 和 Spring Boot。</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="time">2017 - 2021</div>
                        <div class="content">
                            <h3>计算机科学专业</h3>
                            <p>大学期间接触编程，爱上了软件开发。</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="interests-section">
                <h2>🌟 兴趣爱好</h2>
                <p>
                    除了编程，我还喜欢：
                </p>
                <ul class="interests-list">
                    <li>📚 阅读技术书籍和科幻小说</li>
                    <li>🎮 玩游戏（特别是独立游戏）</li>
                    <li>🎵 听音乐（主要是电子音乐和古典音乐）</li>
                    <li>✍️ 写技术博客和分享经验</li>
                </ul>
            </section>

            <section class="contact-section">
                <h2>📫 联系我</h2>
                <p>
                    如果你对我的文章有任何问题，或者想要交流技术，欢迎通过以下方式联系我：
                </p>
                <ul class="contact-list">
                    <li>📧 Email: your.email@example.com</li>
                    <li>💬 微信: your_wechat_id</li>
                    <li>🐦 Twitter: @your_twitter</li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { API_CONFIG } from '@/config';

const profileImageUrl = computed(() => `${API_CONFIG.STATIC_URL}/images/profile-image.jpg`);
</script>

<style scoped>
.about-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
}

.about-header {
    text-align: center;
    margin-bottom: 3rem;
}

.profile-image {
    width: 200px;
    height: 200px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid var(--text-link);
}

.profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.about-header h1 {
    font-size: 2.5rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
}

.social-link {
    color: var(--text-secondary);
    font-size: 1.5rem;
    transition: color 0.3s;
}

.social-link:hover {
    color: var(--text-link);
}

.about-content {
    color: var(--text-primary);
}

.about-content section {
    margin-bottom: 3rem;
}

.about-content h2 {
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.intro-text {
    font-size: 1.2rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
}

.skill-category h3 {
    color: var(--text-link);
    margin-bottom: 1rem;
}

.skill-category ul {
    list-style: none;
    padding: 0;
}

.skill-category li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.timeline {
    margin-top: 1.5rem;
}

.timeline-item {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.timeline-item .time {
    color: var(--text-link);
    font-weight: bold;
}

.timeline-item .content h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.timeline-item .content p {
    color: var(--text-secondary);
}

.interests-list, .contact-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
}

.interests-list li, .contact-list li {
    margin-bottom: 0.8rem;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .about-container {
        padding: 1rem;
    }

    .timeline-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .skills-grid {
        grid-template-columns: 1fr;
    }
}
</style>