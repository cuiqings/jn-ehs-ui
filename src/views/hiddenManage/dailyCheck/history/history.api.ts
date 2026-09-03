import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhPlanExecute/list',
  detail = '/yh/skYhPlanExecute/queryById',
  yhCountList = '/yh/skYhPlanExecute/getYhList',
  exportUrl = '/yh/skYhPlanExecute/exportXls',
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
/**
 * 导出
 * @param params
 */
export const getExportUrl = Api.exportUrl
