/**
 * 格式化日期函数
 * @param {string|Date} dateString - 日期字符串或 Date 对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = dateString instanceof Date ? dateString : new Date(dateString);

  if (isNaN(date)) {
    console.warn("Invalid date format:", dateString);
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * 相对时间函数 (比如 "3天前")
 * @param {string|Date} dateString - 日期字符串或 Date 对象
 * @returns {string} 相对时间描述
 */
export const relativeTime = (dateString) => {
  if (!dateString) return "";

  const date = dateString instanceof Date ? dateString : new Date(dateString);

  if (isNaN(date)) {
    console.warn("Invalid date format:", dateString);
    return "";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }

  return formatDate(date);
};
