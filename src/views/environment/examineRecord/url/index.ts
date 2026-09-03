import { defHttp } from '/@/utils/http/axios';
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckRecord/list', params });
};
// 列表header个数显示
export const getNum = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckRecord/getNum', params });
};
// 详情
export const queryByPlanId = (params) => {
  return defHttp.get({ url: '/environmental/jnEnvironmentalCheckRecord/queryByPlanId', params });
};
