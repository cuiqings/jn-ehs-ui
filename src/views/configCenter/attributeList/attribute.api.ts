import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/daqPoint/listPointPage',
  save = '/daqPoint/savePoint',
  delete = '/daqPoint/delPointBatch',
  deleteBatch = '/daqPoint/delPointBatch',
  exportXls = '/daqPoint/exportPointList',
  importExcel = '/daqPoint/importExcelPoint',
  detail = '/daqPoint/getPointById',
  deviceList = '/device/listDevicePage',
  sendPoint = '/daqPoint/sendPointJsonToGateway',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 任务发布
 * @param params
 */
export const saveEdit = (params) => {
  return defHttp.post({ url: Api.save, params });
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
 * 发送数据
 * @param params
 */
export const sendPointJsonToGateway = (params) => {
  return defHttp.post({ url: Api.sendPoint, params })
}
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入url
 */
export const getImportUrl = Api.importExcel;

