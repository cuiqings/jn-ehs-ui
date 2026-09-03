import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/pollutionDischarge/jnScreenPageSetup/list',
  saveOrUpdate = '/pollutionDischarge/jnScreenPageSetup/saveOrUpdate',
  delete = '/pollutionDischarge/jnScreenPageSetup/delete',
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
export const saveOrUpdate = (params) => {
  return defHttp.post({ url: Api.saveOrUpdate, params });
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


