import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnClearMaintenancePlan/list',
  save = '/jnClearMaintenancePlan/add',
  edit = '/jnClearMaintenancePlan/edit',
  detail = '/jnClearMaintenancePlan/queryById',
  delete = '/jnClearMaintenancePlan/delete',
  deleteBatch = '/jnClearMaintenancePlan/deleteBatch',
  deactivateBatch = '/jnClearMaintenancePlan/deactivateBatch',
  enableBatch = '/jnClearMaintenancePlan/enableBatch',
  exportXls = '/jnClearMaintenancePlan/exportXls',
  getOrganizationNew = '/jn/common/getOrganizationNew',
}

// 获取部门
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;

/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

// 清理维护计划-通过id查询
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};

/**
 * 保存或者更新通告
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};

/**
 * 删除通告
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

// 批量启用
export const enableBatch = (params, handleSuccess) => {
  return defHttp.post({ url: Api.enableBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
// 批量停用
export const deactivateBatch = (params, handleSuccess) => {
  return defHttp.post({ url: Api.deactivateBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
// 批量删除
export const batchDeleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量消息公告
 * @param params
 */
// export const batchDeleteRecord = (params) => defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });

// 获取用户列表
export const getUserList = () => {
  return defHttp.get({ url: '/jn/common/getUserList' });
};
