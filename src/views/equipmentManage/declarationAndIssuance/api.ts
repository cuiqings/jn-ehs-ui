import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/lb/lbDeclaration/list', params });
};
// 根据id进行查询
export const queryById = (params) => {
  return defHttp.get({ url: '/lb/lbDeclaration/queryById', params });
};
// 计算
export const calculate = (params) => {
  return defHttp.get({ url: '/lb/lbDeclaration/calculate', params });
};
