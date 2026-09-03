import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/edu/cert/pageList', params });
};
export const del = (data) => {
  return defHttp.post({ url: '/edu/cert/delete', data });
};
export const add = (data) => {
  return defHttp.post({ url: '/edu/cert/add', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/edu/cert/update', data });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};

// 获证人员
export const pageList = (params) => {
  return defHttp.get({ url: '/edu/certUser/pageList', params });
};
// 撤销发布
export const revocation = (data) => {
  return defHttp.post({ url: '/edu/certUser/revocation', data });
};
