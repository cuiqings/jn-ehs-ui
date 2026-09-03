import type { JobApplyForFrom, searchJobList, searchJobType } from '../type';
import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 申请单位
  applyForUnit = '/jn/common/getOrganization',
  //获取登录人组织二级
  getLoginUserOrg = '/jn/common/getOrganizationNew',
  // 作业人
  Approval = '/jn/common/getUser',
  // 作业类型
  JobType = '/sys/dict/getDictItems/work_type',
  //上传图片
  uploadImg = '/sys/common/upload',
  // 作业申请
  WorkApplyList = '/workApply/listPage',
  // 作业等级类型
  GradeByType = '/workApply/getGradeByType',
  // 删除作业
  delJobList = '/workApply/delete',
  //批量删除作业
  deleteWork = '/workApply/deleteBatch',
  //作业查看详情
  WorkDetail = '/workApply/getInfo',
  //作业流程查看详情
  workJobWorkDetail = '/workApply/getInfoWorkExamine',
  // 新增作业
  WorkAdd = '/workApply/add',
  // 保存作业
  keepJob = '/workApply/save',
  // 修改作业
  modificationJob = '/workApply/edit',
  // 安全措施
  safetyPrecautions = '/work/security/getWorkSecurityMeasuresByType',
  // 审批流程
  getListByType = '/workApply/getListByType',
  // 获取其他特殊作业编号
  getOtherWorkCode = '/workApply/getOtherWorkCode',
  // 有限空间
  LimitSpace = '/workApply/getLimitSpace',
  // 作业人
  getIdCode = '/workApply/getIdCode',
  // 作业审批
  workExamineList = '/workExamine/listPage',
  // 作业查看详情
  workExamineInfo = '/workExamine/examineInfo',
  //作业审批退回
  workExamineBack = '/workExamine/examineRejection',
  // 作业审批通过
  workExaminePass = '/workExamine/examine',
  //作业审批延时详情
  workExamineDelay = '/workExamine/delayExamineInfo',
  //作业审批延时审批
  workExamineDelayApproval = '/workExamine/delayExamine',
  //作业审批延时审批退回
  workExamineDelayBack = '/workExamine/delayExamineRejection',
  //作业管理
  workManageList = '/workManage/listPage',
  //作业导出
  derive = '/workManage/exportWork',
  // 开始作业
  startWork = '/workManage/startWork',
  //延时续签
  delaySign = '/workManage/delay',
  //作业中断
  interruptWork = '/workManage/interruptionWork',
  //作业继续
  continueWork = '/workManage/continueWork',
  //作业完成
  completeWork = '/workManage/finish',
  //添加分析
  addAnalysis = '/workManage/addAnalysis',
  // 进空间
  inSpace = '/accessSpace/inSpace',
  // 出空间
  outSpace = '/accessSpace/outSpace',
  // 进详情
  userGetData = '/accessSpace/userGetData',
  // 获取确认数据
  getWaitConfirmData = '/accessSpace/getWaitConfirmData',
  spaceConfirm = '/accessSpace/confirm',
  // 整改查询
  workCheckList = '/workCheck/list/',
  // 整改提交
  workCheck = '/workCheck/reform',
  // 确认整改
  workCheckconfirm = '/workCheck/confirm',
  //延时续签查询历史数据
  delaySignHistory = '/workManage/selectDelay',
  //发起验收
  startAcceptance = '/workManage/acceptance',
  //结束作业
  finishWork = '/workManage/finishWork',
  //电工证号
  getElecCertNo = '/workExamine/certificationsCode',
  //完结验收
  completeAcceptance = '/workManage/finish',
  // 验收退回
  finishBack = '/workManage/finishBack',
  // 获取所有人员
  queryAllUserBackCombo = '/workApply/queryAllUserBackCombo', // '/sys/api/queryAllUserBackCombo'
  // 查询中信重工及EHS下人员
  queryTopRootUser = '/workApply/queryTopUser',
  // 作业申请-查询中委托项目负责人
  queryToDhUser = '/workApply/queryToDhUser',
  // 中心看火人
  queryLookFireUser = '/workApply/queryLookFireUser',
  queryDepartTreeSync = '/sys/sysDepart/queryDepartTreeSync',
  querySafetyUser = '/workApply/querySafetyUser',
  // 安全措施
  securityAdd = '/work/security/add',
  securityList = '/work/security/list',
  securityDel = '/work/security/delete',
  getWorkSecurityMeasuresByType = '/work/security/getWorkSecurityMeasuresByType',
  securityEdit = '/work/security/edit',
  getUserListByTeam = '/jn/common/getUserListByTeam',
  getUserListByRole = '/jn/common/getUserListByRole',
  getDepartTreeOnZg = '/jn/common/getDepartTreeOnZg',
  securityConfirmation = '/workManage/securityConfirmation',
  getWorkCheckList = '/workApply/getWorkCheckList',
  // 操作记录
  queryOperation = '/workManage/queryOperation',
  // 作业管理-记录操作步骤
  recordOperation = '/workManage/recordOperation',
  // 作业管理-查询确认操作步骤
  queryConfirmOperation = '/workManage/queryConfirmOperation',
  // 作业管理-操作步骤签名
  operationSign = '/workManage/operationSign',
  // 作业管理-查询作业票作业人员
  queryWorkUser = '/workManage/queryWorkUser',
  // 分厂安全员/消防员 角色用户
  queryFcUser = '/workApply/queryFcUser',

  // 获取点位图
  jnRiskBasePicture = '/riskControl/jnRiskBasePicture/queryByOrg',

  // 获取班组
  getTeamList = '/jn/common/getTeamList1',

  // 删除作业
  deleteManage = '/workManage/delete',

  // 获取包场人员
  contractorList = '/contractor/getList',
  contractorEdit = '/contractor/edit',
  // 变更监护人
  updateGuardian = '/workManage/updateGuardian',
  addWorkUser = '/workManage/addWorkUser',
  siheyiDeviceConfig = '/siheyiDeviceConfig/getlistByOrgCode',
  getDeviceData = '/work/api/getDeviceData',
  // 判断作业负责人是否有未完结作业
  queryIsHaveWork = '/workApply/queryIsHaveWork',
  // 转任务
  workTransferTask = '/workTransferTask',
}
//jn/common/getDepart  获取单位列表
// 相关方单位   若当前登陆人是以A04B12开头的默认选中当前登陆人的orgCode，置灰
// 人员/jn/common/getUser  参数departIds 传递单位的companyId
// 2接口都是get方式
//申请人
export const getApproval = (params) => {
  return defHttp.get({ url: Api.Approval, params });
};
export const getApprovalNew = (params) => {
  return defHttp.get({ url: Api.queryAllUserBackCombo, params });
};
// 查询中信重工及EHS下人员
export const queryTopRootUser = () => {
  return defHttp.get({ url: Api.queryTopRootUser });
};
//上传图片
export const uploadImg = Api.uploadImg;
//申请单位
export const getApplyForUnit = () => {
  return defHttp.get({ url: Api.applyForUnit });
};
//获取登录人组织二级
export const getLoginUserOrg = () => {
  return defHttp.get({ url: Api.getLoginUserOrg });
};
// 作业申请列表
export const getWorkApplyList = (params: searchJobList) => {
  return defHttp.get({ url: Api.WorkApplyList, params });
};
//作业人
export const getIdCode = (params) => {
  return defHttp.get({ url: Api.getIdCode, params });
};
// 作业等级类型
export const getGradeByType = (params: searchJobType) => {
  return defHttp.get({ url: Api.GradeByType, params });
};
// 作业类型
export const getJobType = () => {
  return defHttp.get({ url: Api.JobType });
};
// 删除作业
export const delJobList = (params) => {
  return defHttp.post({ url: Api.delJobList, params }, { joinParamsToUrl: true });
};
//批量删除作业
export const deleteWork = (params) => {
  return defHttp.post({ url: Api.deleteWork, params }, { joinParamsToUrl: true });
};
//作业查看详情
export const getWorkDetail = (workApplyId: string) => {
  return defHttp.get({ url: Api.WorkDetail, params: { workApplyId } });
};
//作业查看详情
export const getWorkJobWorkDetail = (workApplyId: string) => {
  return defHttp.get({ url: Api.workJobWorkDetail, params: { workApplyId } });
};
// 新增作业
export const addWork = (params: any) => {
  return defHttp.post({ url: Api.WorkAdd, params });
};
// 安全措施
export const getSafetyPrecautions = (params) => {
  return defHttp.get({ url: Api.safetyPrecautions, params });
};
// 保存作业
export const getKeepJob = (params: JobApplyForFrom) => {
  return defHttp.post({ url: Api.keepJob, params });
};
//修改作业
export const getModificationJob = (params) => {
  return defHttp.post({ url: Api.modificationJob, params });
};
//审批流程
export const getListByType = (params) => {
  return defHttp.get({ url: Api.getListByType, params });
};
// 获取其他特殊作业编号
export const getOtherWorkCode = (params) => {
  return defHttp.get({ url: Api.getOtherWorkCode, params });
};
//有限空间
export const getLimitSpace = (params) => {
  return defHttp.get({ url: Api.LimitSpace, params });
};
// 作业审批
export const getWorkExamineList = (params) => {
  return defHttp.get({ url: Api.workExamineList, params });
};
// 作业审批详情
export const getWorkExamineInfo = (params) => {
  return defHttp.get({ url: Api.workExamineInfo, params });
};
// 作业审批退回
export const getWorkExamineBack = (params) => {
  return defHttp.post({ url: Api.workExamineBack, params });
};
// 作业审批通过
export const getWorkExaminePass = (params) => {
  return defHttp.post({ url: Api.workExaminePass, params });
};
// 作业审批延时详情
export const getWorkExamineDelay = (params) => {
  return defHttp.get({ url: Api.workExamineDelay, params });
};
// 作业审批延时审批
export const getWorkExamineDelayApproval = (params) => {
  return defHttp.post({ url: Api.workExamineDelayApproval, params });
};
// 作业审批延时审批退回
export const getWorkExamineDelayBack = (params) => {
  return defHttp.post({ url: Api.workExamineDelayBack, params });
};
// 作业管理
export const getWorkManageList = (params) => {
  return defHttp.get({ url: Api.workManageList, params });
};
//导出作业
export const getDerive = (params) => defHttp.get({ url: Api.derive, params, responseType: 'blob' }, { isReturnNativeResponse: true });
// 开始作业
export const getStartWork = (params) => {
  return defHttp.post({ url: Api.startWork, params });
};
export const postStartWork = (params) => {
  return defHttp.post({ url: Api.startWork, params });
};
// 延时续签
export const getDelaySign = (params) => {
  return defHttp.post({ url: Api.delaySign, params });
};
//延时续签查询历史数据
export const getDelaySignHistory = (params) => {
  return defHttp.get({ url: Api.delaySignHistory, params });
};
// 作业中断
export const getInterruptWork = (params) => {
  return defHttp.post({ url: Api.interruptWork, params });
};
// 作业继续
export const getContinueWork = (params) => {
  return defHttp.get({ url: Api.continueWork, params });
};
// 发起验收
export const getStartAcceptance = (params) => {
  return defHttp.get({ url: Api.startAcceptance, params });
};
// 结束作业
export const finishWork = (params) => {
  return defHttp.get({ url: Api.finishWork, params });
};
// 作业完成
export const getCompleteWork = (params) => {
  return defHttp.post({ url: Api.completeWork, params });
};
//添加分析
export const getAddAnalysis = (params) => {
  return defHttp.post({ url: Api.addAnalysis, params });
};
// 进空间
export const inSpace = (params) => {
  return defHttp.post({ url: Api.inSpace, params });
};
export const outSpace = (params) => {
  return defHttp.post({ url: Api.outSpace, params });
};
export const userGetData = (params) => {
  return defHttp.get({ url: Api.userGetData, params });
};
export const getWaitConfirmData = (params) => {
  return defHttp.get({ url: Api.getWaitConfirmData, params });
};
export const spaceConfirm = (params) => {
  return defHttp.post({ url: Api.spaceConfirm, params });
};
export const workCheckList = (params) => {
  return defHttp.get({ url: Api.workCheckList + params.type, params });
};
export const queryOperation = (params) => {
  return defHttp.get({ url: Api.queryOperation, params });
};
export const recordOperation = (params) => {
  return defHttp.post({ url: Api.recordOperation, params });
};
export const queryConfirmOperation = (params) => {
  return defHttp.get({ url: Api.queryConfirmOperation, params });
};
export const operationSign = (params) => {
  return defHttp.post({ url: Api.operationSign, params });
};
export const queryWorkUser = (params) => {
  return defHttp.get({ url: Api.queryWorkUser, params });
};
export const workCheck = (params) => {
  return defHttp.post({ url: Api.workCheck, params });
};
export const workCheckconfirm = (params) => {
  return defHttp.post({ url: Api.workCheckconfirm, params });
};
//电工证号
export const getElecCertNo = () => {
  return defHttp.post({ url: Api.getElecCertNo });
};
//完结验收
export const getCompleteAcceptance = (params) => {
  return defHttp.post({ url: Api.completeAcceptance, params });
};
//验收退回
export const finishBack = (params) => {
  return defHttp.post({ url: Api.finishBack, params });
};
// 作业申请-查询中委托项目负责人
export const queryToDhUser = () => {
  return defHttp.get({ url: Api.queryToDhUser });
};

// 作业申请-查询中委托项目负责人
export const queryLookFireUser = () => {
  return defHttp.get({ url: Api.queryLookFireUser });
};

/**
 * 获取部门树列表
 */
export const queryDepartTreeSync = (params?) => defHttp.get({ url: Api.queryDepartTreeSync, params });

export const querySafetyUser = (params) => defHttp.get({ url: Api.querySafetyUser, params });

// 添加安全措施
export const securityAdd = (params) => {
  return defHttp.post({ url: Api.securityAdd, params });
};
export const securityList = (params) => {
  return defHttp.get({ url: Api.securityList, params });
};
export const securityDel = (params) => {
  return defHttp.post({ url: Api.securityDel, params });
};
export const getWorkSecurityMeasuresByType = (params) => {
  return defHttp.get({ url: Api.getWorkSecurityMeasuresByType, params });
};
export const securityEdit = (params) => {
  return defHttp.post({ url: Api.securityEdit, params });
};
export const getUserListByTeam = (params) => {
  return defHttp.get({ url: Api.getUserListByTeam, params });
};
export const getUserListByRole = (params) => {
  return defHttp.get({ url: Api.getUserListByRole, params });
};
export const getDepartTreeOnZg = () => {
  return defHttp.get({ url: Api.getDepartTreeOnZg });
};
export const securityConfirmation = (params) => {
  return defHttp.post({ url: Api.securityConfirmation, params });
};
export const getWorkCheckList = (params) => {
  return defHttp.get({ url: Api.getWorkCheckList, params });
};
export const queryFcUser = () => {
  return defHttp.get({ url: Api.queryFcUser });
};
export const jnRiskBasePicture = (params) => {
  return defHttp.get({ url: Api.jnRiskBasePicture, params });
};
/**
 * 获取班组
 */
export const getTeamList = (params) => {
  return defHttp.get({ url: Api.getTeamList, params });
};
// 获取车间
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};

// 车间角色 过滤人
export const getUserListByOrgAndRole = (params) => {
  return defHttp.get({ url: '/jn/common/getUserListByOrgAndRole', params });
};

export const deleteManage = (params) => {
  return defHttp.get({ url: Api.deleteManage, params });
};

// 作业报表
export const getWorkReport = (params) => {
  return defHttp.get({ url: '/workStatistics/workReport', params });
};
// 报表明细
export const workReportDetails = (params) => {
  return defHttp.get({ url: '/workStatistics/workReportDetails', params });
};
export const contractorList = () => {
  return defHttp.get({ url: Api.contractorList });
};
export const contractorEdit = (params) => {
  return defHttp.post({ url: Api.contractorEdit, params });
};
export const updateGuardian = (params) => {
  return defHttp.post({ url: Api.updateGuardian, params });
};
export const addWorkUser = (params) => {
  return defHttp.post({ url: Api.addWorkUser, params });
};
// 四合一
export const siheyiDeviceConfig = (params) => {
  return defHttp.get({ url: Api.siheyiDeviceConfig, params });
};
export const getDeviceData = (params) => {
  return defHttp.get({ url: Api.getDeviceData, params });
};
export const queryIsHaveWork = (params) => {
  return defHttp.get({ url: Api.queryIsHaveWork, params });
};
// 转任务
export const workTransferTask = (params) => {
  return defHttp.post({ url: Api.workTransferTask, params });
};
// 获取布控球列表
export const getList = (params) => {
  return defHttp.get({ url: '/dk/dkBallCamera/getList', params });
};
// 获取布控球地址
export const getUrl = (params) => {
  return defHttp.get({ url: '/dk/dkBallCamera/getUrl', params }, { isTransformResponse: false });
};
