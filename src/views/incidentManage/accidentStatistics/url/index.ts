import { defHttp } from '/@/utils/http/axios';
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 事件分类统计
export const eventTypeStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/eventTypeStats', params }, { isTransformResponse: false });
};
// 事件结果统计
export const eventResultStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/eventResultStats', params }, { isTransformResponse: false });
};
// 事件发生单位统计
export const eventOrgCodeStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/eventOrgCodeStats', params }, { isTransformResponse: false });
};
// 事件发生趋势统计
export const eventTrendStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/eventTrendStats', params }, { isTransformResponse: false });
};
// 事件损失天数统计(年)
export const yearLostWorkdayStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/yearLostWorkdayStats', params }, { isTransformResponse: false });
};
// 事件损失天数统计(单位)
export const orgLostWorkdayStats = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/orgLostWorkdayStats', params }, { isTransformResponse: false });
};
// 发生单位查所有
export const getOrgInfoForOrgCode = () => {
  return defHttp.get({ url: '/jn/common/getEventStatsOrgInfoForOrgCode' });
};
