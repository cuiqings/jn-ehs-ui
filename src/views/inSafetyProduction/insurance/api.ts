import { defHttp } from '/@/utils/http/axios';
enum Api {
  unitList = '/business-admin/unit-detail/list',
  unitAdd = '/business-admin/unit-detail/add',
  unitEdit = '/business-admin/unit-detail/edit',
  unitDel = '/business-admin/unit-detail/delete',
  unitBatchDel = '/business-admin/unit-detail/deleteBatch',
  unitStatistics = '/business-admin/unit-detail/statistics',
  // 申报明细
  bmList = '/businessAdmin/pageList',
  bmHistory = '/businessAdmin/history',
  bmTemp = '/businessAdmin/template',
  bmEdit = '/businessAdmin/edit',
  bmDel = '/businessAdmin/delete/',
  missingInfo = '/businessAdmin/missingInfo',
  // 增减申报
  declareList = '/declare/pageList',
  reportAdd = '/declare/add',
  report = '/declare/report',
  download = '/declare/download',
  queryByMonth = '/declare/queryByMonth',
  declareAudit = '/declare/audit',
  declareExport = '/declare/export',
  declareDel = '/declare/delete/',
}

export const unitList = (params) => defHttp.get({ url: Api.unitList, params });
export const unitAdd = (params) => defHttp.post({ url: Api.unitAdd, params });
export const unitEdit = (params) => defHttp.post({ url: Api.unitEdit, params });
export const unitDel = (params) => defHttp.get({ url: Api.unitDel, params });
export const unitBatchDel = (params) => defHttp.get({ url: Api.unitBatchDel, params });
export const unitStatistics = (params) => defHttp.get({ url: Api.unitStatistics, params });

export const bmList = (params) => defHttp.get({ url: Api.bmList, params });
export const bmHistory = (params) => defHttp.post({ url: Api.bmHistory, params });
export const bmTemp = (params) => defHttp.post({ url: Api.bmTemp, params });
export const bmEdit = (params) => defHttp.post({ url: Api.bmEdit, params });
export const bmDel = (params) => defHttp.get({ url: Api.bmDel+ params });
export const missingInfo = (params) => defHttp.get({ url: Api.missingInfo, params });

export const declareList = (params) => defHttp.get({ url: Api.declareList, params });
export const reportAdd = (params) => defHttp.post({ url: Api.reportAdd, params });
export const report = (params) => defHttp.post({ url: Api.report, params });
export const download = (params) => defHttp.post({ url: Api.download, params });
export const queryByMonth = (params) => defHttp.get({ url: Api.queryByMonth, params });
export const declareAudit = (params) => defHttp.post({ url: Api.declareAudit, params });

export const declareExport = (params) => defHttp.post({ url: Api.declareExport, params });
export const declareDelete = (params) => defHttp.get({ url: Api.declareDel + params });
