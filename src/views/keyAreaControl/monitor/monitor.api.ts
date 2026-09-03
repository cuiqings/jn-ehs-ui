import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/fireManagement/jnFireCleanCheck/list',
  edit = '/fireManagement/jnFireCleanCheck/edit',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  exportXls = '/fireManagement/jnFireCleanCheck/exportXls',
  getPlanById ='/jnClearMaintenanceRecord/getRecordById',
}

// 导出
export const exportUrl = Api.exportXls;

// 获取所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};

// 查询列表
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

// 记录
export const edit = (params) => {
  return defHttp.post({ url: Api.edit, params });
};

// 清理详情
export const getPlanById = (params) => {
  return defHttp.get({ url: Api.getPlanById, params });
};
