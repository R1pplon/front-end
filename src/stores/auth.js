import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getUserInfo, setUserInfo } from "@/utils/auth";
import { API_CONFIG, DEFAULT_CONFIG } from "@/config";

// 后端服务器地址
const API_BASE_URL = "http://localhost:8080";

export const useAuthStore = defineStore("auth", () => {
  // 登录状态
  const isLoggedIn = ref(false);
  // 用户信息
  const user = ref(null);
  // 加载状态
  const loading = ref(true);

  // 初始化状态
  const init = () => {
    const userInfo = getUserInfo();

    if (userInfo) {
      isLoggedIn.value = true;
      user.value = userInfo;
    } else {
      isLoggedIn.value = false;
      user.value = null;
    }

    loading.value = false;
  };

  // 登录成功更新状态
  const login = (_, userData) => {
    isLoggedIn.value = true;
    user.value = userData;
    loading.value = false;
    // 保存到本地存储
    setUserInfo(userData);
  };

  // 登出更新状态
  const logout = () => {
    isLoggedIn.value = false;
    user.value = null;
    loading.value = false;
  };

  // 更新用户信息
  const updateUser = (userData) => {
    user.value = userData;
    // 保存到本地存储
    setUserInfo(userData);
  };

  // 更新头像
  const updateAvatar = (avatarUrl) => {
    if (user.value) {
      user.value.avatarUrl = avatarUrl;
      // 保存到本地存储
      setUserInfo(user.value);
    }
  };

  // 计算属性：用户名
  const username = computed(() => user.value?.username || "");

  // 计算属性：用户头像
  const avatar = computed(() => {
    if (!user.value?.avatarUrl) {
      return DEFAULT_CONFIG.DEFAULT_AVATAR;
    }
    // 如果是完整的URL，直接返回
    if (user.value.avatarUrl.startsWith("http")) {
      return user.value.avatarUrl;
    }
    // 如果是相对路径，拼接完整URL
    return `${API_BASE_URL}${user.value.avatarUrl}`;
  });

  return {
    isLoggedIn,
    user,
    loading,
    username,
    avatar,
    init,
    login,
    logout,
    updateUser,
    updateAvatar,
  };
});
