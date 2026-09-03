import { defHttp } from '/@/utils/http/axios';
// 企业基础信息表-添加
export const basicInfoSave = (data) => {
  return defHttp.post({ url: '/information/jnEnterpriseBasicInformation/add', data });
};
// 企业基础信息表-查看
export const basicInfoView = (params) => {
  return defHttp.get({ url: '/information/jnEnterpriseBasicInformation/queryByCode', params }, { isTransformResponse: false });
};
// 安全生产基础信息表-添加
export const safeInfoSave = (data) => {
  return defHttp.post({ url: '/informatio/jnSafetyBasicInformation/add', data });
};
// 安全生产基础信息表-查看
export const safeInfoView = (params) => {
  return defHttp.get({ url: '/informatio/jnSafetyBasicInformation/queryByCode', params }, { isTransformResponse: false });
};
