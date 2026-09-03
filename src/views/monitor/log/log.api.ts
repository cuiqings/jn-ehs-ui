import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/sys/log/list',
  logincount = '/sys/log/logincount'
}

/**
 * 查询日志列表
 * @param params
 */
export const getLogList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 查询日志列表
 * @param params
 */
export const logincount = (params) => {
  return defHttp.get({ url: Api.logincount, params });
};
