import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 台账
  ledgerAdd = '/emergencyPlanLedger/add',
  ledgerPageList = '/emergencyPlanLedger/pageList',
  ledgerDel = '/emergencyPlanLedger/delete',
  ledgerEdit = '/emergencyPlanLedger/edit',
  ledgerDetail = '/emergencyPlanLedger/info/',
  // 物资管理
  suppliesPageList = '/emergencySupplies/pageList',
  suppliesAdd = '/emergencySupplies/add',
  suppliesEdit = '/emergencySupplies/edit',
  suppliesDeleteBatch = '/emergencySupplies/deleteBatch',
  suppliesCheck = '/emergencySupplies/check',
  suppliesDel = '/emergencySupplies/delete/',
  suppliesStatistics = '/emergencySupplies/statistics/',
  suppliesDownloadTemplate = '/emergencySupplies/downloadTemplate',
  suppliesImport = '/emergencySupplies/import',
  suppliesExport = '/emergencySupplies/export',
  suppliesCheckBatch = '/emergencySupplies/checkBatch',
  emergencySuppliesDetail = '/emergencySupplies/detail/',
  // 应急计划
  planPageList = '/rehearsalPlan/pagelist',
  planDetail = '/rehearsalPlan/detail/',
  planSave = '/rehearsalPlan/save',
  planAdd = '/rehearsalPlan/add',
  planEdit = '/rehearsalPlan/edit',
  planDelete = '/rehearsalPlan/delete',
  planDownloadTemplate = '/rehearsalPlan/downloadTemplate',
  planImport = '/rehearsalPlan/import',
  planExport = '/rehearsalPlan/export/',
  // 计划审批
  examineList = '/rehearsalExamine/list',
  examine = '/rehearsalExamine/examine',
  examineBack = '/rehearsalExamine/examineBack',
  // 任务
  taskList = '/drillTask/pageList',
  taskDetail = '/drillTask/detail/',
  drillScheme = '/drillTask/drillScheme',
  startDrill = '/drillTask/startDrill/',
  videoData = '/drillTask/videoData',
  trainContent = '/drillTask/trainContent',
  getDrillPersonNum = '/drillTask/getDrillPersonNum',
  drillRecord = '/drillTask/drillRecord',
  drillSummary = '/drillTask/drillSummary',
  signInQrCode = '/drillTask/signInQrCode/',
  signIn = '/drillTask/signIn',
  // 任务审批
  approvalList = '/drillTaskExamine/pageList',
  approvalDetail = '/drillTaskExamine/info/',
  approval = '/drillTaskExamine/approval',
  // 演练记录查看
  drillTaskView = '/drillTask/view',
  // 下载
  downloadTrainRecord = '/drillTask/downloadTrainRecord/',
  // 任务台账
  pageListLedger = '/ledgerManage/pageListLedger',
  deleteLedger = '/ledgerManage/deleteLedger/',
  ledgerEdit2 = '/drillTaskExamine/edit',
  // 统计app
  statisticsApp = '/emergencySupplies/statisticsApp',
}

// 台账
export const ledgerPageList = (params) => {
  return defHttp.get({ url: Api.ledgerPageList, params });
};
export const ledgerAdd = (params) => {
  return defHttp.post({ url: Api.ledgerAdd, params });
};
export const ledgerDel = (params) => {
  return defHttp.get({ url: Api.ledgerDel, params });
};
export const ledgerEdit = (params) => {
  return defHttp.post({ url: Api.ledgerEdit, params });
};
export const ledgerDetail = (params) => {
  return defHttp.get({ url: Api.ledgerDetail, params });
};
// 物资管理
export const suppliesPageList = (params) => {
  return defHttp.get({ url: Api.suppliesPageList, params });
};
export const suppliesAdd = (params) => {
  return defHttp.post({ url: Api.suppliesAdd, params });
};
export const suppliesEdit = (params) => {
  return defHttp.post({ url: Api.suppliesEdit, params });
};
export const suppliesDeleteBatch = (params) => {
  return defHttp.post({ url: Api.suppliesDeleteBatch, params });
};
export const suppliesCheck = (params) => {
  return defHttp.post({ url: Api.suppliesCheck, params });
};
export const suppliesStatistics = (params) => {
  return defHttp.get({ url: Api.suppliesStatistics + params });
};
export const suppliesDel = (params) => {
  return defHttp.get({ url: Api.suppliesDel + params });
};
export const suppliesDownloadTemplate = () => {
  return defHttp.get({ url: Api.suppliesDownloadTemplate });
};
export const suppliesImport = () => {
  return defHttp.post({ url: Api.suppliesImport });
};
export const suppliesExport = () => {
  return defHttp.post({ url: Api.suppliesExport });
};
export const suppliesCheckBatch = (params) => {
  return defHttp.post({ url: Api.suppliesCheckBatch, params });
};
export const emergencySuppliesDetail = (params) => {
  return defHttp.get({ url: Api.emergencySuppliesDetail + params });
};
// 应急计划
export const planPageList = (params) => {
  return defHttp.get({ url: Api.planPageList, params });
};
export const planDetail = (params) => {
  return defHttp.get({ url: Api.planDetail + params });
};
export const planSave = (params) => {
  return defHttp.post({ url: Api.planSave, params });
};
export const planAdd = (params) => {
  return defHttp.post({ url: Api.planAdd, params });
};
export const planEdit = (params) => {
  return defHttp.post({ url: Api.planEdit, params });
};
export const planDelete = (params) => {
  return defHttp.get({ url: Api.planDelete, params });
};
export const planDownloadTemplate = () => {
  return defHttp.get({ url: Api.planDownloadTemplate });
};
export const planImport = () => {
  return defHttp.post({ url: Api.planImport });
};
export const planExport = () => {
  return defHttp.post({ url: Api.planExport });
};
// 计划审批
export const examineList = (params) => {
  return defHttp.get({ url: Api.examineList, params });
};
export const examine = (params) => {
  return defHttp.post({ url: Api.examine, params });
};
export const examineBack = (params) => {
  return defHttp.post({ url: Api.examineBack, params });
};
// 任务
export const taskList = (params) => {
  return defHttp.get({ url: Api.taskList, params });
};
export const taskDetail = (params) => {
  return defHttp.get({ url: Api.taskDetail + params });
};
export const drillScheme = (params) => {
  return defHttp.post({ url: Api.drillScheme, params });
};
export const startDrill = (params) => {
  return defHttp.get({ url: Api.startDrill + params });
};
export const videoData = (params) => {
  return defHttp.post({ url: Api.videoData, params });
};
export const trainContent = (params) => {
  return defHttp.post({ url: Api.trainContent, params });
};
export const getDrillPersonNum = (params) => {
  return defHttp.get({ url: Api.getDrillPersonNum, params });
};
export const drillRecord = (params) => {
  return defHttp.post({ url: Api.drillRecord, params });
};
export const drillSummary = (params) => {
  return defHttp.post({ url: Api.drillSummary, params });
};
export const signInQrCode = (params) => {
  return defHttp.get({ url: Api.signInQrCode + params });
};
export const signIn = (params) => {
  return defHttp.post({ url: Api.signIn, params });
};
// 任务审批
export const approvalList = (params) => {
  return defHttp.get({ url: Api.approvalList, params });
};
export const approvalDetail = (params) => {
  return defHttp.get({ url: Api.approvalDetail + params });
};
export const approval = (params) => {
  return defHttp.post({ url: Api.approval, params });
};
export const drillTaskView = (params) => {
  return defHttp.get({ url: Api.drillTaskView, params });
};
export const downloadTrainRecord = (params) => {
  return defHttp.get({ url: Api.downloadTrainRecord + params, responseType: 'blob' }, { isTransformResponse: false });
};
// 任务台账
export const pageListLedger = (params) => {
  return defHttp.get({ url: Api.pageListLedger, params });
};
export const deleteLedger = (params) => {
  return defHttp.get({ url: Api.deleteLedger + params });
};
export const statisticsApp = (params) => {
  return defHttp.get({ url: Api.statisticsApp, params });
};
export const ledgerEdit2 = (params) => {
  return defHttp.post({ url: Api.ledgerEdit2, params });
};
