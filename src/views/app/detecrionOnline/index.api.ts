import { defHttp } from '/@/utils/http/axios';
const Api = {
  listDeviceFunctionTab: '/deviceFunctionCategory/listDeviceFunctionTab', // 设备类型

  energyRegionDeviceListViewNew: '/space/energyRegionDeviceListViewNew', // 列表

  deviceStatusStats: '/device/deviceStatusStats', // 设备状态
  
  getDepartTreeBy23: '/jn/common/getDepartTreeBy23',

  energyRegionDevicePointView: '/space/energyRegionDevicePointView',

  getUserInfo: '/jn/common/getUserListByOrg',

  getDepart2List: '/jn/common/getDepart2List', // 获取二级机构列表

  pointChart: '/space/energyDeviceListPointDataView/chart',

  pointList: '/space/energyDeviceListPointDataView/list',
  
  listDeviceCategoryTree: '/deviceCategory/listDeviceCategoryTree'

};

export const listDeviceFunctionTab = () => defHttp.get({ url: Api.listDeviceFunctionTab });

export const energyRegionDeviceListViewNew = (params) => defHttp.get({ url: Api.energyRegionDeviceListViewNew, params });

export const deviceStatusStats = (params) => defHttp.get({ url: Api.deviceStatusStats, params });

export const energyRegionDevicePointView = (params) => defHttp.get({ url: Api.energyRegionDevicePointView, params });

export const getDepartTreeBy23 = () => defHttp.get({ url: Api.getDepartTreeBy23 });

export const getUserInfo = (code) => defHttp.get({ url: Api.getUserInfo + '?orgCode=' + code });

export const getDepart2List = (params) => defHttp.get({ url: Api.getDepart2List, params });

export const pointChart = (params) => defHttp.get({ url: Api.pointChart, params });

export const pointList = (params) => defHttp.get({ url: Api.pointList, params });

export const listDeviceCategoryTree = (params) => defHttp.get({ url: Api.listDeviceCategoryTree, params });


