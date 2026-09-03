import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/dk/dkBallCamera/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/dk/dkBallCamera/add', data });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/dk/dkBallCamera/edit', data });
};
