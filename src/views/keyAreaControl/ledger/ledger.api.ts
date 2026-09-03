import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/fireManagement/jnFireKeyLedger/list',
  save = '/fireManagement/jnFireKeyLedger/add',
  edit = '/fireManagement/jnFireKeyLedger/edit',
  deleteOne = '/fireManagement/jnFireKeyLedger/delete',
  deleteBatch = '/fireManagement/jnFireKeyLedger/deleteBatch',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  getClearName = '/fireManagement/jnFireKeyLedger/getClearName',
  modifyClearPlan = '/fireManagement/jnFireKeyLedger/modifyClearPlan',
  importExcel = '/fireManagement/jnFireKeyLedger/importExcel',
  exportXls = '/fireManagement/jnFireKeyLedger/exportXls',
  exportTemplete = '/sys/common/static/批量导入重点部位台账模板.xls',
  cleanDetail = '/jnClearMaintenancePlan/queryById',
  downloadTemplate = '/fireManagement/jnFireKeyLedger/downloadTemplate',
}

// 导出
export const exportUrl = Api.exportXls;

// 导入
export const importUrl = Api.importExcel;
export const downloadTemplateUrl = Api.downloadTemplate;
// 获取所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};

// 查询列表
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

// 新增/编辑
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};

// 删除
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

// 批量删除
export const batchDeleteRecord = (params) =>
  defHttp.delete(
    {
      url: Api.deleteBatch,
      data: params,
    },
    { joinParamsToUrl: true }
  );

export const modifyClearPlan = (params) => {
  return defHttp.get({ url: Api.modifyClearPlan, params });
};

export const exportXls = (params) => {
  return defHttp.get(
    {
      url: Api.exportTemplete,
      params,
      responseType: 'blob',
    },
    { isTransformResponse: false }
  );
};
