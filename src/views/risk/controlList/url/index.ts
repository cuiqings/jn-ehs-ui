import { defHttp } from '/@/utils/http/axios';
export const list = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/getLedgerPage', params });
};
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: '/jn/common/selectDeptNew', params });
};
// 辨识单元
export const getListAll = (params) => {
  return defHttp.get({ url: '/rk/skRkRecog/getList', params });
};
// 统计
export const statistics = (params) => {
  return defHttp.get({ url: '/rk/skRkApply/getStatisticsNumber', params });
};
// 撤销发布
export const quashPublish = (data) => {
  return defHttp.post({ url: '/rk/skRkApply/cancelPublish', data });
};
// 同步本厂数据至隐患排查清单
export const updateYhItem = () => {
  return defHttp.post(
    { url: '/rk/skRkApply/updateYhItem' },
    {
      errorMessageMode: 'none', // 不显示错误消息
      isTransformResponse: false, // 不处理响应数据
    }
  );
};
// 批量变更管控责任人
export const changeDutyPersonBatch = (data) => {
  return defHttp.post({ url: '/rk/skRkPoint/changeDutyPersonBatch', data });
};
