import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/law/jnMyCollection/list', params });
};
// 获取主题分类
export const getChildList = (params) => {
  return defHttp.get({ url: '/law/jnMyCollection/getTopicCategory', params }, { isTransformResponse: false });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryById', params });
};
