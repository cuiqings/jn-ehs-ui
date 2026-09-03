import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/daqCommunication/listCommunicationPage',
  save = '/daqCommunication/saveCommunication',
  delete = '/daqCommunication/delCommunicationBatch',
  deleteBatch = '/daqCommunication/delCommunicationBatch',
  detail = '/daqCommunication/getCommunicationById',
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
