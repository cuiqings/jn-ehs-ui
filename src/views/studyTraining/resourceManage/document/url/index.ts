import { defHttp } from '/@/utils/http/axios';
// 设置文档时长
export const setDuration = (data) => {
  return defHttp.post({ url: '/edu/resource/setDuration', data });
};
