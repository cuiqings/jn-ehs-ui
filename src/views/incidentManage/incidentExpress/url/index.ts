import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/list', params });
};
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 新增/修改
export const saveOrUpdate = (data) => {
  return defHttp.post({ url: '/eventmanage/jnEvent/saveOrUpdate', data }, { isTransformResponse: false });
};
// 删除
export const manageDelete = (data, reload) => {
  return defHttp.delete({ url: '/eventmanage/jnEvent/delete', data: data }, { joinParamsToUrl: true }).then(() => {
    reload();
  });
};
// 批量删除
export const deleteBatch = (data) => {
  return defHttp.delete({ url: '/eventmanage/jnEvent/deleteBatch', data: data }, { joinParamsToUrl: true });
};
// 详情
export const queryById = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/queryById', params: params });
};
// 事件确认
export const buttonAdd = (data) => {
  return defHttp.post({ url: '/eventmanage/jnEventAffirmLog/add', data: data }, { joinParamsToUrl: true, isTransformResponse: false });
};
// 调查报告-提交审核
export const submitCheck = (data) => {
  return defHttp.post({ url: '/eventmanage/jnEventReport/submitCheck', data }, { isTransformResponse: false });
};
// 审核人
export const reviewUser = () => {
  return defHttp.get({ url: '/jn/common/getUserInfoByDepartName?departName=EHS管理中心' });
};
// 流程内容查看
export const queryByEventId = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventReport/queryVoByEventId', params: params });
};
// 获取最新报告
export const latestReport = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventReport/queryByEventId', params: params });
};
// 事件确认日志
export const affirmLog = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventAffirmLog/queryByEventId', params: params });
};
//整改落实添加修改
export const rectifySaveOrUpdate = (data) => {
  return defHttp.post({ url: '/eventmanage/jnEventRectify/saveOrUpdate', data }, { isTransformResponse: false });
};
// 整改落实查所有
export const queryVoByEventId = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventRectify/queryVoByEventId', params: params });
};
// 获取最新落实
export const newsImplement = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventRectify/queryByEventId', params: params });
};
// 获取调查资料
export const obtainMaterial = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEventSurveyFile/queryByEventId', params: params });
};
// 调查资料添加或修改
export const saveOrUpdateMaterial = (data) => {
  return defHttp.post({ url: '/eventmanage/jnEventSurveyFile/saveOrUpdate', data: data });
};
