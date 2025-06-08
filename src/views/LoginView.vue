<template>
    <div class="login-container">
        <div class="login-card">
            <h1 class="login-title">欢迎回来</h1>

            <div v-if="successMessage" class="success-message">
                <i class="fas fa-check-circle"></i> {{ successMessage }}
            </div>

            <form @submit.prevent="handleSubmit" class="login-form">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="username" v-model="formData.username" placeholder="输入用户名"
                            :class="{ 'error': errors.username }" @blur="validateField('username')">
                    </div>
                    <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
                </div>

                <div class="form-group">
                    <label for="password">密码</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="password" v-model="formData.password" placeholder="输入密码"
                            :class="{ 'error': errors.password }" @blur="validateField('password')">
                    </div>
                    <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
                </div>

                <div class="remember-forgot">
                    <div class="remember-me">
                        <input type="checkbox" id="remember" v-model="rememberMe">
                        <label for="remember">记住我</label>
                    </div>
                    <router-link to="/forgot-password">忘记密码?</router-link>
                </div>

                <button type="submit" class="login-btn" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">登录</span>
                    <span v-else>登录中...</span>
                </button>

                <div v-if="errorMessage" class="error-feedback">
                    <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
                </div>
            </form>

            <div class="register-link">
                还没有账号? <router-link to="/register">立即注册</router-link>
            </div>

            <div class="oauth-login">
                <div class="divider">或使用其他方式登录</div>
                <div class="oauth-buttons">
                    <button class="oauth-btn google">
                        <i class="fab fa-google"></i> Google
                    </button>
                    <button class="oauth-btn github">
                        <i class="fab fa-github"></i> GitHub
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginUser } from '@/api/auth';
import { setToken, setUserInfo } from '@/utils/auth';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore(); // 添加使用authStore

// 表单数据
const formData = reactive({
    username: '',
    password: '',
});

// 错误消息
const errors = reactive({
    username: '',
    password: '',
});

// 表单提交状态
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const rememberMe = ref(false);

// 记住我功能初始化
onMounted(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
        formData.username = savedUsername;
        rememberMe.value = true;
    }
});

// 验证单个字段的函数
const validateField = (field) => {
    switch (field) {
        case 'username':
            if (!formData.username) {
                errors.username = '用户名不能为空';
            } else if (formData.username.length < 4 || formData.username.length > 20) {
                errors.username = '用户名长度应在4-20个字符之间';
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                errors.username = '用户名只能包含字母、数字和下划线';
            } else {
                errors.username = '';
            }
            break;

        case 'password':
            if (!formData.password) {
                errors.password = '密码不能为空';
            } else if (formData.password.length < 6) {
                errors.password = '密码长度至少为6位';
            } else {
                errors.password = '';
            }
            break;
    }
};

// 验证整个表单
const validateForm = () => {
    validateField('username');
    validateField('password');

    // 检查是否有错误
    return !Object.values(errors).some(error => error);
};
// 处理表单提交
const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        // 调用登录API
        const response = await loginUser({
            username: formData.username,
            password: formData.password
        });

        console.log('登录响应:', response);

        // 处理登录响应
        if (response.success && response.data) {
            const userData = response.data;
            
            // 存储用户信息
            setUserInfo(userData);

            // 更新全局认证状态
            authStore.login(null, userData);

            // 刷新用户角色信息
            await authStore.refreshUserRole();

            // 处理记住我选项
            if (rememberMe.value) {
                localStorage.setItem('savedUsername', formData.username);
            } else {
                localStorage.removeItem('savedUsername');
            }

            // 添加登录成功消息
            successMessage.value = '登录成功，正在跳转...';

            // 短暂延迟后跳转
            setTimeout(() => {
                const redirect = route.query.redirect || '/';
                router.push(redirect);
            }, 1000);
        } else {
            // 处理API返回的错误
            console.error('登录失败 - 错误代码:', response.code);
            console.error('错误消息:', response.message);
            errorMessage.value = response.message || '登录失败，请检查用户名和密码';
        }
    } catch (error) {
        console.error('登录捕获异常:', error);

        // 处理错误消息
        if (error.response && error.response.data) {
            errorMessage.value = error.response.data.message || '请求处理失败';
        } else if (error.message) {
            errorMessage.value = error.message;
        } else {
            errorMessage.value = '网络连接失败，请稍后重试';
        }
    } finally {
        isSubmitting.value = false;
    }
};

</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: var(--bg-secondary);
}

.login-card {
    width: 100%;
    max-width: 480px;
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: var(--shadow);
}

.login-title {
    text-align: center;
    margin-bottom: 1.8rem;
    color: var(--text-primary);
    font-size: 1.8rem;
}

.login-form {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.6rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.input-with-icon {
    position: relative;
}

.input-with-icon i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 0.9rem -1rem 0.9rem 3rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: border-color 0.3s;
}

input:focus {
    border-color: var(--text-link);
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

input.error {
    border-color: #ff5252;
}

.error-message {
    color: #ff5252;
    font-size: 0.85rem;
    margin-top: 0.4rem;
}

.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 0;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-me input {
    margin-right: 0.5rem;
}

.remember-forgot a {
    color: var(--text-link);
    text-decoration: none;
}

.remember-forgot a:hover {
    text-decoration: underline;
}

.login-btn {
    width: 100%;
    padding: 1rem;
    background-color: var(--text-link);
    color: var(--text-on-accent);
    border: none;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.login-btn:disabled {
    background-color: #b0e5cf;
    cursor: not-allowed;
}

.login-btn:not(:disabled):hover {
    background-color: var(--text-link-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.success-message {
    background-color: #d4f1db;
    color: #2e7d32;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 0.5s ease-out;
}

.error-feedback {
    background-color: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 0.5s ease-out;
}

.register-link {
    text-align: center;
    color: var(--text-secondary);
    margin: 1.5rem 0;
}

.register-link a {
    color: var(--text-link);
    font-weight: 500;
    text-decoration: none;
}

.register-link a:hover {
    text-decoration: underline;
}

.oauth-login {
    margin-top: 1.5rem;
}

.divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
    color: var(--text-secondary);
}

.divider::before,
.divider::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: var(--border-color);
}

.divider::before {
    left: 0;
}

.divider::after {
    right: 0;
}

.oauth-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.oauth-btn {
    flex: 1;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--text-primary);
}

.oauth-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    border-color: var(--text-link);
}

.oauth-btn.google:hover {
    background-color: #f1f9fe;
}

.oauth-btn.github:hover {
    background-color: #f0f0f0;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 600px) {
    .login-card {
        padding: 1.5rem;
    }

    .oauth-buttons {
        flex-direction: column;
    }
}
</style>