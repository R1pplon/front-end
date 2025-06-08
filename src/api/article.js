import request from "@/utils/request";

// 获取文章列表
export const getArticles = (params) => {
  return request.get("/public/article", { params });
};

// 创建文章（如果需要）
export const createArticle = (data) => {
  return request({
    url: "/article",
    method: "post",
    data,
  });
};

// 获取单篇文章（可能需要）
export const getArticleById = (id) => {
  return request.get(`/public/article/${id}`);
};

// 获取文章评论
export const getArticleComments = (articleId) => {
  if (!articleId) {
    return Promise.reject(new Error("文章ID不能为空"));
  }
  return request.get(`/public/article/${articleId}/comments`);
};

// 添加评论
export const addComment = (data) => {
  return request.post("/comment", data);
};

// 删除评论
export const deleteComment = (commentId) => {
  return request.delete(`/comment/${commentId}`);
};
