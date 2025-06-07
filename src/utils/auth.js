// 保存登录凭证到localStorage
export const setToken = (token) => {
  localStorage.setItem("jwt_token", token);
};

// 从localStorage获取登录凭证
export const getToken = () => {
  return localStorage.getItem("jwt_token");
};

// 移除登录凭证
export const removeToken = () => {
  localStorage.removeItem("jwt_token");
};

// 保存用户信息到localStorage
export const setUserInfo = (userData) => {
  localStorage.setItem("user_info", JSON.stringify(userData));
};

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem("user_info");
  return userInfo ? JSON.parse(userInfo) : null;
};

// 移除用户信息
export const removeUserInfo = () => {
  localStorage.removeItem("user_info");
};

// 检查用户是否已登录
export const isAuthenticated = () => {
  return getToken() !== null;
};

// 退出登录
export const logout = () => {
  removeToken();
  removeUserInfo();
};
