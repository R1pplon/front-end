import request from "@/utils/request";

/**
 * 发送评论
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} data.articleId - 文章ID
 * @param {number|null} data.parentId - 父评论ID，如果是一级评论则为null
 * @returns {Promise} 返回评论结果
 */
export const createComment = async (data) => {
  try {
    const response = await request({
      url: "/comment/",
      method: "post",
      data,
    });

    return {
      success: response.code === 200,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error("发送评论失败:", error);
    return {
      success: false,
      message: error.response?.data?.message || "发送评论失败",
      data: null,
    };
  }
};

/**
 * 获取文章评论列表
 * @param {number} articleId - 文章ID
 * @returns {Promise} 返回评论列表
 */
export const getComments = async (articleId) => {
  try {
    const response = await request({
      url: `/article/${articleId}/comments`,
      method: "get",
    });

    return {
      success: response.code === 200,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error("获取评论列表失败:", error);
    return {
      success: false,
      message: error.response?.data?.message || "获取评论列表失败",
      data: null,
    };
  }
};
