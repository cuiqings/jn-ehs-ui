import { defHttp } from '/@/utils/http/axios';
enum Api {
    list = '/warn/warnDevice/pageList',
    detail = '/hiddenDangerChecks/jnYhPlanExecute/detail',
    startDevice = '/warn/warnDevice/enableUpdate',
    stopDevice = '/warn/warnDevice/unEnableUpdate',
    warnHistoryList = '/warn/warnDevice/pageListByWarnDevice',
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
 * 启用设备
 * @param params
 */
export const startDevice = (params) => {
    return defHttp.post({ url: Api.startDevice, data: params });
}
/**
 * 停用设备
 * @param params
 */
export const stopDevice = (params) => {
    return defHttp.post({ url: Api.stopDevice, data: params });
}
/**
 * 查询历史记录
 * @param params
 */
export const getWarnHistoryList = (params) => defHttp.get({ url: Api.warnHistoryList, params });