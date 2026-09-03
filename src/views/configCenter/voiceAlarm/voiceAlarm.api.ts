import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/warnAlertor/warnAlertor/list',
  save = '/warnAlertor/warnAlertor/saveOrUpdate',
  edit = '/warnAlertor/warnAlertor/saveOrUpdate',
  delete = '/warnAlertor/warnAlertor/delete',
  deleteBatch = '/warnAlertor/warnAlertor/deleteBatch',
  closeSound = '/warnAlertor/warnAlertor/closeSoundById',
  testSound = '/warnAlertor/warnAlertor/testSoundById',
  closeSoundBatch = '/warnAlertor/warnAlertor/closeSoundBatch',
  relateWarn = '/warnAlertor/warnAlertor/relateWarnConfigNum',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
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
 * 消音
 * @param params
 */
export const closeSound = (params, handleSuccess) => {
  return defHttp.post({ url: Api.closeSound + '/' + params.id }).then(() => {
    handleSuccess();
  });
}
/**
 * 测试声音
 * @param params
 */
export const testSound = (params, handleSuccess) => {
  return defHttp.get({ url: Api.testSound, params }).then(() => {
    handleSuccess();
  });
}
/**
 * 批量消音
 * @param params
 */
export const closeSoundBatch = (params, handleSuccess) => defHttp.post({ url: Api.closeSoundBatch + '/' + params.ids.join() }).then(() => {
  handleSuccess();
});
/**
 * 关联预警
 * @param params
 */
export const getRelateWarn = (params) => {
  return defHttp.get({ url: Api.relateWarn, params })
}