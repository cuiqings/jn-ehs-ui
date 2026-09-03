import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/edu/resource/pageList', params });
};
export const del = (data) => {
  return defHttp.post({ url: '/edu/resource/delete', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/edu/resource/update', data });
};
// 类型
export const loadTreeData = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 批量修改
export const batchEdit = (data) => {
  return defHttp.post({ url: '/edu/resource/batchEdit', data });
};
// 转码
export const transcoding = (params) => {
  return defHttp.get({ url: '/edu/resource/transcoding', params });
};
