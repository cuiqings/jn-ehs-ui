import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhReport/list',
  add = '/yh/skYhReport/add',
  reply = '/yh/skYhReport/reply',
  handle = '/yh/skYhReport/handle',
  reward = '/yh/skYhReport/reward',
  exportXls = '/yh/skYhReport/exportXls',
  delete = '/yh/skYhReport/delete',
  deleteBatch = '/yh/skYhReport/deleteBatch',
  ownDepartList = '/jn/common/get13BusinessDepartList',
}

/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 新增举报
 * @param params
 */
export const addReport = (params) => {
  return defHttp.post({ url: Api.add, params });
};

/**
 * 答复
 * @param params
 */
export const reply = (params) => {
  return defHttp.post({ url: Api.reply, params });
};

/**
 * 处理
 * @param params
 */
export const handleDanger = (params) => {
  return defHttp.post({ url: Api.handle, params });
};

/**
 * 奖励
 * @param params
 */
export const reward = (params) => {
  return defHttp.post({ url: Api.reward, params });
};
/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.get({ url: Api.delete, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const deleteBatchRecords = (params, handleSuccess) => {
  return defHttp.get({ url: Api.deleteBatch, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 查询当前用户所属单位列表
 */
export const getOwnDepartList = () => {
  return defHttp.get({ url: Api.ownDepartList });
};
