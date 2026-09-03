import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/hiddenDangerChecks/jnYhConfirm/checkList',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};