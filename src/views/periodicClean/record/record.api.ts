import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnClearMaintenanceRecord/list',
  exportXls = '/jnClearMaintenanceRecord/exportXlsRecord',
  exportXlsRecord = '/jnClearMaintenanceRecord/exportXlsRecordDetails',
  getOrganizationNew = '/jn/common/getOrganizationNew'
}

// 获取部门
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
// 导出单条
export const exportXlsRecord = (params) => {
  return defHttp.get({ 
    url: Api.exportXlsRecord, 
    params, 
    responseType: 'blob'
  }, { isTransformResponse: false });
};
/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
