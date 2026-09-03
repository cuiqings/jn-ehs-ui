import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/conference/pageList', params });
};
// 删除
export const cancel = (params) => {
  return defHttp.get({ url: '/conference/cancel', params }, { joinParamsToUrl: true });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/conference/add', data });
};
// 会议纪要
export const minutes = (params) => {
  return defHttp.post({ url: '/conference/minutes', params });
};
export const sign = (params) => {
  return defHttp.post({ url: '/conference/sign', params });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/conference/edit', data });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/conference/detail', params });
};
// 离场
export const download = (params) => {
  return defHttp.get({ url: '/conference/download', responseType: 'blob', params }, { isReturnNativeResponse: true });
};
// 资质状态统计数量
export const aptitudeStatistics = () => {
  return defHttp.get({ url: '/xgf/xgfPerson/aptitudeStatistics' });
};
// 考核
export const examine = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/examine', data });
};
// 考核记录
export const getExamineLog = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/getExamineLog', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
