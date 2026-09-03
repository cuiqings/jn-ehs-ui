import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/ai/alarmRecord/listPage', params });
};
// 所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 详情
export const details = (params) => {
  return defHttp.get({ url: '/ai/alarmRecord/getInfo', params });
};
// 验收
export const acceptance = (data) => {
  return defHttp.post({ url: '/ai/alarmRecord/acceptance', data });
};
// 任务处理
export const jobHandle = (data) => {
  return defHttp.post({ url: '/ai/alarmRecord/jobHandle', data });
};
