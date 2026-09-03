import { defHttp } from '/@/utils/http/axios';
// 风险等级分布
export const gradeDistribution = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics16', params });
};
// 各部门风险分布
export const statistics17 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics17', params });
};
// 各单位发现隐患
export const statistics6 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics6', params });
};
// 各部门巡检计划与执行结果
export const plansOrResults = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics14', params });
};
// 各部门隐患治理情况
export const statistics5 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics5', params });
};
// 隐患分类统计
export const statistics7 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics7', params });
};
// 所属机构
export const getDepartTreeFor23 = () => {
  return defHttp.get({ url: '/jn/common/getDepartTreeFor23' });
};

// 隐患排查计划
export const skYhStatistics1 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics1', params });
};

//发现隐患
export const skYhStatistics2 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics2', params });
};

//隐患治理
export const skYhStatistics3 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics3', params });
};

export const getDepartTreeBy12 = () => defHttp.get({ url: '/jn/common/getDepartTreeBy12' });

export const getDepart3List = (params) => defHttp.get({ url: '/jn/common/getDepart3List', params });

// 风险点
export const statistics15 = (params) => {
  return defHttp.get({ url: '/yh/skYhStatistics/statistics15', params });
};

// 风险区域
export const riskAreaNum = (params) => {
  return defHttp.get({ url: '/risk/riskLevelOrg/riskAreaNum', params });
};

// 是否安全主管部门
export const ifSecurityByOrg = () => {
  return defHttp.get({ url: '/jn/common/ifSecurityByOrg' });
};
