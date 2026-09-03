import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/lb/lbSupplyRelation/list', params });
};
export const bringOut = (params) => {
  return defHttp.get({ url: '/lb/lbSupplyRelation/bringOut', params });
};
export const edit = (data) => {
  return defHttp.post({ url: '/lb/lbSupplyRelation/edit', data });
};
// 查询单位下的物料列表
export const getListByOrg = () => {
  return defHttp.get({ url: '/lb/lbSupply/getListByOrg' });
};
