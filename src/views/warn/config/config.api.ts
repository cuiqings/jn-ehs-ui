import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/warn/config/list',
  add = '/warn/config/add',
  edit = '/warn/config/edit',
  delete = '/warn/config/delete',
  deleteBatch = '/warn/config/deleteBatch',
  exportXls = '/warn/config/exportList',
  importExcel = '/warn/config/importExcelWarnConfig',
  detail = '/warn/config/queryById',
  deviceList = '/device/listDevicePage',
  soundList = '/warnAlertor/warnAlertor/list',
  // devicePointList = '/device/listDevicePointPage',
  devicePointList = '/warn/config/listDevicePointBatch',
  messageTemplate = '/sys/message/sysMessageTemplate/list',
  roleList = '/jn/common/getRole',
  userList = '/jn/common/getUser',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 
 * @param params
 */
export const saveAdd = (params) => {
  return defHttp.post({ url: Api.add, params });
};
/**
 * 
 * @param params
 */
export const saveEdit = (params) => {
  return defHttp.put({ url: Api.edit, params });
};

/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const batchDeleteRecord = (params) => defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });
/**
 * 详情
 * @param params
 */
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
}
/**
 * 设备列表
 * @param params
 */
export const getDeviceList = (params) => {
  return defHttp.get({ url: Api.deviceList, params });
}
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入url
 */
export const getImportUrl = Api.importExcel;
/**
 * 获取声音列表
 * @param params
 */
export const getSoundList = (params) => {
  return defHttp.get({ url: Api.soundList, params });
}
/**
 * 获取设备点位、相关指标列表
 * @param params
 */
export const getDevicePointList = (params) => {
  return defHttp.get({ url: Api.devicePointList, params });
}
/**
 * 获取消息模板列表
 * @param params
 */
export const getMessageTemplate = (params) => {
  return defHttp.get({ url: Api.messageTemplate, params });
}
/**
 * 获取角色列表
 * @param params
 */
export const getRoleList = (params) => {
  return defHttp.get({ url: Api.roleList, params });
}
/**
 * 获取用户列表
 * @param params
 */
export const userList = (params) => {
  return defHttp.get({ url: Api.userList, params });
}
