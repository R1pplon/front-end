import request from "@/utils/request";

// 错误代码定义
const ErrorCodes = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} API响应
 *
 * 预期响应格式:
 * {
 *   code: 200,
 *   message: 'success',
 *   data: {
 *     id: 123,
 *     username: 'example',
 *     email: 'user@example.com'
 *   }
 * }
 */
export const registerUser = async (data) => {
  try {
    const response = await request({
      url: "/public/register",
      method: "post",
      data,
    });

    // 处理axios响应结构
    const apiData = response.data;

    return {
      success: true,
      code: apiData.code,
      message: apiData.message || "注册成功",
      data: apiData.data,
    };
  } catch (error) {
    console.error("注册请求失败:", error);

    // 如果是请求错误
    if (error.response) {
      return {
        success: false,
        code: error.response.status,
        message: error.response.data?.message || "注册失败",
        data: null,
      };
    }

    // 如果是网络错误
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "网络连接失败，请检查网络",
        data: null,
      };
    }

    // 如果是超时错误
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "请求超时，请稍后重试",
        data: null,
      };
    }

    // 其他错误
    return {
      success: false,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "注册失败，请稍后重试",
      data: null,
    };
  }
};

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} API响应
 */
export const loginUser = async (data) => {
  try {
    const response = await request({
      url: "/public/login",
      method: "post",
      data,
    });

    // 处理axios响应结构
    const apiData = response.data;

    return {
      success: true,
      code: apiData.code,
      message: apiData.message || "登录成功",
      data: apiData.data,
    };
  } catch (error) {
    console.error("登录请求失败:", error);

    // 如果是请求错误
    if (error.response) {
      return {
        success: false,
        code: error.response.status,
        message: error.response.data?.message || "登录失败",
        data: null,
      };
    }

    // 如果是网络错误
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "网络连接失败，请检查网络",
        data: null,
      };
    }

    // 如果是超时错误
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: "请求超时，请稍后重试",
        data: null,
      };
    }

    // 其他错误
    return {
      success: false,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "登录失败，请稍后重试",
      data: null,
    };
  }
};

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} API响应
 */
export const getCurrentUser = async () => {
  try {
    const response = await request({
      url: "/user/info",
      method: "get",
    });

    if (!response || !response.data || typeof response.data !== "object") {
      throw new Error("用户信息请求返回了无效的响应格式");
    }

    const apiData = response.data;

    return {
      success: apiData.code === ErrorCodes.SUCCESS || apiData.code === 200,
      code: apiData.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: apiData.message || "未知错误",
      data: apiData.data || null,
    };
  } catch (error) {
    console.error("获取用户信息失败:", error);

    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "获取用户信息失败";

    if (error.response) {
      errorCode = error.response.status || errorCode;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return {
      success: false,
      code: errorCode,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * 获取当前用户角色信息
 * @returns {Promise<Object>} API响应
 */
export const getUserRole = async () => {
  try {
    const response = await request({
      url: "/user/getRole",
      method: "get",
    });

    if (!response || !response.data || typeof response.data !== "object") {
      throw new Error("用户角色请求返回了无效的响应格式");
    }

    // 正确处理axios响应结构：response.data 是实际的API数据
    const apiData = response.data;
    const isSuccess =
      apiData.code === ErrorCodes.SUCCESS || apiData.code === 200;

    console.log("🔍 角色API处理:", {
      success: isSuccess,
      role: apiData.data?.role,
    });

    return {
      success: isSuccess,
      code: apiData.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: apiData.message || "未知错误",
      data: apiData.data || null, // 这里是实际的数据，包含 role 字段
    };
  } catch (error) {
    console.error("获取用户角色失败:", error);

    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "获取用户角色失败";

    if (error.response) {
      errorCode = error.response.status || errorCode;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return {
      success: false,
      code: errorCode,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * 用户登出
 * @returns {Promise<Object>} API响应
 */
export const logoutUser = async () => {
  try {
    const response = await request({
      url: "/user/logout",
      method: "post",
    });

    return {
      success: response.code === ErrorCodes.SUCCESS,
      code: response.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: response.message || "未知错误",
      data: response.data || null,
    };
  } catch (error) {
    console.error("登出请求失败:", error);

    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "登出请求失败";

    if (error.response) {
      errorCode = error.response.status || errorCode;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return {
      success: false,
      code: errorCode,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * 刷新访问令牌
 * @returns {Promise<Object>} API响应
 */
export const refreshToken = async () => {
  try {
    const response = await request({
      url: "/auth/refresh",
      method: "post",
    });

    if (!response || typeof response !== "object") {
      throw new Error("刷新令牌请求返回了无效的响应格式");
    }

    const token = response.token || response.access_token;

    if (!token) {
      throw new Error("刷新令牌响应中未包含token");
    }

    return {
      success: response.code === ErrorCodes.SUCCESS,
      code: response.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: response.message || "未知错误",
      token: token,
      data: response.data || null,
    };
  } catch (error) {
    console.error("刷新令牌失败:", error);

    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "刷新令牌失败";

    if (error.response) {
      errorCode = error.response.status || errorCode;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return {
      success: false,
      code: errorCode,
      message: errorMessage,
      token: null,
      data: null,
    };
  }
};

/**
 * 发送密码重置邮件
 * @param {string} email - 用户邮箱
 * @returns {Promise<Object>} API响应
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await request({
      url: "/auth/forgot-password",
      method: "post",
      data: { email },
    });

    return {
      success: response.code === ErrorCodes.SUCCESS,
      code: response.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: response.message || "未知错误",
      data: response.data || null,
    };
  } catch (error) {
    console.error("发送密码重置邮件失败:", error);

    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = "发送密码重置邮件失败";

    if (error.response) {
      errorCode = error.response.status || errorCode;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return {
      success: false,
      code: errorCode,
      message: errorMessage,
      data: null,
    };
  }
};
