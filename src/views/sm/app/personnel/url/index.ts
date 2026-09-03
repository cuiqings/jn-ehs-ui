import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/list', params });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/queryById', params });
};
