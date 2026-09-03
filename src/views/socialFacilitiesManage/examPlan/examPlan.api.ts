import { defHttp } from '/@/utils/http/axios';

/**
 * 考试计划列表查询
 * @param params 查询参数
 */
export const getExamPlanList = (params: any) => {
  return defHttp.get({ url: '/dev/devThirdPartyPlan/list', params });
};

/**
 * 获取考试计划详情
 * @param params 查询参数
 */
export const getExamPlanDetail = (params: any) => {
  return defHttp.get({ url: '/dev/devThirdPartyPlan/getDetailByDeptId', params });
};

/**
 * 获取考试计划审批数据
 * @param params 查询参数
 */
export const getExamPlanApprover = (params: any) => {
  return defHttp.get({ url: '/dev/devThirdPartyPlan/getJyCloudByPlanId', params });
};