import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 综合安全指数
  safetyIndex = '/ehs/cockpit2/safetyIndex',
  // KPI数据
  kpiData = '/ehs/cockpit2/kpiData',
  // 各单位安全得分排名
  rankList = '/ehs/cockpit2/rankList',
  // 关键数据
  keyData = '/ehs/cockpit2/keyData',
  // 今日危险作业
  dangerWorkList = '/ehs/cockpit2/dangerWorkList',
  // 安全文化宣传
  cultureList = '/ehs/cockpit2/cultureList',
  // 重大危险源
  hazardList = '/ehs/cockpit2/hazardList',
  // 安全提示/理念/预警
  marqueeData = '/ehs/cockpit2/marqueeData',
}

/** 综合安全指数 */
export const getSafetyIndex = (params?: any) => defHttp.get({ url: Api.safetyIndex, params });

/** KPI数据 */
export const getKpiData = (params?: any) => defHttp.get({ url: Api.kpiData, params });

/** 各单位安全得分排名 */
export const getRankList = (params?: any) => defHttp.get({ url: Api.rankList, params });

/** 关键数据 */
export const getKeyData = (params?: any) => defHttp.get({ url: Api.keyData, params });

/** 今日危险作业 */
export const getDangerWorkList = (params?: any) => defHttp.get({ url: Api.dangerWorkList, params });

/** 安全文化宣传 */
export const getCultureList = (params?: any) => defHttp.get({ url: Api.cultureList, params });

/** 重大危险源 */
export const getHazardList = (params?: any) => defHttp.get({ url: Api.hazardList, params });

/** 安全提示/理念/预警 */
export const getMarqueeData = (params?: any) => defHttp.get({ url: Api.marqueeData, params });
