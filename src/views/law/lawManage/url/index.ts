import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/list', params });
};
// 主题分类
export const getChildList = () => {
  return defHttp.get({ url: '/sys/category/childList?parentIds=1719911661011816449' });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/filemanage/jnFileManage/add', data });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryById', params });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/filemanage/jnFileManage/edit', data }, { isTransformResponse: false });
};
// 关联文件
export const getRelatedFile = () => {
  return defHttp.get({ url: '/filemanage/jnFileManage/getRelatedFile' });
};
// 关联文件添加
export const addFileAssociation = (data) => {
  return defHttp.post({ url: '/filemanage/jnFileManage/addFileAssociation', data });
};
// 关联通过id查询
export const queryRelateById = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryRelateById', params });
};
// 关联删除
export const removeFileAssociation = (data) => {
  return defHttp.post({ url: '/filemanage/jnFileManage/removeFileAssociation', data });
};
// 根据用户名查询用户信息
export const getUserByUsername = (params) => {
  return defHttp.get({ url: '/sys/user/getUserByUsername', params });
};
