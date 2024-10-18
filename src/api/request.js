import request from "./axios";
//get请求
export const getApi = (url, params, header) => {
    let headers = {
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken") || ''
    }
    return request({
        url: url,
        headers: header || headers,
        method: "get",
        params: params,
    });
};
//post请求
export const postApi = (url, params, header) => {
    let headers = {
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken") || ''
    }
    return request({
        url: url,
        headers: header || headers,
        method: "post",
        data: params,
    });
};
//post下载请求
export const loadApi = (url, params, header) => {
    let headers = {
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken") || ''
    }
    return request({
        url: url,
        headers: header || headers,
        method: "post",
        data: params,
        responseType: 'blob'
    });
};

//postfrom请求
export const postfromApi = (url, params, header) => {
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken")
    }
    let tfr = [function(data) {
        let form = ''
        for (let p in data) {
            form += encodeURIComponent(p) + '=' + encodeURIComponent(data[p]) + '&'
        }
        return form
    }]
    return request({
        url: url,
        headers: header || headers,
        method: "post",
        data: params,
        transformRequest: tfr
    });
};

//delete请求
export const delApi = (url, header) => {
    let headers = {
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken") || ''
    }
    return request({
        url: url,
        headers: headers,
        method: "delete",
    });
};

//put请求
export const putApi = (url, params, header) => {
    let headers = {
        "Authorization": 'Bearer ' + sessionStorage.getItem("userToken") || ''
    }
    return request({
        url: url,
        headers: headers,
        method: "put",
        data: params
    });
};