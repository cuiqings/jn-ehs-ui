import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/ecm/ecmDevice/list',
  save='/ecm/ecmDevice/add',
  edit='/ecm/ecmDevice/edit',
  update='/ecm/ecmDevice/update',
  deleteOne = '/ecm/ecmDevice/delete',
  deleteBatch = '/ecm/ecmDevice/deleteBatch',
  importExcel = '/ecm/ecmDevice/importExcel',
  exportXls = '/ecm/ecmDevice/exportXls',
  getPlanById ='/jnClearMaintenancePlan/queryById',
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
  // if (params.certificateValid) {
  //   let time = params.certificateValid.split(',');
  //   params['startTime'] = time[0] + ' 00:00:00';
  //   params['endTime'] = time[1] + ' 23:59:59';
  //   delete params['certificateValid'];
  // }
  return defHttp.get({url: Api.list, params});
};

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};
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
};
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
};

export const update = (params) => {
  return defHttp.post({url: Api.update, params});
};

// 清理详情
export const getPlanById = (params) => {
  return defHttp.get({ url: Api.getPlanById, params });
};
