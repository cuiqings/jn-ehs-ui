import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/eia/ehsEiaInfo/searchPage',
  save='/eia/ehsEiaInfo/add',
  edit='/eia/ehsEiaInfo/edit',
  deleteOne = '/eia/ehsEiaInfo/delete',
  deleteBatch = '/eia/ehsEiaInfo/deleteBatch',
  importExcel = '/eia/ehsEiaInfo/importExcel',
  exportXls = '/eia/ehsEiaInfo/exportXls',
  operate = '/eia/ehsEiaInfo/operate',
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
export const list = (params) =>
  defHttp.get({url: Api.list, params});

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

export const operate = (params,handleSuccess) => {
  let url = Api.operate;
  return defHttp.post({url: url, params},{joinParamsToUrl: false}).then(() => {
    if(handleSuccess!=null){
      handleSuccess();
    }
  });
}
