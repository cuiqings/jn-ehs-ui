import { defHttp } from '/@/utils/http/axios';
enum Api {
    level = '/warn/record/warnLevelStats',
    status = '/device/deviceStatusStats',
    type = '/warn/record/warnConfigTypeStats',
    device = '/warn/record/warnStatsByFunctionCode',
    deviceBar = '/device/deviceStatusStatsByFunctionCode'
}

/**
 * 报警等级统计
 * @param params
 */
export const warnLevel = (params) => {
    return defHttp.get({ url: Api.level, params });
};
/**
 * 报警状态统计
 * @param params
 */
export const warnStatus = (params) => {
    return defHttp.get({ url: Api.status, params });
};
/**
 * 报警类型统计
 * @param params
 */
export const warnType = (params) => {
    return defHttp.get({ url: Api.type, params });
}
/**
 * 设备类型统计
 * @param params
 */
export const warnDevice = (params) => {
    return defHttp.get({ url: Api.device, params });
}
/**
 * 设备类型统计
 * @param params
 */
export const warnDeviceBar = (params) => {
    return defHttp.get({ url: Api.deviceBar, params });
}