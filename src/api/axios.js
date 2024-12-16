import axios from "axios";
import router from "../router/index.js";

// 获取 CSRF Token (通常存储在浏览器 Cookie 中)
function getCSRFToken() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return ""; // 如果没有找到 CSRF Token，返回空字符串
}

//公共配置
const axiosSetting = axios.create({
  timeout: 500000, // 默认超时设置5s
  baseURL: "", // 相对路径设置
});

//http request(发送) 拦截器
axiosSetting.interceptors.request.use(
  (config) => {
    // 添加 CSRF Token 到请求头
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken; // 将 CSRF Token 添加到请求头
    }

    // 参数设置
    if (config.method === "get") {
      //get请求下 参数在params中，其他请求在data中
      config.params = config.params || {};
      let json = JSON.parse(JSON.stringify(config.params));
      //一些参数处理
    } else {
      config.data = config.data || {};
      //一些参数处理
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

//http response 拦截器
axiosSetting.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    if (error.response.status === 401) {
      router.push({
        path: "/login",
      });
      sessionStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default axiosSetting;
