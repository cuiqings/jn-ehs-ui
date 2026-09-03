import { defHttp } from '/@/utils/http/axios';

enum appApi {
  list = '/jnStaffCertifications/list',
}

// 人员列表
export const uerList = (params) => {
  return defHttp.get({ url: appApi.list, params });
};
