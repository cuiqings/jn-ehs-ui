import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/list', params });
};
// 获取主题分类
export const getChildList = (params) => {
  return defHttp.get({ url: '/sys/category/childList', params }, { isTransformResponse: false });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryById', params });
};
// 收藏
export const collect = (data) => {
  return defHttp.post({ url: '/law/jnMyCollection/add', data }, { isTransformResponse: false });
};
// 取消收藏
export const collectCancel = (data) => {
  return defHttp.post({ url: '/law/jnMyCollection/edit', data }, { isTransformResponse: false });
};
// 关联通过id查询
export const queryRelateById = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryRelateById', params });
};
