import request from "@/util/request";
export function commQuery(url, data, params, method) {
  let config = {
    url: url,
    data: data,
    params: params,
    method: method ? method : "post",
  };
  return request(config);
}
export function add(url, data) {
  let config = {
    url: url,
    data: data,
    method: "post",
  };
  return request(config);
}
export function getCodeTable(code) {
  let config = {
    url: "/comm/getCodeTable",
    data: { code: code },
    method: "post",
  };
  return request(config);
}
export function getCodeTableBatch(codeList) {
  let config = {
    url: "/comm/getCodeTableBatch",
    data: { codeList: codeList },
    method: "post",
  };
  return request(config);
}
export function getDataSourceList() {
  let config = {
    url: "/comm/getDataSourceList",
    data: {},
    method: "post",
  };
  return request(config);
}
