import { defHttp } from '/@/utils/http/axios';
const Api = {
  getList: '/warn/warnDevice/pageList',
  unEnableUpdate: '/warn/warnDevice/unEnableUpdate',
  enableUpdate: '/warn/warnDevice/enableUpdate',

  pageListByWarnDevice: '/warn/warnDevice/pageListByWarnDevice', // 设备详情

  saveBatchCheckDate: '/riskControl/jnRiskSpecialCheck/saveBatchCheckDate', // 批量检验

  saveCheckDate: '/riskControl/jnRiskSpecialCheck/saveCheckDate',

  getDepartTreeBy23: '/jn/common/getDepartTreeBy23',

  getUserInfo: '/jn/common/getUserListByOrg',

  getDepart2List: '/jn/common/getDepart2List', // 获取二级机构列表

};

export const getList = (params) => defHttp.get({ url: Api.getList, params });

export const unEnableUpdate = (params) => defHttp.post({ url: Api.unEnableUpdate, params });

export const enableUpdate = (params) => defHttp.post({ url: Api.enableUpdate, params });

export const pageListByWarnDevice = (params) => defHttp.get({ url: Api.pageListByWarnDevice, params });

export const saveBatchCheckDate = (params) => defHttp.post({ url: Api.saveBatchCheckDate, params });

export const saveCheckDate = (params) => defHttp.post({ url: Api.saveCheckDate, params });

export const getDepartTreeBy23 = () => defHttp.get({ url: Api.getDepartTreeBy23 });

export const getUserInfo = (code) => defHttp.get({ url: Api.getUserInfo + '?orgCode=' + code });

export const getDepart2List = (params) => defHttp.get({ url: Api.getDepart2List, params });
