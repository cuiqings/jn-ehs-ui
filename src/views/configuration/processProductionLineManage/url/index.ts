import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/ismc/ismcProcessLine/list', params });
};
// 所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/ismc/ismcProcessLine/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/ismc/ismcProcessLine/edit', data });
};
// 删除
export const del = (params) => {
  return defHttp.delete({ url: `/ismc/ismcProcessLine/delete`, params }, { joinParamsToUrl: true });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/ismc/ismcProcessLine/queryById', params });
};
// 工序下拉
export const getStructureData = (params) => {
  return defHttp.get({ url: '/ai/structure/getStructureData', params });
};
