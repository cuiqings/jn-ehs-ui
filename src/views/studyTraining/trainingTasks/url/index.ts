import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/edu/trainTask/pageList', params });
};
// 删除
export const del = (params) => {
  return defHttp.post({ url: '/edu/trainTask/delete', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/edu/trainTask/add', data });
};
// 详情
export const queryById = (id) => {
  return defHttp.get({ url: `/edu/trainTask/getInfo/${id}` });
};
export const orgList = (params) => {
  return defHttp.get({ url: '/sys/common/orgList', params });
};
// 培训计划
export const getPlanList = () => {
  return defHttp.get({ url: '/edu/trainPlan/getPlanList' });
};
// 培训项目
export const getProjectList = (params) => {
  return defHttp.get({ url: '/edu/trainProject/getProjectList', params });
};
// 类型
export const loadTreeData = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
// 获取分类树
export const loadTreeRoot = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
// 查试卷
export const getExamPaper = (params) => {
  return defHttp.get({ url: '/edu/examPaper/pageList', params });
};
// 培训详情
export const trainInfo = (params) => {
  return defHttp.get({ url: '/edu/trainTask/trainInfo', params });
};
// 培训详情统计
export const infoStatistics = (params) => {
  return defHttp.get({ url: '/edu/trainTask/infoStatistics', params });
};
// 明细
export const details = (params) => {
  return defHttp.get({ url: '/edu/trainTask/details', params });
};
// 考试详情
export const examRecord = (params) => {
  return defHttp.get({ url: '/edu/trainTask/examRecord', params });
};
// 判断任务是否进行中
export const queryUserToTask = (params) => {
  return defHttp.get({ url: '/edu/trainTask/queryUserToTask', params });
};
// 删除任务学员
export const deleteTrainUser = (data) => {
  return defHttp.post({ url: '/edu/trainTask/deleteTrainUser', data });
};
// 更新任务学员状态
export const updateTrainUser = (data) => {
  return defHttp.post({ url: '/edu/trainTask/updateUserTrainStatus', data });
};
// 查询任务评审
export const getTrainVettingList = (params) => {
  return defHttp.get({ url: '/edu/trainTask/getTrainVettingList', params });
};
// 下载记录
export const downloadRecord = (params) => {
  return defHttp.get({ url: '/edu/trainTask/downloadRecord', params, responseType: 'blob' }, { isTransformResponse: false });
};
// 保存
export const save = (data) => {
  return defHttp.post({ url: '/edu/trainTask/save', data });
};
// 查询保存
export const draft = (id) => {
  return defHttp.get({ url: `/edu/trainTask/continueCreate/${id}` });
};
// 查询任务名称
export const queryTaskName = (data) => {
  return defHttp.post({ url: '/edu/trainTask/queryTaskName', data }, { isTransformResponse: false });
};
// 新增人员
export const addTrainUser = (data) => {
  return defHttp.post({ url: '/edu/trainTask/addTrainUser', data });
};
// 下载试卷
export const downloadExam = (params) => {
  return defHttp.get({ url: '/edu/trainTask/downloadExam', params, responseType: 'blob' }, { isTransformResponse: false });
};
// 允许开始考试
export const allowUserExam = (data) => {
  return defHttp.post({ url: '/edu/trainTask/allowUserExam', data });
};
// 后门接口
export const backDoor = (data) => {
  return defHttp.post({ url: '/edu/trainTask/backDoor', data });
};

