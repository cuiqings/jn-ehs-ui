import { defHttp } from '/@/utils/http/axios';
const Api = {
  jnYhSspList: '/hiddenDangerChecks/jnYhSsp/listApp', // 随手拍列表

  jnYhSspSubmit: '/hiddenDangerChecks/jnYhSsp/submit', // 随手拍新增

  jnYhSspDetail: '/hiddenDangerChecks/jnYhSsp/detail', // 随手拍查看

  jnYhSspDelete: '/hiddenDangerChecks/jnYhSsp/delete', // 随手拍删除

  getDepartTreeBy23: '/jn/common/getDepartTreeBy23',

  getUserInfo: '/jn/common/getUserListByOrg',

  jnYhConfirmList: '/hiddenDangerChecks/jnYhConfirm/list', // 隐患确认

  jnYhRepairLogList: '/hiddenDangerChecks/jnYhConfirm/repairList', // 隐患整改

  jnYhConfirmDetail: '/hiddenDangerChecks/jnYhConfirm/queryById', // 隐患确认-通过id查询

  jnYhConfirmRepair: '/hiddenDangerChecks/jnYhConfirm/repair', // 整改反馈

  jnYhConfirmHandle: '/hiddenDangerChecks/jnYhConfirm/handle', // 整改处理

  jnYhConfirmCheckList: '/hiddenDangerChecks/jnYhConfirm/checkList', // 隐患验收-分页列表查询

  jnYhConfirmCheck: '/hiddenDangerChecks/jnYhConfirm/check', // 验收审核

  selectDeptNew: '/jn/common/selectDeptNew', // 部门

  jnYhPlanExecuteList: '/hiddenDangerChecks/jnYhPlanExecute/list', // 巡检记录-分页列表查询

  jnYhPlanExecuteDetail: '/hiddenDangerChecks/jnYhPlan/detail', // 巡检记录-获取详情

  approvalPlan: '/hiddenDangerChecks/jnYhPlan/approvalPlan', // 计划审批

  jnYhPlanExecuteDetailZX: '/hiddenDangerChecks/jnYhPlanExecute/detail', // 巡检记录执行-获取详情

  getDepart2List: '/jn/common/getDepart2List', // 获取二级机构列表

  getDepart3List: '/jn/common/getDepart3List', // 获取三级机构列表

  statistics1: '/hiddenDangerChecks/jnYhPlanExecute/statistics1', // 巡检计划统计

  statistics2: '/hiddenDangerChecks/jnYhPlanExecute/statistics2', // 各部门巡检计划完成情况

  statistics3: '/hiddenDangerChecks/jnYhPlanExecute/statistics3', // 各类型计划完成率

  statistics4: '/hiddenDangerChecks/jnYhPlanExecute/statistics4', // 任务完成情况统计

  statistics5: '/hiddenDangerChecks/jnYhPlanExecute/statistics5', // 未完成任务列表

  statistics6: '/hiddenDangerChecks/jnYhPlanExecute/statistics6', // 已完成任务列表

  saveItem: '/hiddenDangerChecks/jnYhPlanExecute/saveItem', // 保存检查项

  jnYhPlanExecuteSubmit: '/hiddenDangerChecks/jnYhPlanExecute/edit', // 检查项提交

  jnYhPlanExecuteItemDetail: '/hiddenDangerChecks/jnYhPlanExecute/itemDetail', // 获取检查项详情

  getRisk: '/riskControl/jnRiskPoint/list', // 隐患检查表-查询关联风险

  statisticsList: '/hiddenDangerChecks/jnYhConfirm/statisticsList', // 隐患告知

  statistics4ExportXls: '/hiddenDangerChecks/jnYhPlanExecute/statistics4ExportXls', // 任务完成情况导出

  ifSecurityByOrg: '/jn/common/ifSecurityByOrg', // 判断当前用户所属二级是否是安全主管部门
};

export const jnYhSspList = (params) => defHttp.get({ url: Api.jnYhSspList, params });

export const jnYhSspSubmit = (params) => defHttp.post({ url: Api.jnYhSspSubmit, params });

export const jnYhSspDetail = (params) => defHttp.get({ url: Api.jnYhSspDetail, params });

export const jnYhSspDelete = (params) => defHttp.delete({ url: Api.jnYhSspDelete + '?id=' + params.id + '&flag='+params.flag });

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

export const getDepart3List = (params) => defHttp.get({ url: Api.getDepart3List, params });

export const statistics1 = (params) => defHttp.get({ url: Api.statistics1, params });

export const statistics2 = (params) => defHttp.get({ url: Api.statistics2, params });

export const statistics3 = (params) => defHttp.get({ url: Api.statistics3, params });

export const statistics4 = (params) => defHttp.get({ url: Api.statistics4, params });

export const statistics5 = (params) => defHttp.get({ url: Api.statistics5, params });

export const statistics6 = (params) => defHttp.get({ url: Api.statistics6, params });

export const saveItem = (params) => defHttp.post({ url: Api.saveItem, params });

export const jnYhPlanExecuteSubmit = (params) => defHttp.post({ url: Api.jnYhPlanExecuteSubmit, params });

export const jnYhPlanExecuteItemDetail = (params) => defHttp.get({ url: Api.jnYhPlanExecuteItemDetail, params });

export const getRisk = (params) => defHttp.get({ url: Api.getRisk, params });

export const statisticsList = (params) => defHttp.get({ url: Api.statisticsList, params });


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
