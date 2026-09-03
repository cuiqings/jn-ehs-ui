import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jnStaffCertificationsRemind/list',
  save = '/jnStaffCertificationsRemind/add',
  edit = '/jnStaffCertificationsRemind/edit',
  deleteOne = '/jnStaffCertificationsRemind/delete',
  deleteBatch = '/jnStaffCertificationsRemind/deleteBatch',
}

// 查询列表
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

// 新增/编辑
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};

// 删除
export const deleteRecord = (params) => {
  return defHttp.delete({ url: Api.deleteOne, data: params }, { joinParamsToUrl: true });
};

// 批量删除
export const batchDeleteRecord = (params) =>
  defHttp.delete(
    {
      url: Api.deleteBatch,
      data: params,
    },
    { joinParamsToUrl: true }
  );
// 消息模版
export const messageTemplate = () => {
  return defHttp.get({ url: '/sys/message/sysMessageTemplate/list', params: { pageSize: 99999 } });
};
// 通知角色
export const noticeRole = () => {
  return defHttp.get({ url: '//jn/common/getRole' });
};
