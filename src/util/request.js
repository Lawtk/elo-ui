import axios from "axios";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: "http://127.0.0.1:8087/",
  // 超时
  timeout: 100000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {

    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      config.method === "post" || config.method === "put"
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        params:
          typeof config.params === "object"
            ? JSON.stringify(config.params)
            : config.params,
        time: new Date().getTime(),
      };
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res;
    }
    return res.data;
  },
  (error) => {
    console.log("err" + error);
    return Promise.reject(error);
  }
);

function tansParams(obj) {
  let res = "";
  let keys = Object.keys(obj)
  for (v in keys) {
    res += "&" + v + "=" + obj[v]
  }
  return res;
}
export default service;
