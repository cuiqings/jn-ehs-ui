import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/ecm/ehsEcmEs/page',
  save='/ecm/ehsEcmEs/add',
  edit='/ecm/ehsEcmEs/edit',
  deleteOne = '/ecm/ehsEcmEs/delete',
  deleteBatch = '/ecm/ehsEcmEs/deleteBatch',
  importExcel = '/ecm/ehsEcmEs/importExcel',
  exportXls = '/ecm/ehsEcmEs/export',
}

// 列表
export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};
// 添加
export const add = (params) => {
  return defHttp.post({ url: '/ecm/ehsEcmEs/add', params });
};
//删除
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({ url:  Api.deleteOne, params },{joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};
// 导出
export const getExportUrl =  Api.exportXls;
// 获取详情
export const details = (params) => {
  return defHttp.get({ url: '/eventmanage/jnEvent/queryHistoryEventById', params: params });
};
