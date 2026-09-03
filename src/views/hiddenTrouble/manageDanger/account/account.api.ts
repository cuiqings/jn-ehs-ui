import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/yh/skYhConfirm/list',
  exportXls = '/yh/skYhConfirm/exportXls',
  dangerReport = '/yh/skYhConfirm/reportYh',
  userList = '/jn/common/getAllUserByOrg',
  rgLcList = '/riskArea/getListAll',
  riskByIds = '/riskControl/jnRiskPoint/getByIds',
  confirm = '/hiddenDangerChecks/jnYhConfirm/handle',
  deleteRecord = '/yh/skYhConfirm/delete',
  rectify='/hiddenDangerChecks/jnYhConfirm/repair',
  review = '/hiddenDangerChecks/jnYhConfirm/check',
  dealDanger = '/yh/skYhConfirm/handleYh',
  detail = '/yh/skYhConfirm/queryById',
  teamList = '/jn/common/getTeamList1',
  flowType = '/yh/skYhConfirm/getFlowType',
  riskPointsList = '/riskIdentification/queryByOrgOrDeptCode',
  teamUserList = '/jn/common/getUserListByTeamAndOrg',
  userListByRole = '/jn/common/getUserListByRole',
  nextAssignee = '/yh/skYhConfirm/getAssignee',
  flowList = '/yh/skYhConfirm/getFlow',
  editInfo = '/yh/skYhConfirm/edit',
  changeRepairPerson = '/yh/skYhConfirm/changeRepairPerson'
}

/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 隐患确认
 * @param params
 */
export const dangerReport = (params) => {
  return defHttp.post({ url: Api.dangerReport, params });
}
/**
 * 获取用户列表
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
/**
 * 根据ID查询风险点列表
 * @param params
 */
export const riskByIds = (params) => {
  return defHttp.get({ url: Api.riskByIds, params });
};
/**
 * 确认
 * @param params
 */
export const hiddenConfirm = (params) => {
  return defHttp.post({ url: Api.confirm, params });
}
/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteRecord, data: params }, { joinParamsToUrl: true }).then
    (() => {
      handleSuccess();
    });
}
/**
 * 整改
 * @param params
 */
export const hiddenRectify = (params) => {
  return defHttp.post({ url: Api.rectify, params });
}
/**
 * 复查
 * @param params
 */
export const hiddenReview = (params) => {
  return defHttp.post({ url: Api.review, params });
}
/**
 * 处理隐患
 * @param params
 */
export const dealDanger = (params) => {
  return defHttp.post({ url: Api.dealDanger, params });
}
/**
 * 获取详情
 * @param params
 */
export const getDangerDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
}
/**
 * 获取班组列表
 */
export const getTeamList = (params) => {
  return defHttp.get({ url: Api.teamList, params });
}
/**
 * 获取流程类型
 */
export const getFlowType = (params) => {
  return defHttp.get({ url: Api.flowType, params });
}
/**
 * 查询风险点列表
 * @param params
 */
export const getRiskPointsList = (params) => {
  return defHttp.get({ url: Api.riskPointsList, params });
}
/**
 * 获取班组人员列表
 */
export const getTeamUserList = (params) => {
  return defHttp.get({ url: Api.teamUserList, params });
}
/**
 * 根据角色获取用户列表
 */
export const getUserListByRole = (params) => {
  return defHttp.get({ url: Api.userListByRole, params });
}
/**
 * 获取下一步处理人
 */
export const getNextAssignee = (params) => {
  return defHttp.get({ url: Api.nextAssignee, params });
}
/**
 * 获取流程列表
 */
export const getFlowList = (params) => {
  return defHttp.get({ url: Api.flowList, params });
}
/**
 * 编辑
 */
export const editInfo = (params) => {
  return defHttp.post({ url: Api.editInfo, params });
}
/**
 * 更换整改人
 */
export const changeRepairPerson = (params) => {
  return defHttp.post({ url: Api.changeRepairPerson, params });
}