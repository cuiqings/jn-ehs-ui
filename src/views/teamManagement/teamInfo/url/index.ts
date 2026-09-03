import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/system/upSectionManagement/list', params });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/system/upSectionManagement/edit', data });
};
// 手动同步
export const synTeams = () => {
  return defHttp.get({ url: '/system/upSectionManagement/SynTeams' });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/system/upSectionManagement/queryById', params });
};
