// API配置
export const API_CONFIG = {
  // API基础URL
  BASE_URL: "http://localhost:8080",
  // API路径前缀
  API_PREFIX: "/api",
  // 完整的API基础URL
  get API_BASE_URL() {
    return this.BASE_URL + this.API_PREFIX;
  },
  // 静态资源URL（如图片等）
  get STATIC_URL() {
    return this.BASE_URL;
  },
};

// 默认配置
export const DEFAULT_CONFIG = {
  // 默认头像
  DEFAULT_AVATAR: "src/assets/default-avatar.jpg",
};
