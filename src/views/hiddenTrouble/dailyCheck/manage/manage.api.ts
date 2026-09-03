import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/yh/skYhPlan/list',
  save = '/yh/skYhPlan/add',
  edit = '/yh/skYhPlan/edit',
  delete = '/yh/skYhPlan/delete',
  deleteBatch = '/yh/skYhPlan/deleteBatch',
  exportXls = '/hiddenDangerChecks/jnYhPlan/exportXls',
  importExcel = '/sys/annountCement/importExcel',
  stopUse = '/hiddenDangerChecks/jnYhPlan/stopUse',
  startUse = '/hiddenDangerChecks/jnYhPlan/startUse',
  orgList = '/sys/sysDepart/selectLine',
  deviceList = '/hiddenDangerChecks/jnYhCheckItem/list',
  taskSelf = '/hiddenDangerChecks/jnYhPlan/generateTask',
  userList = '/jn/common/getAllUserByOrg',
  rgLcList = '/riskArea/getListAll',
}

/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入url
 */
export const getImportUrl = Api.importExcel;
/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 查询所属机构列表
 * @param params
 */
export const orgList = () => {
  return defHttp.get({ url: Api.orgList })
};
/**
 * 保存或者更新通告
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

/**
 * 删除通告
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 停用
 * @param id
 */
export const stopManage = (params, handleSuccess) => {
  return defHttp.get({ url: Api.stopUse, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 启用
 * @param id
 */
export const startManage = (params, handleSuccess) => {
  return defHttp.get({ url: Api.startUse, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 查询设备列表
 * @param params
 */
export const getDeviceList = (params) => {
  return defHttp.get({ url: Api.deviceList, params });
};
/**
 * 批量删除
 * @param params
 */
export const batchDeleteRecord = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 任务下发
 * @param params
 */
export const postTaskSelf = (params) => {
  return defHttp.post({ url: Api.taskSelf, params }, { joinParamsToUrl: true });
};
/**
 * 查询用户列表
 * @param params
 */
export const getUserList = (params) => {
  return defHttp.get({ url: Api.userList, params });
}
/**
 * 查询区域位置列表
 * @param params
 */
export const getRgLcList = (params) => {
  return defHttp.get({ url: Api.rgLcList, params });
}