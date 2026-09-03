import { defHttp } from '/@/utils/http/axios';

enum Api {
  ratelist = '/performDutiesRating/list',
  listSamePost = '/performDutiesRating/listSamePost',
  listDouble = '/performDutiesRating/listDouble',
  listDoubleExport = '/performDutiesRating/listDoubleExport',
  listDeduct = '/performDutiesRating/listDeduct',
  listDeductExport = '/performDutiesRating/listDeductExport',
}

/**
 * 分页查询列表
 * @param params 查询参数
 */
export const getRateList = (params) => {
  return defHttp.get({ url: Api.ratelist, params });
};
/**
 * 分页查询列表-相同岗位
 * @param params 查询参数
 */
export const getSamePostList = (params) => {
  return defHttp.get({ url: Api.listSamePost, params });
};
/**
 * 分页查询列表-重复岗位
 * @param params 查询参数
 */
export const getDoubleList = (params) => {
  return defHttp.get({ url: Api.listDouble, params });
};
/**
 * 重复岗位-导出
 */
export const doubleExport = Api.listDoubleExport
/**
 * 分页查询列表-扣款岗位
 * @param params 查询参数
 */
export const getDeductList = (params) => {
  return defHttp.get({ url: Api.listDeduct, params });
};
/**
 * 扣分岗位-导出
 */
export const deductExport = Api.listDeductExport
