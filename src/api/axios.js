import axios from "axios";
import router from "../router/index.js";

//公共配置
const axiosSetting = axios.create({
  timeout: 5000, // 默认超时设置5s
  baseURL: "", // 相对路径设置
});

//http request(发送) 拦截器
axiosSetting.interceptors.request.use(
  (config) => {
    // 校验token
    // if (!sessionStorage.getItem("userToken")) {
    //   let addr = window.location.href;
    //   let addrArr = addr.split("/");

    //   if (addr.match(/code=.{6}#/) && addr.match(/code=.{6}#/)[0] && addrArr[addrArr.length - 1] == "main") {
    //   } else {
    //     router.push({
    //       path: "/login",
    //     });

    //     sessionStorage.clear();
    //   }
    // }

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
      //   router.push({
      //     path: "/login",
      //   });
      //   sessionStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default axiosSetting;
