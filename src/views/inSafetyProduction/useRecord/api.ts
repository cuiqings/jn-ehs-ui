import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 投入计划相关接口
  useLedgerPageList = '/useLedger/pageList',
  useLedgerGetProject = '/useLedger/getProject',
  useLedgerDetail = '/useLedger/info',
  useLedgerAdd = '/useLedger/add',
  useLedgerEdit = '/useLedger/edit',
  useLedgerDelete = '/useLedger/delete',
  inputPlanBatchDelete = '/safety/inputPlan/batchDelete',
  getRemainingAmount = '/useLedger/getRemainingAmount',
  inputPlanUploadSignature = '/investPlan/uploadSign',
  inputPlanDownload = '/investPlan/download',
  investPlanCommitSign = '/investPlan/commitSign',
  queryLastYearBudget = '/investPlan/queryLastYearBudget',
}

/**
 * 获取投入计划分页列表 - Mock实现
 * @param params
 */
export const useLedgerPageList = (params) => defHttp.get({ url: Api.useLedgerPageList, params });

export const useLedgerGetProject = (params) => defHttp.get({ url: Api.useLedgerGetProject, params });

export const useLedgerDetail = (params) => defHttp.get({ url: Api.useLedgerDetail, params });

export const useLedgerAdd = (params) => defHttp.post({ url: Api.useLedgerAdd, params });

export const useLedgerEdit = (params) => defHttp.post({ url: Api.useLedgerEdit, params });

export const useLedgerDelete = (params) => defHttp.post({ url: Api.useLedgerDelete, params });

export const inputPlanUploadSignature = (params) => defHttp.post({ url: Api.inputPlanUploadSignature, params });

export const inputPlanDownload = (params) => defHttp.get({ url: Api.inputPlanDownload, params });

export const queryLastYearBudget = (params) => defHttp.get({ url: Api.queryLastYearBudget, params });

export const investPlanCommitSign = (params) => defHttp.get({ url: Api.investPlanCommitSign, params });

/**
 * 提交投入计划
 * @param params
 */
export const getRemainingAmount = (params) => {
  return defHttp.get({ url: Api.getRemainingAmount, params });
};

/**
 * 导出投入计划
 * @param params
 */
export const inputPlanExport = (params) => {
  return defHttp.get({ url: Api.inputPlanExport, params, responseType: 'blob' });
};
