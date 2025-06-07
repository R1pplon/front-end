<template>
    <div class="register-container">
        <div class="register-card">
            <h1 class="register-title">创建账号</h1>

            <div v-if="successMessage" class="success-message">
                <i class="fas fa-check-circle"></i> {{ successMessage }}
            </div>

            <form @submit.prevent="handleSubmit" class="register-form">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="username" v-model="formData.username" placeholder="输入用户名 (4-20字符)"
                            :class="{ 'error': errors.username }" @blur="validateField('username')">
                    </div>
                    <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
                </div>

                <div class="form-group">
                    <label for="email">邮箱</label>
                    <div class="input-with-icon">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="email" v-model="formData.email" placeholder="输入邮箱地址"
                            :class="{ 'error': errors.email }" @blur="validateField('email')">
                    </div>
                    <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
                </div>

                <div class="form-group">
                    <label for="password">密码</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="password" v-model="formData.password" placeholder="输入密码 (至少6位)"
                            :class="{ 'error': errors.password }" @blur="validateField('password')">
                    </div>
                    <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">确认密码</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="confirmPassword" v-model="formData.confirmPassword"
                            placeholder="再次输入密码" :class="{ 'error': errors.confirmPassword }"
                            @blur="validateField('confirmPassword')">
                    </div>
                    <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
                </div>

                <div class="terms-container">
                    <input type="checkbox" id="terms" v-model="formData.agreeTerms"
                        :class="{ 'error': errors.agreeTerms }">
                    <label for="terms">我同意<span class="terms-link">服务条款</span>和<span
                            class="terms-link">隐私政策</span></label>
                    <div v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</div>
                </div>

                <button type="submit" class="register-btn" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">创建账号</span>
                    <span v-else>创建中...</span>
                </button>

                <div v-if="errorMessage" class="error-feedback">
                    <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
                </div>
            </form>

            <div class="login-link">
                已有账号? <router-link to="/login">立即登录</router-link>
            </div>

            <div class="oauth-login">
                <div class="divider">或使用其他方式注册</div>
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '@/api/auth';

const router = useRouter();

// 表单数据
const formData = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
});

// 错误消息
const errors = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: ''
});

// 表单提交状态
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

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

        case 'email':
            if (!formData.email) {
                errors.email = '邮箱不能为空';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = '请输入有效的邮箱地址';
            } else {
                errors.email = '';
            }
            break;

        case 'password':
            if (!formData.password) {
                errors.password = '密码不能为空';
            } else if (formData.password.length < 6) {
                errors.password = '密码长度至少为6位';
            } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                errors.password = '密码必须包含字母和数字';
            } else {
                errors.password = '';
            }
            break;

        case 'confirmPassword':
            if (!formData.confirmPassword) {
                errors.confirmPassword = '请确认密码';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = '两次输入的密码不一致';
            } else {
                errors.confirmPassword = '';
            }
            break;
    }
};

// 验证整个表单
const validateForm = () => {
    validateField('username');
    validateField('email');
    validateField('password');
    validateField('confirmPassword');

    // 验证条款勾选
    if (!formData.agreeTerms) {
        errors.agreeTerms = '请同意服务条款和隐私政策';
    } else {
        errors.agreeTerms = '';
    }

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
        // 调用注册API
        const response = await registerUser({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });

        console.log('注册响应:', response);

        // 处理成功响应
        if (response.code == 200) {
            successMessage.value = response.data || '注册成功';

            // 2秒后跳转到登录页面
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else {
            // 处理API返回的错误
            console.error('失败代码:', response.code);
            console.error('注册失败:', response.message);
            errorMessage.value = response.message || '注册失败，请重试111';

            // 特殊处理用户名已存在的情况
            if (response.code === 1003) {
                errors.username = '该用户名已被注册';
            }
        }
    } catch (error) {
        console.error('注册失败:', error);

        // 处理错误消息
        if (error.message) {
            errorMessage.value = error.message;
        } else if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = '网络连接失败，请稍后重试';
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: var(--bg-secondary);
}

.register-card {
    width: 100%;
    max-width: 500px;
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: var(--shadow);
}

.register-title {
    text-align: center;
    margin-bottom: 1.8rem;
    color: var(--text-primary);
    font-size: 1.8rem;
}

.register-form {
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
input[type="email"],
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

.terms-container {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    padding: 0.8rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
}

.terms-container input {
    margin-right: 0.8rem;
    accent-color: var(--text-link);
}

.terms-link {
    color: var(--text-link);
    text-decoration: underline;
    margin: 0 0.2rem;
    cursor: pointer;
}

.register-btn {
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
    margin-top: 0.5rem;
}

.register-btn:disabled {
    background-color: #b0e5cf;
    cursor: not-allowed;
}

.register-btn:not(:disabled):hover {
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

.login-link {
    text-align: center;
    color: var(--text-secondary);
    margin: 1.5rem 0;
}

.login-link a {
    color: var(--text-link);
    font-weight: 500;
    text-decoration: none;
}

.login-link a:hover {
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
    .register-card {
        padding: 1.5rem;
    }

    .oauth-buttons {
        flex-direction: column;
    }
}
</style>