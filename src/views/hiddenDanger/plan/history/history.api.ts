import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/hiddenDangerChecks/jnYhPlanExecute/list',
  detail = '/hiddenDangerChecks/jnYhPlanExecute/detail',
  yhCountList = '/hiddenDangerChecks/jnYhPlanExecute/getYhList',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 查询详情
 * @param params
 */
export const getDetail = (params) => defHttp.get({ url: Api.detail, params });
/**
 * 查询隐患数量
 * @param params
 */
export const getYhCountList = (params) => defHttp.get({ url: Api.yhCountList, params });