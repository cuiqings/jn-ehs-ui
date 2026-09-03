import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/notice/ehsNoticeInfo/list',
  save='/notice/ehsNoticeInfo/add',
  edit='/notice/ehsNoticeInfo/edit',
  deleteOne = '/notice/ehsNoticeInfo/delete',
  deleteBatch = '/notice/ehsNoticeInfo/deleteBatch',
  importExcel = '/notice/ehsNoticeInfo/importExcel',
  exportXls = '/notice/ehsNoticeInfo/exportXls',
  approve = '/notice/ehsNoticeInfo/approve',
  ckNoticeNo = '/notice/ehsNoticeInfo/checkNoticeNo',
  hdaList = '/hiddenDangerChecks/jnYhConfirm/statisticsList',
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
export const list = (params) =>{
  if (params.createTime1) {
    let time = params.createTime1.split(',');
    params['startTime'] = time[0];
    params['endTime'] = time[1];
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

export const approve = (params) => {
  let url = Api.approve;
  return defHttp.post({url: url, params});
}

export const ckNoticeNo = (params) => {
  let url = Api.ckNoticeNo;
  return defHttp.post({url: url, params});
}


export const hdaList = (params) =>
  defHttp.get({url: Api.hdaList, params});


