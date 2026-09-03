import { defHttp } from '/@/utils/http/axios';
export const studylist = (params) => {
  return defHttp.get({ url: '/edu/autoPractise/getList/' + params });
};
export const studylist23 = (params) => {
  return defHttp.get({ url: '/edu/autoPractise/getListType23/' + params });
};
// 获取考试内容
export const getExamContent = (params) => {
  return defHttp.get({ url: `/edu/autoPractise/startExam`, params });
};
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/edit', data });
};
export const del = (data) => {
  return defHttp.post({ url: '/edu/employeeEntry/delete', data });
};
// 类型统计
export const typeStatistics = () => {
  return defHttp.get({ url: '/edu/employeeEntry/status/statistics' });
};
// 在用状态统计
export const statistics = () => {
  return defHttp.get({ url: '/edu/employeeEntry/statistics' });
};
// 获取练习明细
export const getExamInfo = (params) => {
  return defHttp.get({ url: `/edu/autoPractise/getExamInfo/${params}` });
};
// 每日统计
export const dailyStatistics = () => {
  return defHttp.get({ url: '/edu/autoPractise/statistics' });
};
// 详情
export const getDetail = (params) => {
  return defHttp.get({ url: `/edu/autoPractise/details`, params });
};
// 获取视频
export const getVideo = (params) => {
  return defHttp.get({ url: `/edu/autoPractise/preview/${params}` });
};
// 添加学习时长
export const addDuration = (data) => {
  return defHttp.post({ url: `/edu/autoPractise/addDuration`, data });
};

// 获取题库
export const getQuestionBank = (params) => {
  return defHttp.get({ url: `/edu/autoBrushQuestion/getQuestionBank`, params });
};
// 开始答题
export const startExam = (params) => {
  return defHttp.get({ url: `/edu/autoBrushQuestion/startAnswer`, params });
};
// 提交答题
export const submitExamApi = (data) => {
  return defHttp.post({ url: `/edu/autoBrushQuestion/endAnswer`, data });
};
// 单题判卷
export const onceAnswerApi = (data) => {
  return defHttp.post({ url: `/edu/autoBrushQuestion/onceAnswer`, data });
};
// 自主刷题列表
export const autoBrushQuestionList = (params) => {
  return defHttp.get({ url: `/edu/autoBrushQuestion/pageList`, params });
};
// 查询上次配置
export const getLastConfig = () => {
  return defHttp.get({ url: `/edu/autoBrushQuestion/getLastConfig` });
};
// 答题详情
export const getExamReult = (params) => {
  return defHttp.get({ url: `/edu/autoBrushQuestion/detail`, params });
}
