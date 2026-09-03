import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnPlanApproval/list',
  edit = '/jnPlanApproval/edit'
}

export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 更新
 * @param params
 */
export const saveOrUpdate = (params) => {
  return defHttp.put({ url: Api.edit, params });
};

