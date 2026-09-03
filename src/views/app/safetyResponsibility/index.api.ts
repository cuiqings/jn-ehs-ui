import { defHttp } from '/@/utils/http/axios';
const Api = {
  list: '/performDuties/listPage', // 列表
  detail: '/performDuties/getFillContent', // 详情
  submit: '/performDuties/fill', // 填报
};
export const getList = (params) => defHttp.get({ url: Api.list, params });
export const getFillDetail = (params) => defHttp.get({ url: Api.detail, params });
export const submitFill = (params) => defHttp.post({ url: Api.submit, params });
