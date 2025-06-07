import request from "@/utils/request";

// 获取文章列表
export const getArticles = (params) => {
  return request({
    url: "/public/article",
    method: "get",
    params,
  });
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
  return request({
    url: `/public/article/${id}`,
    method: "get",
  });
};


// 获取文章评论
export const getArticleComments = (articleId) => {
    return request({
      url: `/public/article/${articleId}/comments`,
      method: 'get'
    });
  };
  
  // 提交新评论
  export const addComment = (data) => {
    return request({
      url: '/comment',
      method: 'post',
      data
    });
  };
  
  // 提交回复
  export const addReply = (commentId, data) => {
    return request({
      url: `/comment/${commentId}/reply`,
      method: 'post',
      data
    });
  };
