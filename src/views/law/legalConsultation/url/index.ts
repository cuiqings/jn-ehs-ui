import { defHttp } from '/@/utils/http/axios';
// 历史
export const getHistory = () => {
  return defHttp.get({ url: '/law/legalConsultation/getHistory' });
};
// 添加历史
export const addHistory = (data) => {
  return defHttp.post({ url: '/law/legalConsultation/addHistory', data });
};
export const getHistoryById = (params) => {
  return defHttp.get({ url: '/law/legalConsultation/getHistoryById', params });
};
// 文件详情
export const fileDetails = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/queryById', params });
};
// 获取大模型token
export const aiGetToken = () => {
  return defHttp.get({ url: '/law/legalConsultation/getToken' });
};
