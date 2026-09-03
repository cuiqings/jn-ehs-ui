import { defHttp } from '/@/utils/http/axios';
enum Api {
  queryAlltree = '/jnSecurityOrgStructure/queryTreeApp',
  queryById = '/jnSecurityOrgStructure/queryById'
}
/**
 * 获取部门树列表
 */
export const queryAlltree = (params?) => defHttp.get({ url: Api.queryAlltree, params });
export const queryById = (params?) => defHttp.get({ url: Api.queryById, params });

