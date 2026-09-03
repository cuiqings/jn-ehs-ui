import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/hiddenDangerChecks/jnYhConfirm/statisticsList',
  exportXls = '/hiddenDangerChecks/jnYhConfirm/exportXls',
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;