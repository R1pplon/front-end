/**
 * 调试工具函数
 * 用于监控和调试JWT token的设置过程
 */

import { getJwtTokenFromCookie, parseJwtToken, isTokenExpired } from "./jwt";

/**
 * 监控Cookie变化
 * @param {Function} callback - 变化时的回调函数
 * @returns {Function} 停止监控的函数
 */
export function watchCookieChanges(callback) {
  let lastCookies = document.cookie;

  const checkCookies = () => {
    const currentCookies = document.cookie;
    if (currentCookies !== lastCookies) {
      console.log("Cookie变化检测到:", {
        old: lastCookies,
        new: currentCookies,
      });
      callback(currentCookies, lastCookies);
      lastCookies = currentCookies;
    }
  };

  const interval = setInterval(checkCookies, 100);

  return () => clearInterval(interval);
}

/**
 * 等待JWT token出现
 * @param {number} timeout - 超时时间（毫秒）
 * @param {number} interval - 检查间隔（毫秒）
 * @returns {Promise<boolean>} 是否成功获取到token
 */
export function waitForJwtToken(timeout = 2000, interval = 50) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkToken = () => {
      const token = getJwtTokenFromCookie();

      if (token && !isTokenExpired()) {
        console.log("JWT token检测成功:", {
          tokenLength: token.length,
          waitTime: Date.now() - startTime,
        });
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        console.log("JWT token等待超时:", {
          hasToken: !!token,
          waitTime: Date.now() - startTime,
        });
        resolve(false);
        return;
      }

      setTimeout(checkToken, interval);
    };

    checkToken();
  });
}

/**
 * 详细的JWT状态检查
 * @returns {Object} JWT状态信息
 */
export function getJwtStatus() {
  const token = getJwtTokenFromCookie();

  if (!token) {
    return {
      hasToken: false,
      isValid: false,
      isExpired: true,
      error: "未找到JWT token",
    };
  }

  const payload = parseJwtToken(token);

  if (!payload) {
    return {
      hasToken: true,
      isValid: false,
      isExpired: true,
      error: "JWT token解析失败",
      tokenLength: token.length,
    };
  }

  const expired = isTokenExpired();
  const currentTime = Math.floor(Date.now() / 1000);

  return {
    hasToken: true,
    isValid: !expired,
    isExpired: expired,
    payload,
    tokenLength: token.length,
    currentTime,
    expTime: payload.exp,
    timeLeft: payload.exp - currentTime,
    expDate: new Date(payload.exp * 1000).toLocaleString(),
  };
}

/**
 * 实时监控JWT状态
 * @param {Function} callback - 状态变化回调
 * @param {number} interval - 检查间隔（毫秒）
 * @returns {Function} 停止监控的函数
 */
export function monitorJwtStatus(callback, interval = 1000) {
  let lastStatus = null;

  const checkStatus = () => {
    const currentStatus = getJwtStatus();

    if (JSON.stringify(currentStatus) !== JSON.stringify(lastStatus)) {
      console.log("JWT状态变化:", currentStatus);
      callback(currentStatus, lastStatus);
      lastStatus = currentStatus;
    }
  };

  checkStatus(); // 立即检查一次
  const intervalId = setInterval(checkStatus, interval);

  return () => clearInterval(intervalId);
}

/**
 * 打印详细的调试信息
 */
export function debugJwtInfo() {
  console.group("🔍 JWT 调试信息");

  const status = getJwtStatus();
  console.log("JWT状态:", status);

  const cookies = document.cookie.split(";").map((cookie) => {
    const [name, value] = cookie.trim().split("=");
    return { name, value: value?.substring(0, 20) + "..." };
  });
  console.log("所有Cookies:", cookies);

  const jwtCookie = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("jwt_token="));
  console.log("JWT Cookie:", jwtCookie ? "exists" : "not found");

  console.groupEnd();

  return status;
}
