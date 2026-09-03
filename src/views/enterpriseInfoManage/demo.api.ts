import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  basicInfoSave = '/information/jnEnterpriseBasicInformation/add',
  basicInfoGet = '/information/jnEnterpriseBasicInformation/queryByCode',
  safeInfoSave = '/informatio/jnSafetyBasicInformation/add',
  safeInfoGet = '/informatio/jnSafetyBasicInformation/queryByCode',
  tradeInfoSave = '/information/jnIndustryBasicInformation/add',
  tradeInfoGet = '/information/jnIndustryBasicInformation/queryByCode',
  queryDepartTreeSyncNew = '/sys/sysDepart/queryDepartTreeSyncNew',
}
/**
 * 获取部门树列表
 */
export const queryDepartTreeSyncNew = (params?) => defHttp.get({ url: Api.queryDepartTreeSyncNew, params });
/**
 * 企业基础信息表-添加
 * @param params
 */
export const basicInfoSave = (params) => {
  return defHttp.post({ url: Api.basicInfoSave, params })
};
/**
 * 企业基础信息表-查看
 * @param params
 */
export const basicInfoGet = (params) => {
  return defHttp.get({ url: Api.basicInfoGet, params }, { isTransformResponse: false });
};
/**
 * 安全生产基础信息表-添加
 * @param params
 */
export const safeInfoSave = (params) => {
  return defHttp.post({ url: Api.safeInfoSave, params })
};
/**
 * 安全生产基础信息表-查看
 * @param params
 */
export const safeInfoGet = (params) => {
  return defHttp.get({ url: Api.safeInfoGet, params }, { isTransformResponse: false });
};
/**
 * 工贸企业基础信息-添加
 * @param params
 */
export const tradeInfoSave = (params) => {
  return defHttp.post({ url: Api.tradeInfoSave, params })
};
/**
 * 工贸企业基础信息-查看
 * @param params
 */
export const tradeInfoGet = (params) => {
  return defHttp.get({ url: Api.tradeInfoGet, params }, { isTransformResponse: false });
};