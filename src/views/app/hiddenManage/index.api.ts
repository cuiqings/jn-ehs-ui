import { defHttp } from '/@/utils/http/axios';
const Api = {
  jnYhSspList: '/yh/skYhConfirm/getConfirmList', // 随手拍列表

  jnYhSspSubmit: '/yh/skYhConfirm/reportYh', // 随手拍新增

  jnYhSspEditSubmit: '/yh/skYhConfirm/edit', // 随手拍编辑

  jnYhSspDetail: '/yh/skYhConfirm/queryById', // 随手拍查看

  jnYhSspDelete: '/yh/skYhConfirm/delete', // 随手拍删除

  getDepartTreeBy23: '/jn/common/getDepartTreeBy23',

  getUserInfo: '/jn/common/getUserListByOrg',

  jnYhConfirmList: '/yh/skYhConfirm/getConfirmList', // 隐患确认

  jnYhRepairLogList: '/yh/skYhConfirm/getRepairList', // 隐患整改

  jnYhConfirmDetail: '/hiddenDangerChecks/jnYhConfirm/queryById', // 隐患确认-通过id查询

  jnYhConfirmRepair: '/yh/skYhConfirm/handleYh', // 整改反馈

  jnYhConfirmHandle: '/hiddenDangerChecks/jnYhConfirm/handle', // 整改处理

  jnYhConfirmCheckList: '/yh/skYhConfirm/getCheckList', // 隐患验收-分页列表查询

  jnYhConfirmCheck: '/yh/skYhConfirm/handleYh', // 验收审核

  selectDeptNew: '/jn/common/selectDeptNew', // 部门

  jnYhPlanExecuteList: '/hiddenDangerChecks/jnYhPlanExecute/list', // 巡检记录-分页列表查询

  jnYhPlanExecuteDetail: '/hiddenDangerChecks/jnYhPlan/detail', // 巡检记录-获取详情

  approvalPlan: '/hiddenDangerChecks/jnYhPlan/approvalPlan', // 计划审批

  jnYhPlanExecuteDetailZX: '/hiddenDangerChecks/jnYhPlanExecute/detail', // 巡检记录执行-获取详情

  getDepart2List: '/jn/common/getDepart2List', // 获取二级机构列表

  getOrganizationNew: '/jn/common/getOrganizationNew',

  getDepart3List: '/jn/common/getDepart3List', // 获取三级机构列表

  statistics1: '/yh/skYhStatistics/statistics8', // 巡检计划统计

  statistics2: '/yh/skYhStatistics/statistics9', // 各部门巡检计划完成情况

  statistics3: '/hiddenDangerChecks/jnYhPlanExecute/statistics3', // 各类型计划完成率

  statistics4: '/yh/skYhStatistics/statistics10', // '/yh/skYhStatistics/statistics10', // 计划完成情况

  statistics12: '/yh/skYhStatistics/statistics12',

  statistics5: '/yh/skYhStatistics/statistics11', // 未完成任务列表

  statistics6: '/hiddenDangerChecks/jnYhPlanExecute/statistics6', // 已完成任务列表

  jnYhPlanExecuteSubmit: '/hiddenDangerChecks/jnYhPlanExecute/edit', // 检查项提交

  jnYhPlanExecuteItemDetail: '/hiddenDangerChecks/jnYhPlanExecute/itemDetail', // 获取检查项详情

  getRisk: '/riskControl/jnRiskPoint/list', // 隐患检查表-查询关联风险

  accountList: '/yh/skYhConfirm/list', // 隐患告知

  statistics4ExportXls: '/yh/skYhStatistics/statistics10ExportXls', // 任务完成情况导出

  ifSecurityByOrg: '/jn/common/ifSecurityByOrg', // 判断当前用户所属二级是否是安全主管部门

  skYhPlanQueryById: '/yh/skYhPlanExecute/queryById',

  setEmpty: '/yh/skYhPlanExecute/setEmpty', // 空班

  saveItem: '/yh/skYhPlanExecute/saveItem', // 保存检查项

  submitTaskApp: '/yh/skYhPlanExecute/submitTaskApp', // 提交任务

  queryRkPoint: '/rk/skRkPoint/getPublishList', // 获取风险列表

  handleYh: '/yh/skYhConfirm/handleYh', // 隐患处理

  getUserListByRole: '/jn/common/getUserListByRole', // 加签人

  getTeamList: '/jn/common/getTeamList1', // 获取班次

  getUserListByTeam: '/jn/common/getUserListByTeamAndOrg', // 班组人员

  getFlowType: '/yh/skYhConfirm/getFlowType', // 判断上报人部门类型

  getDepartTreeBy12: '/jn/common/getDepartTreeBy12', // 获取机构树（只有一二级）

  statistics11notice: '/yh/skYhStatistics/statistics11notice', // 一键提醒

  getAssignee: '/yh/skYhConfirm/getAssignee',

  getWorkshopManager: '/yh/skYhPlanExecute/getWorkshopManager',

  getAllUserByOrg: '/jn/common/getAllUserByOrg',

  taskSubmit: '/yh/skYhPlanExecute/submitTaskWeb',

  changeRepairPerson: '/yh/skYhConfirm/changeRepairPerson',

  checkPlanList: '/yh/skYhPlan/list',

  checkPlanDetail: '/yh/skYhPlan/queryById',

  editPlan: '/yh/skYhPlan/edit',

  specialTaskQueryById: '/yh/skYhSpecialTask/queryById',

  specialTaskSubmit: '/yh/skYhSpecialTask/sign',

  specialSetRange: '/yh/skYhSpecialTask/setRange',

  saveItemForSpecial: '/yh/skYhSpecialTask/saveItem',

  submitTaskForSpecial: '/yh/skYhSpecialTask/submitTask',

  personTaskDetail: '/yh/skYhSpecialTask/getPersonDetail',

  repairTaskList: '/yh/skYhSpecialTask/list',

  repairPlanDetail: '/yh/skYhSpecialTask/getRepairPlan',

  repairApproval: '/yh/skYhSpecialTask/approveRepairPlan',

  repairPlanAndApproveLog: '/yh/skYhSpecialTask/getRepairPlanAndApproveLog',

  ifPostPerson: '/yh/skYhConfirm/ifPostPerson',

  teamLeaderList: '/yh/skYhPlanExecute/getTeamLeaderList', // 获取班组长

  workshopDirectorList: '/yh/skYhPlanExecute/getWorkshopDirectorList', // 获取车间主任

  userListByOrgAndRole: '/jn/common/getUserListByOrgAndRole',
  contractorList: '/contractor/queryContractorByOrgCode',
  changeHandler: '/yh/skYhPlanExecute/changeHandler',
  yhItemList: '/yh/skYhPlanExecute/getItemList', // 隐患检查项列表
  // 获取任务中的车间
  getWorkshopList: '/yh/skYhPlanExecute/getExecuteDepartList',
  // 获取任务中的辨识单元
  getRecogUnitList: '/yh/skYhPlanExecute/getExecuteRecogList',
  // 获取任务中的风险部位
  getRiskNameList: '/yh/skYhPlanExecute/getExecutePointList',
  // 获取用户归属单位列表
  getOwnOrgList: '/jn/common/get13BusinessDepartList',
  yhChangeHandler: '/yh/skYhConfirm/changeHandler',
  tipOffList: '/yh/skYhReport/list', // 举报列表
  tipOffDetail: '/yh/skYhReport/queryById', // 举报详情
  tipOffDelete: '/yh/skYhReport/delete', // 举报删除
  tipOffAddSubmit: '/yh/skYhReport/add', // 举报新增
  ownDepartList: '/jn/common/get13BusinessDepartList', // 获取用户归属单位列表
  reply: '/yh/skYhReport/reply', // 举报答复
  handle: '/yh/skYhReport/handle', // 举报处理
};

export const jnYhSspList = (params) => defHttp.get({ url: Api.jnYhSspList, params });

export const jnYhSspSubmit = (params) => defHttp.post({ url: Api.jnYhSspSubmit, params });

export const jnYhSspEditSubmit = (params) => defHttp.post({ url: Api.jnYhSspEditSubmit, params });

export const jnYhSspDelete = (params) => defHttp.delete({ url: Api.jnYhSspDelete + '?id=' + params.id });

export const getDepartTreeBy23 = () => defHttp.get({ url: Api.getDepartTreeBy23 });

export const getUserInfo = (code) => defHttp.get({ url: Api.getUserInfo + '?orgCode=' + code });

export const jnYhConfirmList = (params) => defHttp.get({ url: Api.jnYhConfirmList, params });

export const jnYhRepairLogList = (params) => defHttp.get({ url: Api.jnYhRepairLogList, params });

export const jnYhConfirmDetail = (params) => defHttp.get({ url: Api.jnYhConfirmDetail, params });

export const jnYhConfirmRepair = (params) => defHttp.post({ url: Api.jnYhConfirmRepair, params });

export const jnYhConfirmCheck = (params) => defHttp.post({ url: Api.jnYhConfirmCheck, params });

export const jnYhConfirmHandle = (params) => defHttp.post({ url: Api.jnYhConfirmHandle, params });

export const selectDeptNew = (params) => defHttp.get({ url: Api.selectDeptNew, params });

export const jnYhConfirmCheckList = (params) => defHttp.get({ url: Api.jnYhConfirmCheckList, params });

export const jnYhPlanExecuteList = (params) => defHttp.get({ url: Api.jnYhPlanExecuteList, params });

export const jnYhPlanExecuteDetail = (params) => defHttp.get({ url: Api.jnYhPlanExecuteDetail, params });

export const approvalPlan = (params) => defHttp.post({ url: Api.approvalPlan, params });

export const jnYhPlanExecuteDetailZX = (params) => defHttp.get({ url: Api.jnYhPlanExecuteDetailZX, params });

export const getDepart2List = (params) => defHttp.get({ url: Api.getDepart2List, params });

export const getOrganizationNew = (params) => defHttp.get({ url: Api.getOrganizationNew, params });

export const getDepart3List = (params) => defHttp.get({ url: Api.getDepart3List, params });

export const statistics1 = (params) => defHttp.get({ url: Api.statistics1, params });

export const statistics2 = (params) => defHttp.get({ url: Api.statistics2, params });

export const statistics3 = (params) => defHttp.get({ url: Api.statistics3, params });

export const statistics4 = (params) => defHttp.get({ url: Api.statistics4, params });

export const statistics5 = (params) => defHttp.get({ url: Api.statistics5, params });

export const statistics6 = (params) => defHttp.get({ url: Api.statistics6, params });

export const statistics12 = (params) => defHttp.get({ url: Api.statistics12, params });

export const jnYhPlanExecuteSubmit = (params) => defHttp.post({ url: Api.jnYhPlanExecuteSubmit, params });

export const jnYhPlanExecuteItemDetail = (params) => defHttp.get({ url: Api.jnYhPlanExecuteItemDetail, params });

export const getRisk = (params) => defHttp.get({ url: Api.getRisk, params });

export const accountList = (params) => defHttp.get({ url: Api.accountList, params });

export const ifSecurityByOrg = () => defHttp.get({ url: Api.ifSecurityByOrg });

export const statistics4ExportXls = (params) =>
  defHttp.get(
    {
      url: Api.statistics4ExportXls,
      params,
      responseType: 'blob',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    },
    { isTransformResponse: false }
  );

// 重工
export const skYhPlanQueryById = (params) => defHttp.get({ url: Api.skYhPlanQueryById, params });

export const setEmpty = (params) => defHttp.post({ url: Api.setEmpty, params });

export const saveItem = (params) => defHttp.post({ url: Api.saveItem, params });

export const submitTaskApp = (params) => defHttp.post({ url: Api.submitTaskApp, params });

export const getRkPointList = (params) => defHttp.get({ url: Api.queryRkPoint, params });

export const handleYh = (params) => defHttp.post({ url: Api.handleYh, params });

export const getUserListByRole = (params) => defHttp.get({ url: Api.getUserListByRole, params });

export const getTeamList = (params) => defHttp.get({ url: Api.getTeamList, params });

export const getUserListByTeam = (params) => defHttp.get({ url: Api.getUserListByTeam, params });

export const getFlowType = (params) => defHttp.get({ url: Api.getFlowType + '?userId=' + params });

export const getDepartTreeBy12 = () => defHttp.get({ url: '/jn/common/getDepartTreeBy12' });

export const statistics11notice = (params) => defHttp.get({ url: Api.statistics11notice, params });

export const getAssignee = (params) => defHttp.get({ url: Api.getAssignee, params });

export const getWorkshopManager = (params) => defHttp.get({ url: Api.getWorkshopManager, params });

export const getAllUserByOrg = (params) => defHttp.get({ url: Api.getAllUserByOrg, params });
export const taskSubmit = (params) => defHttp.post({ url: Api.taskSubmit, params });

/**
 * 更换整改人
 */
export const changeRepairPerson = (params) => {
  return defHttp.post({ url: Api.changeRepairPerson, params });
};
export const checkPlanList = (params) => {
  return defHttp.get({ url: Api.checkPlanList, params });
};
export const checkPlanDetail = (params) => {
  return defHttp.get({ url: Api.checkPlanDetail, params });
};
export const editPlan = (params) => {
  return defHttp.post({ url: Api.editPlan, params });
};
export const specialTaskQueryById = (params) => {
  return defHttp.get({ url: Api.specialTaskQueryById, params });
};
export const specialTaskSubmit = (params) => {
  return defHttp.post({ url: Api.specialTaskSubmit, params });
};
export const specialSetRange = (params) => {
  return defHttp.post({ url: Api.specialSetRange, params });
};
export const saveItemForSpecial = (params) => {
  return defHttp.post({ url: Api.saveItemForSpecial, params });
};
export const submitTaskForSpecial = (params) => {
  return defHttp.post({ url: Api.submitTaskForSpecial, params });
};
export const getPersonSpecialTaskDetail = (params) => {
  return defHttp.get({ url: Api.personTaskDetail, params });
};
export const repairTaskList = (params) => {
  return defHttp.get({ url: Api.repairTaskList, params });
};
export const repairPlanDetail = (params) => {
  return defHttp.get({ url: Api.repairPlanDetail, params });
};
export const repairApproval = (params) => {
  return defHttp.post({ url: Api.repairApproval, params });
};
export const getRepairPlanAndApproveLog = (params) => {
  return defHttp.get({ url: Api.repairPlanAndApproveLog, params });
};
export const ifPostPerson = () => {
  return defHttp.get({ url: Api.ifPostPerson });
};
/**
 * 获取班组长列表
 */
export const getTeamLeaderList = () => {
  return defHttp.get({ url: Api.teamLeaderList });
};
/**
 * 获取详情
 * @param params
 */
export const jnYhSspDetail = (params) => {
  return defHttp.get({ url: Api.jnYhSspDetail, params });
};
export const getWorkshopDirectorList = (params) => {
  return defHttp.get({ url: Api.workshopDirectorList, params });
};
/**
 * 根据组织编码和角色获取用户列表
 */
export const getUserListByOrgAndRole = (params) => {
  return defHttp.get({ url: Api.userListByOrgAndRole, params });
};
/**
 * 根据组织编码获取承包商列表
 */
export const getContractorList = (params) => {
  return defHttp.get({ url: Api.contractorList, params });
};

/**
 * 更换处理人
 */
export const changeHandler = (params) => {
  return defHttp.post({ url: Api.changeHandler, params });
};
/**
 * 隐患检查项列表
 */
export const getYhItemList = (params) => {
  return defHttp.get({ url: Api.yhItemList, params });
};
/**
 * 获取任务中的车间
 */
export const getWorkshopList = (params) => {
  return defHttp.get({ url: Api.getWorkshopList, params });
};
/**
 * 获取任务中的辨识单元
 */
export const getRecogUnitList = (params) => {
  return defHttp.get({ url: Api.getRecogUnitList, params });
};
/**
 * 获取任务中的风险部位
 */
export const getRiskNameList = (params) => {
  return defHttp.get({ url: Api.getRiskNameList, params });
};
/**
 * 获取用户归属单位列表
 */
export const getOwnOrgList = () => {
  return defHttp.get({ url: Api.getOwnOrgList });
};
/**
 * 更换处理人
 */
export const yhChangeHandler = (params) => {
  return defHttp.post({ url: Api.yhChangeHandler, params });
};
/**
 * 举报列表
 */
export const tipOffList = (params) => {
  return defHttp.get({ url: Api.tipOffList, params });
};
/**
 * 举报详情
 */
export const tipOffDetail = (params) => {
  return defHttp.get({ url: Api.tipOffDetail, params });
};
/**
 * 举报删除
 */
export const tipOffDelete = (params) => {
  return defHttp.get({ url: Api.tipOffDelete, params });
};
/**
 * 举报新增
 */
export const tipOffAddSubmit = (params) => {
  return defHttp.post({ url: Api.tipOffAddSubmit, params });
};
/**
 * 获取用户归属单位列表
 */
export const getOwnDepartList = () => {
  return defHttp.get({ url: Api.ownDepartList });
};
/**
 * 举报答复
 */
export const reply = (params) => {
  return defHttp.post({ url: Api.reply, params });
};
/**
 * 举报处理
 */
export const handleDanger = (params) => {
  return defHttp.post({ url: Api.handle, params });
};
