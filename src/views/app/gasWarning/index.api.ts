import { defHttp } from '/@/utils/http/axios';
export const detail = (params) => {
  return defHttp.get({ url: '/alarmRecordTask/detail', params });
};
export const handle = (params) => {
  return defHttp.post({ url: '/alarmRecordTask/handle', params });
};
