import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getToken, getUserInfo, isAuthenticated } from "@/utils/auth";

export const useAuthStore = defineStore("auth", () => {
  // 登录状态
  const isLoggedIn = ref(false);
  // 用户信息
  const user = ref(null);
  // 加载状态
  const loading = ref(true);

  // 初始化状态
  const init = () => {
    const token = getToken();
    const userInfo = getUserInfo();

    if (token && userInfo) {
      isLoggedIn.value = true;
      user.value = userInfo;
    } else {
      isLoggedIn.value = false;
      user.value = null;
    }

    loading.value = false;
  };

  // 登录成功更新状态
  const login = (token, userData) => {
    isLoggedIn.value = true;
    user.value = userData;
  };

  // 登出更新状态
  const logout = () => {
    isLoggedIn.value = false;
    user.value = null;
  };

  // 计算属性：用户名
  const username = computed(() => user.value?.username || "");

  // 计算属性：用户头像
  const avatar = computed(() => user.value?.avatarUrl || "/default-avatar.jpg");

  return {
    isLoggedIn,
    user,
    loading,
    username,
    avatar,
    init,
    login,
    logout,
  };
});
