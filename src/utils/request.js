import axios from "axios";
import { getToken } from "./auth";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const request = axios.create({
  baseURL: "http://localhost:8080/api", // 设置基础URL
  timeout: 10000, // 请求超时时间
  withCredentials: true, // 允许携带cookie
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = getToken();
    if (token) {
      // 添加 token 到请求头
      config.headers["Authorization"] = token;
    }

    // 如果是上传文件，设置正确的 Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果返回的状态码不是200，说明接口有问题，应该提示错误信息
    if (res.code !== 200) {
      ElMessage.error(res.message || "系统繁忙，请稍后重试");
      return Promise.reject(new Error(res.message || "系统繁忙，请稍后重试"));
    }
    return response;
  },
  (error) => {
    console.error("error is ", error);
    if (error.code === "ERR_NETWORK") {
      ElMessage.error("网络错误，请检查后端服务是否正常运行");
    } else {
      ElMessage.error(
        "API请求失败: " +
          (error.response?.data?.message || "系统繁忙，请稍后重试")
      );
    }
    return Promise.reject(error);
  }
);

export default request;
