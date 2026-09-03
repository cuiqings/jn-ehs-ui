import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/base.library/bsCheckListLib/list', params });
};
export const getCheckTypeList = (params) => {
  return defHttp.get({ url: '/base.library/bsCheckListLib/getCheckTypeList', params });
};
export const getcheckItemList = (params) => {
  return defHttp.get({ url: '/base.library/bsCheckListLib/getcheckItemList', params });
};
