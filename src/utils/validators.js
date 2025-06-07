/**
 * 验证用户名
 * @param {string} username - 用户名
 * @returns {string} 错误消息 (空字符串表示验证通过)
 */
export const validateUsername = (username) => {
  if (!username) {
    return "用户名不能为空";
  }

  if (username.length < 4 || username.length > 20) {
    return "用户名长度应在4-20个字符之间";
  }

  // 正则表达式验证用户名格式（仅字母、数字和下划线）
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "用户名只能包含字母、数字和下划线";
  }

  return "";
};

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {string} 错误消息 (空字符串表示验证通过)
 */
export const validateEmail = (email) => {
  if (!email) {
    return "邮箱不能为空";
  }

  // 邮箱格式验证正则表达式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "请输入有效的邮箱地址";
  }

  return "";
};

/**
 * 验证密码
 * @param {string} password - 密码
 * @returns {string} 错误消息 (空字符串表示验证通过)
 */
export const validatePassword = (password) => {
  if (!password) {
    return "密码不能为空";
  }

  if (password.length < 6) {
    return "密码长度至少为6位";
  }

  // 密码复杂度验证（至少包含数字和字母）
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "密码必须包含字母和数字";
  }

  return "";
};
