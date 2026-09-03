import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/pageList2', params });
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
export const queryAnswerInfo = (params) => {
  return defHttp.get({ url: '/eduSurveyQues/queryAnswerInfo', params });
};
