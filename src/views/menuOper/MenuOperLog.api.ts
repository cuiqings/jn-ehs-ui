import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/menu/menuOperLog/groupList',
  save='/menu/menuOperLog/add',
  edit='/menu/menuOperLog/edit',
  deleteOne = '/menu/menuOperLog/delete',
  deleteBatch = '/menu/menuOperLog/deleteBatch',
  importExcel = '/menu/menuOperLog/importExcel',
  exportXls = '/menu/menuOperLog/exportXls',
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
  if (params.createTime1) {
    let time = params.createTime1.split(',');
    params['startTime'] = time[0]+ ' 00:00:00';
    params['endTime'] = time[1]+ ' 23:59:59';
    delete params['createTime1'];
  }
  return  defHttp.get({url: Api.list, params});
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
