import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/lb/lbDistributeConfig/list', params });
};
// 配置
export const config = (data) => {
  return defHttp.post({ url: '/lb/lbDistributeConfig/config', data });
};
// 根据id进行查询
export const queryById = (params) => {
  return defHttp.get({ url: '/lb/lbDistributeConfig/queryById', params });
};
