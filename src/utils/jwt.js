/**
 * JWT工具函数
 * 用于解析JWT token中的用户信息
 */

/**
 * Base64URL解码
 * @param {string} str - Base64URL编码的字符串
 * @returns {string} 解码后的字符串
 */
function base64UrlDecode(str) {
  // 将Base64URL转换为Base64
  str = str.replace(/-/g, "+").replace(/_/g, "/");

  // 补齐padding
  while (str.length % 4) {
    str += "=";
  }

  try {
    // 解码Base64
    const decoded = atob(str);
    // 现代浏览器中escape已弃用，使用更安全的方法
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (error) {
    console.error("Base64解码失败:", error);
    return null;
  }
}

/**
 * 解析JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解析后的payload，失败返回null
 */
export function parseJwtToken(token) {
  if (!token || typeof token !== "string") {
    console.log("JWT解析: token为空或类型错误");
    return null;
  }

  try {
    // JWT由三部分组成：header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("JWT解析: 无效的JWT格式，parts:", parts.length);
      return null;
    }

    console.log("JWT解析: token结构正确，开始解析payload");

    // 解析payload（第二部分）
    const payload = base64UrlDecode(parts[1]);
    if (!payload) {
      console.error("JWT解析: payload解码失败");
      return null;
    }

    const parsedPayload = JSON.parse(payload);
    console.log("JWT解析成功:", {
      userId: parsedPayload.userId,
      role: parsedPayload.role,
      exp: parsedPayload.exp,
      expDate: new Date(parsedPayload.exp * 1000).toLocaleString(),
    });

    return parsedPayload;
  } catch (error) {
    console.error("JWT解析失败:", error);
    return null;
  }
}

/**
 * 从cookie中获取JWT token
 * @returns {string|null} JWT token或null
 */
export function getJwtTokenFromCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "jwt_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * 从JWT token中获取用户角色
 * @returns {number|null} 用户角色（0=管理员, 1=普通用户）或null
 */
export function getUserRoleFromToken() {
  const token = getJwtTokenFromCookie();
  if (!token) {
    console.log("未找到JWT token");
    return null;
  }

  const payload = parseJwtToken(token);
  if (!payload) {
    console.log("JWT token解析失败");
    return null;
  }

  console.log("JWT payload:", payload);
  return payload.role ?? null;
}

/**
 * 从JWT token中获取用户ID
 * @returns {number|null} 用户ID或null
 */
export function getUserIdFromToken() {
  const token = getJwtTokenFromCookie();
  if (!token) {
    return null;
  }

  const payload = parseJwtToken(token);
  if (!payload) {
    return null;
  }

  return payload.userId ?? null;
}

/**
 * 检查JWT token是否过期
 * @returns {boolean} true表示已过期，false表示未过期
 */
export function isTokenExpired() {
  const token = getJwtTokenFromCookie();
  if (!token) {
    console.log("JWT检查: 未找到token");
    return true;
  }

  const payload = parseJwtToken(token);
  if (!payload) {
    console.log("JWT检查: token解析失败");
    return true;
  }

  if (!payload.exp) {
    console.log("JWT检查: token中没有过期时间");
    return true;
  }

  // JWT的exp是秒级时间戳，JavaScript的Date.now()是毫秒级
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp < currentTime;

  console.log("JWT检查详情:", {
    currentTime,
    expTime: payload.exp,
    timeLeft: payload.exp - currentTime,
    isExpired,
    tokenLength: token.length,
  });

  return isExpired;
}

/**
 * 获取JWT token的完整信息
 * @returns {Object|null} 包含用户ID、角色等信息的对象
 */
export function getTokenInfo() {
  const token = getJwtTokenFromCookie();
  if (!token) {
    return null;
  }

  const payload = parseJwtToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    role: payload.role,
    exp: payload.exp,
    iat: payload.iat,
    isExpired: isTokenExpired(),
  };
}
