import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/performDutiesAudit/listPage',
  save = '/performDutiesAudit/save',
  audit = '/performDutiesAudit/audit',
  auditBatch = '/performDutiesAudit/batchAudit',
  detail = '/performDutiesAudit/info',
}

/**
 * 分页查询列表
 * @param params 查询参数
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};


/**
 * 审核保存
 * @param params 保存数据
 */
export const saveRecord = (params) => {
  return defHttp.post({ url: Api.save, params });
};

/**
 * 审核提交
 * @param params 审核提交
 */
export const auditRecord = (params) => {
  return defHttp.post({ url: Api.audit, params });
};
/**
 * 审核批量提交
 * @param params 提交参数 
 */
export const auditBatch = (params) => {
  return defHttp.post({ url: Api.auditBatch, params });
};

/**
 * 详情查询
 * @param params 查询参数
 */
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};