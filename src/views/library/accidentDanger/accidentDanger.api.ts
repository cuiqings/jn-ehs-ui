import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/baseLibrary/bsSgLib/list',
  save = '/baseLibrary/bsSgLib/add',
  edit = '/baseLibrary/bsSgLib/edit',
  detail = '/baseLibrary/bsSgLib/queryById',
  delete = '/baseLibrary/bsSgLib/delete',
  deleteBatch = '/baseLibrary/bsSgLib/deleteBatch',
  importExcel = '/baseLibrary/bsSgLib/importExcel',
  exportXls = '/baseLibrary/bsSgLib/exportXls',
}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 系统列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 删除
 * @param params
 */
export const deleteById = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.post({ url: Api.delete, data: params }).then(() => {
        handleSuccess();
      });
    },
  });
}

/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.post({ url: Api.deleteBatch, data: params }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 新增培训记录
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * 根据ID查询详情
 * @param params
 */
export const getDetailById = (params) => defHttp.get({ url: Api.detail+params.id });
