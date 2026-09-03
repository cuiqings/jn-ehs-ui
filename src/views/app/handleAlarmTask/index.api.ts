import { defHttp } from '/@/utils/http/axios';
const Api = {
  
  getWarnDetailById: '/warn/record/getWarnDetailById', // 详情

  handleWarn: '/warn/record/handleWarn', // 销警

  assignWarn: '/warn/record/assignWarn', // 指派
  
  getDepartTreeBy23: '/jn/common/getDepartTreeBy23',

  checkWarn: '/warn/record/checkWarn', // 验收

  departCom: '/jn/common/getDepart',

  userCom: '/jn/common/getUser',

  selectNormalChartByPointIds: '/daqPoint/selectNormalChartByPointIds' // 图表

};

export const getWarnDetailById = (params) => defHttp.get({ url: Api.getWarnDetailById, params  });

export const handleWarn = (params) => defHttp.post({ url: Api.handleWarn, params });

export const assignWarn = (params) => defHttp.post({ url: Api.assignWarn, params });

export const getDepartTreeBy23 = () => defHttp.get({ url: Api.getDepartTreeBy23 });

export const checkWarn = (params) => defHttp.post({ url: Api.checkWarn, params });

export const departCom = (params) => defHttp.get({ url: Api.departCom, params});

export const userCom = (id) => defHttp.get({ url: Api.userCom, params: { departIds: id } });

export const selectNormalChartByPointIds = (params) => defHttp.get({ url: Api.selectNormalChartByPointIds, params });

