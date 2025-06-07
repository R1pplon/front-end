import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    console.log("response is ", response);
    const res = response.data;
    if (res.code === 200) {
      return res;
    }
    // 处理非200状态码
    return Promise.reject(new Error(res.message || "请求错误"));
  },
  (error) => {
    // 处理HTTP错误
    console.log("error is ", error);
    return Promise.reject(error);
  }
);

export default instance;
