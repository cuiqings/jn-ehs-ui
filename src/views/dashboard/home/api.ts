import { defHttp } from '/@/utils/http/axios';

enum Api {
  trainingStatistics = '/edu/statistics/getHomeData',
  dangerousWorkStatistics = '/workStatistics/home',
  reportRate = '/workStatistics/getReportRate',
  inspectionStatistics = '/yh/skYhStatistics/statistics18',
  rectificationStatistics = '/yh/skYhStatistics/statistics19',
  // 新增：保存首页备注接口路径
  saveHomeRemark = '/moduleNotes/saveOrEdit',
  // 新增：查询首页备注接口路径
  homeTypeRemark = '/moduleNotes/getInfo',
  rectificationStatistics1 = '/yh/skYhStatistics/statistics20',
  rectificationStatistics2 = '/yh/skYhStatistics/statistics21',
  rectificationStatistics3 = '/yh/skYhStatistics/statistics22',
  // 新增：任务下发统计接口路径
  taskIssueStatistics = '/edu/statistics/getIssueRate',
  issueRateRangeSave = '/yh/skYhStatistics/setProblemRateRange',
  issueRateRangeGet = '/yh/skYhStatistics/getProblemRateRange',
  // 人员资质证书接口
  staffCertifications1 = '/jnStaffCertifications/statistics2',
  staffCertifications2 = '/jnStaffCertifications/statistics3',
  staffCertifications3 = '/jnStaffCertifications/statistics4',
  setCertifications3 = '/jnStaffCertifications/statistics4set',
  // 煤气报警接口
  gasAlarmStatistics = '/coalGas/getCompanyAlarmTypeAndTaskStatistics',
  // 相关方管理 - 在厂项目统计
  relatedPartyProjectSummary = '/xgf/statistics/statistics5',
  relatedPartyProjectList = '/xgf/statistics/statistics6',
  // 相关方管理 - 在厂人员统计
  relatedPartyPersonnelSummary = '/xgf/statistics/statistics7',
  relatedPartyPersonnelList = '/xgf/statistics/statistics8',
  // 职业健康接口
  occupationalHealth1 = '/health/statistics/orgFinishRate',
  occupationalHealth2 = '/health/statistics/physicalExaminationFinishRate',
  occupationalHealth3 = '/health/statistics/receiptHarmfulFactorsProportion',
  occupationalHealth4 = '/health/statistics/harmfulFactors',
  factorOrgCodeList = '/health/statistics/getDepart',
  // 安全标准化
  safetyStandardChart = '/ss/ssStandardReview/statistics1',
  // 新增：安全标准化表格数据接口路径
  safetyStandardTable = '/ss/ssUnitEvaluate/statistics1',
  // 新增：安全标准化合格率统计
  safetyStandardPassRate = '/ss/ssStandardReview/statistics2',
  // 新增：安全标准化问题分布统计
  safetyStandardIssueDist = '/ss/ssStandardReview/statistics3',
  // 查询最近的评审完成的事业部
  findLatestOrg = '/ss/ssStandardReview/findLatest',
  // 新增：安全标准化事业部下拉新接口
  safetyStandardOrgCodeList = '/jn/common/getBusinessDepartList4',
  // 班前会管理
  preDutyReviewStatistics = '/jysectionmanagement/upPreShift/statistics1',
  // 设备设施
  equipmentStatusStatistics = '/dev/devLedger/statistics1',
  equipmentCheckStatistics = '/dev/devDehydratorTask/statistics1',
  // 应急管理
  taskNumList = '/yjStatistics/taskNumList',
  overdueList = '/yjStatistics/overdueList',
  overdueNotList = '/yjStatistics/overdueNotList',
  // 安全生产投入
  totalStatistics = '/trStatistics/getTrStatistics',
  compareDeptStatistics = '/trStatistics/getTrStatisticsByDept',
  deptInvestStatistics = '/trStatistics/getTrStatisticsByDeptProject',
  // 安全生产责任制
  safetyDutyStatistics = '/homeStatistics/statistics',
}

/**
 * 年度安全教育再培训统计数据
 * @param params
 */
export const getTrainingStatistics = (params) => defHttp.get({ url: Api.trainingStatistics, params }, { isTransformResponse: false });

/**
 * 高危作业统计数据
 * @param params
 */
export const getDangerousWorkStatistics = (params) => defHttp.get({ url: Api.dangerousWorkStatistics, params }, { isTransformResponse: false });

/**
 * 各事业部作业报备率排名
 * @param params
 */
export const getReportRate = (params) => defHttp.get({ url: Api.reportRate, params }, { isTransformResponse: false });

/**
 * 隐患排查完成情况统计数据
 * @param params
 */
export const getInspectionStatistics = (params) => defHttp.get({ url: Api.inspectionStatistics, params }, { isTransformResponse: false });

/**
 * 隐患整改情况统计数据
 * @param params
 */
export const getRectificationStatistics = (params) => defHttp.get({ url: Api.rectificationStatistics, params }, { isTransformResponse: false });

/**
 * 保存首页备注
 * @param params 包含模块标识、时间范围及备注内容
 * @returns Promise<any>
 */
export const saveHomeRemark = (params) => defHttp.post({ url: Api.saveHomeRemark, params });

/**
 * 查询首页备注
 * @param params 包含模块标识、时间范围
 * @returns Promise<any>
 */
export const getHomeTypeRemark = (params) => defHttp.get({ url: Api.homeTypeRemark, params });
export const getRectificationStatistics1 = (params) => defHttp.get({ url: Api.rectificationStatistics1, params });
export const getRectificationStatistics2 = (params) => defHttp.get({ url: Api.rectificationStatistics2, params });
export const getRectificationStatistics3 = (params) => defHttp.get({ url: Api.rectificationStatistics3, params });

/**
 * 任务下发统计数据
 * @param params 包含时间范围
 * @returns Promise<any>
 */
export const getTaskIssueStatistics = (params) => defHttp.get({ url: Api.taskIssueStatistics, params });

// 查询13个事业部下的布控球
export const getBkq = () => {
  return defHttp.get({ url: '/workStatistics/getBkq' });
};
// 根据布控球查询作业
export const getBkqWork = (params) => {
  return defHttp.get({ url: '/workStatistics/getBkqWork', params });
};

export const saveIssueRateRange = (params) => defHttp.post({ url: Api.issueRateRangeSave, params });
/**
 * 查询问题发现率范围
 * @param params
 * @returns Promise<any>
 */
export const getIssueRateRange = () => defHttp.get({ url: Api.issueRateRangeGet });

/**
 * 人员资质证书统计数据
 * @param params
 */
export const getStaffCertifications1 = () => defHttp.get({ url: Api.staffCertifications1 });
export const getStaffCertifications2 = () => defHttp.get({ url: Api.staffCertifications2 });
export const getStaffCertifications3 = () => defHttp.get({ url: Api.staffCertifications3 });
export const setStaffCertifications3 = (params) => defHttp.post({ url: Api.setCertifications3, params });
/**
 * 煤气报警统计数据
 * @param params
 */
export const getGasAlarmStatistics = (params) => defHttp.get({ url: Api.gasAlarmStatistics, params });

/**
 * 获取在厂项目统计-概览数据
 * @param params
 */
export const getRelatedPartyProjectSummary = (params?) => defHttp.get({ url: Api.relatedPartyProjectSummary, params });

/**
 * 获取在厂项目统计-列表数据
 * @param params
 */
export const getRelatedPartyProjectList = (params?) => defHttp.get({ url: Api.relatedPartyProjectList, params });

/**
 * 获取在厂人员统计-概览数据
 * @param params
 */
export const getRelatedPartyPersonnelSummary = (params?) => defHttp.get({ url: Api.relatedPartyPersonnelSummary, params });

/**
 * 获取在厂人员统计-列表数据 (用于图表)
 * @param params
 */
export const getRelatedPartyPersonnelList = (params?) => defHttp.get({ url: Api.relatedPartyPersonnelList, params });

/**
 * 职业健康统计数据
 * @param params
 */
export const getOccupationalHealth1 = (params) => defHttp.get({ url: Api.occupationalHealth1, params });
export const getOccupationalHealth2 = (params?) => defHttp.get({ url: Api.occupationalHealth2, params });
export const getOccupationalHealth3 = (params?) => defHttp.get({ url: Api.occupationalHealth3, params });
export const getOccupationalHealth4 = (params) => defHttp.get({ url: Api.occupationalHealth4, params });
export const getFactorOrgCodeList = () => defHttp.get({ url: Api.factorOrgCodeList });

/**
 * 安全标准化-图表数据
 * @param params
 */
export const getSafetyStandardChart = () => defHttp.get({ url: Api.safetyStandardChart });

/**
 * 安全标准化-表格数据
 * @param params
 */
export const getSafetyStandardTable = (params) => defHttp.get({ url: Api.safetyStandardTable, params });

/**
 * 安全标准化-合格率统计
 * @param params
 */
export const getSafetyStandardPassRate = (params?) => defHttp.get({ url: Api.safetyStandardPassRate, params });

/**
 * 安全标准化-问题分布统计
 * @param params
 */
export const getSafetyStandardIssueDist = (params?) => defHttp.get({ url: Api.safetyStandardIssueDist, params });

/**
 * 查询最近的评审完成的事业部
 * @param params
 */
export const getLatestOrg = () => defHttp.get({ url: Api.findLatestOrg });

/**
 * 新增：安全标准化事业部下拉新接口
 * @param params
 */
export const getSafetyStandardOrgCodeList = () => defHttp.get({ url: Api.safetyStandardOrgCodeList });
/**
 * 班前会管理-统计数据
 * @param params
 */
export const getPreDutyReviewStatistics = (params?) => defHttp.get({ url: Api.preDutyReviewStatistics, params });
/**
 * 设备设施-设备状态统计数据
 * @param params
 */
export const getEquipmentStatusStatistics = (params?) => defHttp.get({ url: Api.equipmentStatusStatistics, params });
/**
 * 设备设施-设备检查统计数据
 * @param params
 */
export const getEquipmentCheckStatistics = (params?) => defHttp.get({ url: Api.equipmentCheckStatistics, params });
/**
 * 应急管理-任务下发统计数据
 * @param params
 */
export const getTaskNumList = (params?) => defHttp.get({ url: Api.taskNumList, params });
/**
 * 应急管理-逾期任务统计数据
 * @param params
 */
export const getOverdueList = (params?) => defHttp.get({ url: Api.overdueList, params });
/**
 * 应急管理-未逾期任务统计数据
 * @param params
 */
export const getOverdueNotList = (params?) => defHttp.get({ url: Api.overdueNotList, params });
/**
 * 安全生产投入-总统计数据
 * @param params
 */
export const getTotalStatistics = (params?) => defHttp.get({ url: Api.totalStatistics, params });
/**
 * 安全生产投入-部门对比统计数据
 * @param params
 */
export const getCompareDeptStatistics = (params?) => defHttp.get({ url: Api.compareDeptStatistics, params });
/**
 * 安全生产投入-部门项目统计数据
 * @param params
 */
export const getDeptInvestStatistics = (params?) => defHttp.get({ url: Api.deptInvestStatistics, params });
/**
 * 安全生产责任制-统计数据
 * @param params
 */
export const getSafetyDutyStatistics = (params?) => defHttp.get({ url: Api.safetyDutyStatistics, params });










