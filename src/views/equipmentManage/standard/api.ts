import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/lb/lbDistributeStandard/list', params });
};
export const addSupply = (data) => {
  return defHttp.post({ url: '/lb/lbDistributeStandard/addSupply', data });
};
// 新增岗位
export const addPost = (data) => {
  return defHttp.post({ url: '/lb/lbDistributeStandard/addPost', data });
};
export const edit = (data) => {
  return defHttp.post({ url: '/lb/lbDistributeStandard/edit', data });
};

export const del = (data) => {
  return defHttp.post({ url: '/lb/lbDistributeStandard/delete', data });
};
// 物料删除
export const deleteSupply = (params) => {
  return defHttp.get({ url: '/lb/lbDistributeStandard/deleteSupply', params });
};
