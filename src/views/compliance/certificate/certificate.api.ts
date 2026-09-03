import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/ecm/ehsEcmCertificate/list',
  save='/ecm/ehsEcmCertificate/add',
  edit='/ecm/ehsEcmCertificate/edit',
  update='/ecm/ehsEcmCertificate/update',
  deleteOne = '/ecm/ehsEcmCertificate/delete',
  deleteBatch = '/ecm/ehsEcmCertificate/deleteBatch',
  importExcel = '/ecm/ehsEcmCertificate/importExcel',
  exportXls = '/ecm/ehsEcmCertificate/exportXls',
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) => {
  if (params.certificateValid) {
    let time = params.certificateValid.split(',');
    params['startTime'] = time[0];
    params['endTime'] = time[1];
    delete params['certificateValid'];
  }
  return defHttp.get({url: Api.list, params});
}

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}

export const update = (params) => {
  return defHttp.post({url: Api.update, params});
}
