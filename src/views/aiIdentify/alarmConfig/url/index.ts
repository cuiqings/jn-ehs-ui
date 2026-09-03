import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/ai/alarmConfig/listPage', params });
};
// 所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/ai/alarmConfig/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/ai/alarmConfig/edit', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/ai/alarmConfig/delete', params }, { joinParamsToUrl: true });
};
// 批量删除
export const batchDel = (data) => {
  return defHttp.post({ url: '/ai/alarmConfig/deleteBath', data });
};
// 角色
export const role = () => {
  return defHttp.get({ url: '/jn/common/getRole' });
};
// 详情
export const deiails = (id) => {
  return defHttp.get({ url: `/ai/alarmConfig/getInfo/${id}` });
};
// 修改状态
export const updateState = (data) => {
  return defHttp.post({ url: '/ai/alarmConfig/updateState', data });
};
