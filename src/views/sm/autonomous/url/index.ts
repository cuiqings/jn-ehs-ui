import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/xgf/xgfSelfManage/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/xgf/xgfSelfManage/add', data });
};
// 检查
export const edit = (data) => {
  return defHttp.post({ url: '/xgf/xgfSelfManage/edit', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/xgf/xgfSelfManage/delete', params }, { joinParamsToUrl: true });
};
// 根据相关方名称获取项目列表
export const getEnterList = (params) => {
  return defHttp.get({ url: '/xgf/xgfSelfManage/getEnterList', params });
};
// 整改
export const repair = (data) => {
  return defHttp.post({ url: '/xgf/xgfSelfManage/repair', data });
};
// 验收
export const check = (data) => {
  return defHttp.post({ url: '/xgf/xgfSelfManage/check', data });
};
// 查看
export const queryById = (params) => {
  return defHttp.get({ url: '/xgf/xgfSelfManage/queryById', params });
};
// 人员考核列表
export const getExaminePage = (params) => {
  return defHttp.get({ url: '/xgf/xgfPerson/getExaminePage', params });
};
// 人员考核删除
export const deleteExamine = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/deleteExamine', data }, { joinParamsToUrl: true });
};
// 人员考核编辑
export const editExamine = (data) => {
  return defHttp.post({ url: '/xgf/xgfPerson/editExamine', data });
};
