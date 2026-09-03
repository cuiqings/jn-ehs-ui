import { defHttp } from '/@/utils/http/axios';
export const pageList = (params) => {
  return defHttp.get({ url: '/alarmRecordTask/pageList', params });
};
export const handle = (params) => {
  return defHttp.post({ url: '/alarmRecordTask/handle', params });
};
export const detail = (params) => {
  return defHttp.get({ url: '/alarmRecordTask/detail', params });
};
