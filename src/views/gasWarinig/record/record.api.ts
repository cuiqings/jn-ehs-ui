import { defHttp } from '/@/utils/http/axios';
export const getGasWarningRecordList = (params) => {
  return defHttp.get({ url: '/coalGas/pageList', params });
};
