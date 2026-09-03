import { defHttp } from '/@/utils/http/axios';
//

enum Api {
  collectData = '/space/energyRegionDevicePointView',
  chartView = '/space/energyDeviceListPointDataView/chart',
  listView = '/space/energyDeviceListPointDataView/list',
  dataByDeviceId = '/space/page/queryByDeviceId',
  assembly = '/deviceConfiguration/getAssembly',
  warnList = '/warn/record/list',
  adsorptionList = '/device/adsorbAndDesorb',
  exportXls = '/device/adsorbAndDesorb/export',
  exportUrl = '/space/energyDeviceListPointDataView/list/export',
}

export const getCollectData = (params) => defHttp.get({ url: Api.collectData, params: params });
export const getChartView = (params) => defHttp.get({ url: Api.chartView, params: params });
export const getListView = (params) => defHttp.get({ url: Api.listView, params: params });
export const getDataByDeviceId = (params) => defHttp.get({ url: Api.dataByDeviceId, params: params });
export const getAssembly = (params) => defHttp.get({ url: Api.assembly, params: params });
export const getWarnList = (params) => defHttp.get({ url: Api.warnList, params: params });
export const getAdsorptionList = (params) => defHttp.get({ url: Api.adsorptionList, params: params });
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 导出
 */
export const getExportUrl1 = (params) => defHttp.get({ url: Api.exportUrl, params: params });
// 获取已配置设备列表
export const listDevicePageSetup = () => {
  return defHttp.get({ url: '/space/page/listDevicePageSetup' });
};
// 复制设备实景
export const copyDevicePageSetup = (data) => {
  return defHttp.post({ url: '/space/page/copyDevicePageSetup', data });
};
