import request from "./axios";

// get 请求
export const getApi = (url, params, header) => {
  return request({
    url: url,
    headers: header || {}, // 不需要再添加 Authorization 头
    method: "get",
    params: params,
  });
};

// post 请求
export const postApi = (url, params, header) => {
  return request({
    url: url,
    headers: header || {},
    method: "post",
    data: params,
  });
};

// delete 请求
export const delApi = (url, header) => {
  return request({
    url: url,
    headers: header || {},
    method: "delete",
  });
};

// put 请求
export const putApi = (url, params, header) => {
  return request({
    url: url,
    headers: header || {},
    method: "put",
    data: params,
  });
};
