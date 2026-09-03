import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnClearEntry/list',
  save = '/jnClearEntry/add',
  edit = '/jnClearEntry/edit',
  delete = '/jnClearEntry/delete',
  deleteBatch = '/jnClearEntry/deleteBatch'
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
 * 批量
 * @param params
 */
export const batchDeleteRecord = (params) => defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });

