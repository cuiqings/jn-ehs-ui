import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/edu/lecturer/pageList', params });
};
// 讲师明细
export const lecturerDetail = (params) => {
  return defHttp.get({ url: '/edu/lecturer/info/' + params.id });
};
// 讲师评分详情
export const lecturerScoreDetail = (params) => {
  return defHttp.get({ url: '/edu/lecturer/scoreInfo', params });
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
  return defHttp.post({ url: '/edu/lecturer/add', data });
};
// 修改
export const edit = (params) => {
  return defHttp.post({ url: '/edu/lecturer/edit/' + params.id, params });
};
export const del = (data) => {
  return defHttp.get({ url: '/edu/lecturer/delete/' + data.id });
};
// 批量删除
export const delBatch = (params) => {
  return defHttp.get({ url: '/edu/lecturer/batchDelete', params });
};
// 查询试卷配置
export const getExamConfig = (id) => {
  return defHttp.get({ url: '/edu/examTask/getExamConfig/' + id });
};
// 获取分类树
export const loadTreeRoot = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
// 查试卷
export const getExamPaper = (params) => {
  return defHttp.get({ url: '/edu/examPaper/pageList', params });
}
// 任务详情 
export const getInfo = (id) => {
  return defHttp.get({ url: '/edu/examTask/getInfo/'+id });
}

// 证书列表
export const certificateList = (params) => {
  return defHttp.get({ url: '/edu/cert/pageList', params });
}

// 统计
export const statistics = (id) => {
  return defHttp.get({ url: `/edu/examTask/statistics/${id}` });
}
// 明细 
export const examDetails = (params) => {
  return defHttp.get({ url: '/edu/examTask/details', params });
};
// 考试记录
export const examRecord = (params) => {
  return defHttp.get({ url: '/edu/examTask/examRecord', params });
}
// 评分详情
export const scoreDetail = (params) => {
  return defHttp.get({ url: '/edu/lecturer/scoreInfo', params });
}

