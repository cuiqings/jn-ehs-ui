import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/warn/record/list',
  detail = '/warn/record/getWarnDetailById',
  deviceTree = '/deviceSiteCategory/listDeviceBySiteAndFunction',
  deviceFunction = '/deviceFunctionCategory/listDeviceFunctionTab',
  removeWarn = '/warn/record/handleWarn',
  checkWarn = '/warn/record/checkWarn',
  exportXls='/warn/record/exportXls',
  userRole = '/sys/user/queryUserRole',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 查询详情
 * @param params
 */
export const getDetail = (params) => defHttp.get({ url: Api.detail, params });
/**
 * 查询
 * @param params
 */
export const getDeviceTree = (params) => defHttp.get({ url: Api.deviceTree, params });
/**
 * 查询
 * @param params
 */
export const getDeviceFunction = (params) => defHttp.get({ url: Api.deviceFunction, params });
/**
 * 销警
 * @param params
 */
export const removeWarn = (params) => {
  return defHttp.post({ url: Api.removeWarn, data: params });
}
/**
 * 检查
 * @param params
 */
export const checkWarn = (params) => {
  return defHttp.post({ url: Api.checkWarn, data: params });
}
/**
 * 查询用户角色
 * @param params
 */
export const getUserRole = (params) => {
  return defHttp.get({ url: Api.userRole, params });
}