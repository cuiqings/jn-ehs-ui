import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/historyEventList', params });
};
// 历史事故上传
export const add = (params) => {
  return defHttp.post({ url: '/eventmanage/jnEvent/saveHistoryEvent', params });
};
//损失天数补正
export const modifyLostWorkday = (data) => {
  return defHttp.put({ url: '/eventmanage/jnEvent/modifyLostWorkday', data });
};
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 获取详情
export const details = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/queryHistoryEventById', params: params });
};
// 发生单位查所有
export const getOrgInfoForOrgCode = () => {
  return defHttp.get({ url: '/jn/common/getOrgInfoForOrgCode' });
};
