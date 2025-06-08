import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getUserInfo, setUserInfo } from "@/utils/auth";
import { API_CONFIG, DEFAULT_CONFIG } from "@/config";
import { getUserRole } from "@/api/auth";
import { clearRoleCache, fetchUserRole } from "@/utils/permission";

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
  const init = async () => {
    console.log("Auth Store 初始化开始...");

    const userInfo = getUserInfo();
    console.log("本地用户信息:", !!userInfo);

    if (userInfo) {
      // 尝试验证用户是否仍然有效
      try {
        const roleResponse = await getUserRole();
        if (roleResponse.success) {
          isLoggedIn.value = true;
          user.value = userInfo;
          console.log("用户登录状态有效");
        } else {
          // 角色获取失败，可能是未登录或token过期
          isLoggedIn.value = false;
          user.value = null;
          localStorage.removeItem("user_info");
          console.log("用户登录状态已失效，清理本地数据");
        }
      } catch (error) {
        console.log("验证用户状态时出错:", error.message);
        isLoggedIn.value = false;
        user.value = null;
        localStorage.removeItem("user_info");
      }
    } else {
      isLoggedIn.value = false;
      user.value = null;
      console.log("未找到本地用户信息");
    }

    loading.value = false;
    console.log("Auth Store 初始化完成:", {
      isLoggedIn: isLoggedIn.value,
      hasUser: !!user.value,
    });
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
    // 清除权限缓存
    clearRoleCache();
    // 清除本地存储
    localStorage.removeItem("user_info");
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

  // 用户角色信息（需要异步获取）
  const userRole = ref(null);

  // 刷新用户角色
  const refreshUserRole = async () => {
    if (isLoggedIn.value) {
      try {
        const role = await fetchUserRole();
        userRole.value = role;
        console.log("用户角色刷新成功:", role);
      } catch (error) {
        console.error("刷新用户角色失败:", error);
        userRole.value = null;
      }
    } else {
      userRole.value = null;
    }
  };

  // 是否为管理员（异步计算）
  const checkIsAdmin = async () => {
    if (!isLoggedIn.value) return false;
    if (userRole.value === null) {
      await refreshUserRole();
    }
    return userRole.value === 0;
  };

  // 是否为普通用户（异步计算）
  const checkIsUser = async () => {
    if (!isLoggedIn.value) return false;
    if (userRole.value === null) {
      await refreshUserRole();
    }
    return userRole.value === 1;
  };

  return {
    isLoggedIn,
    user,
    loading,
    username,
    avatar,
    userRole,
    refreshUserRole,
    checkIsAdmin,
    checkIsUser,
    init,
    login,
    logout,
    updateUser,
    updateAvatar,
  };
});
