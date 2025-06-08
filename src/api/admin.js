import request from "@/utils/request";

// 文章管理相关API
export const adminArticleAPI = {
  // 创建文章
  createArticle: (data) => {
    return request.post("/admin/articles", data);
  },

  // 更新文章
  updateArticle: (articleId, data) => {
    return request.put(`/admin/article/${articleId}`, data);
  },

  // 删除文章
  deleteArticle: (articleId) => {
    return request.delete(`/admin/article/${articleId}`);
  },
};

// 用户管理相关API
export const adminUserAPI = {
  // 获取所有用户
  getAllUsers: () => {
    return request.get("/admin/users");
  },

  // 获取单个用户信息
  getUserById: (userId) => {
    return request.get(`/admin/users/${userId}`);
  },

  // 更新用户信息
  updateUser: (userId, data) => {
    return request.put(`/admin/users/${userId}`, data);
  },

  // 删除用户
  deleteUser: (userId) => {
    return request.delete(`/admin/users/${userId}`);
  },
};

// 评论管理相关API
export const adminCommentAPI = {
  // 获取所有评论
  getAllComments: () => {
    return request.get("/admin/comments");
  },

  // 获取待审核评论
  getPendingComments: () => {
    return request.get("/admin/comments/approve");
  },

  // 删除评论
  deleteComment: (commentId) => {
    return request.put(`/admin/comments/${commentId}`);
  },

  // 审核评论
  approveComment: (commentId) => {
    return request.put(`/admin/comments/approve/${commentId}`);
  },
};
