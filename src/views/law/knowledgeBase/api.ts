import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/knowledgebase/jnKnowledgeBase/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/knowledgebase/jnKnowledgeBase/add', data });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/knowledgebase/jnKnowledgeBase/queryById', params });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/knowledgebase/jnKnowledgeBase/edit', data }, { isTransformResponse: false });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/knowledgebase/jnKnowledgeBase/delete/', params });
};
// 批量删除
export const batchDelete = (params) => {
  return defHttp.delete({ url: '/knowledgebase/jnKnowledgeBase/deleteBatch/', params }, { joinParamsToUrl: true });
};
// 查询文件类别数量
export const fileCategoryCount = () => {
  return defHttp.get({ url: '/knowledgebase/jnKnowledgeBase/fileCategoryCount' });
};
