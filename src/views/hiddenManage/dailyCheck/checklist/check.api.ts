import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/yh/skYhItem/list',
  save = '/yh/skYhItem/add',
  edit = '/yh/skYhItem/edit',
  delete = '/hiddenDangerChecks/jnYhCheckItem/delete',
  deleteBatch = '/hiddenDangerChecks/jnYhCheckItem/deleteBatch',
  exportXls = '/yh/skYhItem/exportXls',
  importExcel = '/hiddenDangerChecks/jnYhCheckItem/importExcel',
  orgList = '/sys/sysDepart/selectLine',
  deviceList = '/hiddenDangerChecks/jnYhCheckItem/getDevice',
  riskPointsList = '/riskControl/jnRiskPoint/list',
  deviceById = '/hiddenDangerChecks/jnYhCheckItem/getDeviceById',
  riskById = '/riskIdentification/getList',
  isExist = '/hiddenDangerChecks/jnYhCheckItem/isExist',
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
  return defHttp.get({ url: Api.orgList });
};
/**
 * 保存或者更新通告
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
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
 * 查询设备列表
 * @param params
 */
export const getDeviceList = (params) => {
  return defHttp.get({ url: Api.deviceList, params });
};
/**
 * 查询设备列表
 * @param params
 */
export const getRiskPointsList = (params) => {
  return defHttp.get({ url: Api.riskPointsList, params });
};
/**
 * 根据ID查询设备列表
 * @param params
 */
export const getDeviceById = (params) => {
  return defHttp.get({ url: Api.deviceById, params });
};
/**
 * 根据ID查询风险点列表
 * @param params
 */
export const getRiskInfoById = (params) => {
  return defHttp.get({ url: Api.riskById, params });
};
/**
 * 是否存在
 * @param params
 */
export const getIsExist = (params) => {
  return defHttp.get({ url: Api.isExist, params });
};
