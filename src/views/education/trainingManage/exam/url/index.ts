import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/edu/examTask/pageList', params });
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
  return defHttp.post({ url: '/edu/examTask/add', data });
};
// 修改
export const edit = (data) => {
  return defHttp.post({ url: '/edu/examTask/edit', data });
};
export const del = (data) => {
  return defHttp.post({ url: '/edu/examTask/delete', data });
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

export const delUser = (data) => {
  return defHttp.post({ url: '/edu/examTask/delUser', data });
}

// 添加人员
export const addUser = (data) => {
  return defHttp.post({ url: '/edu/examTask/addUser', data });
}

// 查询三级单位（含安全部门）
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
