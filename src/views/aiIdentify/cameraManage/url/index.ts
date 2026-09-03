import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/ai/cameraManage/listPage', params });
};
// 所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 删除
export const del = (id) => {
  return defHttp.get({ url: `/ai/cameraManage/delete/${id}` });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/ai/cameraManage/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/ai/cameraManage/edit', data });
};
// 批量删除
export const batchDel = (data) => {
  return defHttp.post({ url: '/ai/cameraManage/deleteBath', data });
};
// 修改报警状态
export const updateState = (data) => {
  return defHttp.post({ url: '/ai/cameraManage/updateState', data });
};
