import { defHttp } from '/@/utils/http/axios';
import { ContentTypeEnum } from '/@/enums/httpEnum';

enum Api {
  // 投入计划相关接口
  inputPlanPageList = '/investPlan/pageList',
  inputPlanInfo = '/investPlan/info',
  inputPlanDetail = '/investPlan/detail',
  inputPlanAdd = '/investPlan/add',
  inputPlanSave = '/investPlan/save',
  inputPlanDelete = '/investPlan/delete',
  inputPlanBatchDelete = '/safety/inputPlan/batchDelete',
  inputPlanSubmit = '/safety/inputPlan/submit',
  inputPlanUploadSignature = '/investPlan/uploadSign',
  inputPlanDownload = '/investPlan/download',
  investPlanCommitSign = '/investPlan/commitSign',
  queryLastYearBudget = '/investPlan/queryLastYearBudget',
  import = '/investPlan/import',
}

/**
 * 获取投入计划分页列表 - Mock实现
 * @param params
 */
export const inputPlanPageList = (params) => defHttp.get({ url: Api.inputPlanPageList, params });

export const inputPlanInfo = (params) => defHttp.get({ url: Api.inputPlanInfo, params });

export const inputPlanDetail = (params) => defHttp.get({ url: Api.inputPlanDetail, params });

export const inputPlanAdd = (params) => defHttp.post({ url: Api.inputPlanAdd, params });

export const inputPlanSave = (params) => defHttp.post({ url: Api.inputPlanSave, params });

export const inputPlanDelete = (params) => defHttp.post({ url: Api.inputPlanDelete, params });

export const inputPlanUploadSignature = (params) => defHttp.post({ url: Api.inputPlanUploadSignature, params });

export const inputPlanDownload = (params) => defHttp.get({ url: Api.inputPlanDownload, params });

export const queryLastYearBudget = (params) => defHttp.get({ url: Api.queryLastYearBudget, params });

export const investPlanCommitSign = (params) => defHttp.get({ url: Api.investPlanCommitSign, params });

/**
 * 提交投入计划
 * @param params
 */
export const inputPlanSubmit = (params) => {
  return defHttp.post({ url: Api.inputPlanSubmit, params });
};


export const importData = (params) => {
  return defHttp.post({ url: Api.import, params });
};
