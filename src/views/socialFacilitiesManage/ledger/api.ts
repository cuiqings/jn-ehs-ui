import { defHttp } from '/@/utils/http/axios';
// 列表
export const list = (params) => {
  return defHttp.get({ url: '/dev/devLedger/list', params });
};
// 新增
export const add = (data) => {
  return defHttp.post({ url: '/dev/devLedger/add', data });
};
// 编辑
export const edit = (data) => {
  return defHttp.post({ url: '/dev/devLedger/edit', data });
};
// 删除
export const del = (params) => {
  return defHttp.get({ url: '/dev/devLedger/delete', params });
};
// 批量删除
export const batchDel = (params) => {
  return defHttp.get({ url: '/dev/devLedger/deleteBatch', params });
};
// 详情
export const detail = (params) => {
  return defHttp.get({ url: '/dev/devLedger/queryById', params });
};
// 检验
export const check = (data) => {
  return defHttp.post({ url: '/dev/devLedger/check', data });
};
// 统计检验即将到期、超期未检验
export const statisticsOvertime = () => {
  return defHttp.get({ url: '/dev/devLedger/statisticsOvertime' });
};
// 各事业部能源隔离点位台账统计
export const statisticsBusinessDepart = (params) => {
  return defHttp.get({ url: '/dev/devLedger/statisticsBusinessDepart', params });
};
// 查询各类型数量
export const statisticsCount = () => {
  return defHttp.get({ url: '/dev/devLedger/statisticsCount' });
};
// 查询消防设备台账/煤防报警器材台账下各类型的数量
export const statisticsSubCount = (params) => {
  return defHttp.get({ url: '/dev/devLedger/statisticsSubCount', params });
};
