import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/pageList', params });
};
export const del = (params) => {
  return defHttp.post({ url: '/eduSurveyQues/delete', params });
};
export const getSurveyQues = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/getSurveyQues', params });
};
export const submitSurveyQues = (data) => {
  return defHttp.post({ url: '/eduSurveyQues/submitSurveyQues', data });
};
// 编辑
export const add = (data) => {
  return defHttp.post({ url: '/eduSurveyQues/add', data });
};
// 手动同步
export const detail = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/detail', params});
};
// 详情
export const edit = (data) => {
  return defHttp.post({ url: '/eduSurveyQues/edit', data });
};
export const queryAnswerList = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/queryAnswerList', params });
};
export const queryUnAnswerList = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/queryUnAnswerList', params });
};
export const send = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/send', params });
};
export const statistics = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/statistics', params });
};
export const exportPdf = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/export', params });
};
