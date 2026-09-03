import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhConfirm/getCheckList',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};