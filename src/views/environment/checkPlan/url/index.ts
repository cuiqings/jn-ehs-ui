import { defHttp } from '/@/utils/http/axios';
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 按所属机构获取用户
export const getUser = (params) => {
  return defHttp.get({ url: '/jn/common/getUser', params });
};
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckPlan/list', params });
};
// 批量删除
export const deleteBatch = (params) => {
  return defHttp.delete({ url: '/environmental/jnEnvironmentalCheckPlan/deleteBatch', params }, { joinParamsToUrl: true });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: '/environmental/jnEnvironmentalCheckPlan/delete', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalCheckPlan/add', data });
};
// 启用
export const enable = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalCheckPlan/enable', data }, { joinParamsToUrl: true });
};
// 停用
export const deactivate = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalCheckPlan/deactivate', data }, { joinParamsToUrl: true });
};
// 编辑
export const edit = (data) => {
  return defHttp.put({ url: '/environmental/jnEnvironmentalCheckPlan/edit', data });
};
// 详情
export const appQueryById = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckPlan/appQueryById', params }, { joinParamsToUrl: true });
};
// 开始检查
export const appStartInspection = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckPlan/appStartInspection', params }, { joinParamsToUrl: true });
};
// 保存
export const save = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalCheckRecord/add', data });
};
// 提交
export const submit = (data) => {
  return defHttp.post({ url: '/environmental/jnEnvironmentalCheckRecord/submit', data });
};
// 已完成详情
export const checkRecordDetails = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckRecord/appQueryById', params }, { joinParamsToUrl: true });
};
