import { getUserRole } from "@/api/auth";

// 缓存用户角色信息
let cachedUserRole = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1分钟缓存

/**
 * 获取用户角色（带缓存）
 * @returns {Promise<number|null>} 用户角色或null
 */
export async function fetchUserRole() {
  const now = Date.now();

  // 如果缓存未过期，直接返回缓存值
  if (cachedUserRole !== null && now - cacheTimestamp < CACHE_DURATION) {
    console.log("使用缓存的用户角色:", cachedUserRole);
    return cachedUserRole;
  }

  try {
    console.log("从API获取用户角色...");
    const response = await getUserRole();

    console.log("权限工具函数收到响应:", {
      success: response.success,
      role: response.data?.role,
    });

    if (response.success && response.data?.role !== undefined) {
      cachedUserRole = response.data.role;
      cacheTimestamp = now;
      console.log("✅ 用户角色获取成功:", cachedUserRole);
      return cachedUserRole;
    } else {
      console.log("❌ 用户角色获取失败:", response.message);
      return null;
    }
  } catch (error) {
    console.error("获取用户角色时发生错误:", error);
    return null;
  }
}

/**
 * 清除角色缓存
 */
export function clearRoleCache() {
  cachedUserRole = null;
  cacheTimestamp = 0;
  console.log("用户角色缓存已清除");
}

/**
 * 判断当前用户是否为管理员
 * @returns {Promise<boolean>} 是否为管理员
 */
export async function isAdmin() {
  console.log("=== 管理员权限检查开始 ===");

  const role = await fetchUserRole();
  const isAdminResult = role === 0;

  console.log("用户角色:", role);
  console.log("是否为管理员:", isAdminResult);
  console.log("=== 管理员权限检查结束 ===");

  return isAdminResult; // role为0表示管理员
}

/**
 * 判断当前用户是否为普通用户
 * @returns {Promise<boolean>} 是否为普通用户
 */
export async function isUser() {
  const role = await fetchUserRole();
  return role === 1; // role为1表示普通用户
}

/**
 * 获取用户角色信息
 * @returns {Promise<Object>} 用户角色信息
 */
export async function getUserRoleInfo() {
  const role = await fetchUserRole();

  if (role === null) {
    return {
      role: null,
      roleName: "未登录",
      isAdmin: false,
      isUser: false,
    };
  }

  let roleName = "未知";
  if (role === 0) {
    roleName = "管理员";
  } else if (role === 1) {
    roleName = "普通用户";
  }

  return {
    role,
    roleName,
    isAdmin: role === 0,
    isUser: role === 1,
  };
}

/**
 * 检查权限并执行操作
 * @param {Function} callback - 有权限时执行的回调
 * @param {Function} errorCallback - 无权限时执行的回调
 * @param {string} requiredRole - 需要的角色 ('admin' | 'user')
 */
export async function checkPermissionAndExecute(
  callback,
  errorCallback,
  requiredRole = "user"
) {
  const roleInfo = await getUserRoleInfo();

  let hasPermission = false;

  if (requiredRole === "admin") {
    hasPermission = roleInfo.isAdmin;
  } else if (requiredRole === "user") {
    hasPermission = roleInfo.isUser || roleInfo.isAdmin; // 管理员也有普通用户权限
  }

  if (hasPermission) {
    callback();
  } else {
    errorCallback && errorCallback(roleInfo);
  }
}

/**
 * 权限指令，用于 v-permission
 * @param {string} permission - 权限类型 ('admin' | 'user')
 * @returns {Promise<boolean>} 是否有权限
 */
export async function hasPermission(permission) {
  if (permission === "admin") {
    return await isAdmin();
  } else if (permission === "user") {
    return (await isUser()) || (await isAdmin());
  }
  return false;
}
