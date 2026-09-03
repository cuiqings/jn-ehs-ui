import { defHttp } from '/@/utils/http/axios';
enum Api {
  list = '/jnStaffCertifications/list',
  save = '/jnStaffCertifications/add',
  edit = '/jnStaffCertifications/edit',
  deleteOne = '/jnStaffCertifications/delete',
  deleteBatch = '/jnStaffCertifications/deleteBatch',
  importExcel = '/jnStaffCertifications/importExcel',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  getDeptNew = '/jn/common/selectDeptNew',
  reexamine = '/jnStaffCertifications/review',
}

// 导入
export const importUrl = Api.importExcel;

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
export const batchDeleteRecord = (params) => {
  return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true });
};

// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: '/jn/common/getDepart3ListWithSecurity' });
};

// 获取所属部门
export const getDeptNew = (params) => {
  return defHttp.get({ url: Api.getDeptNew, params });
};

// 复审
export const getReexamine = (params) => {
  return defHttp.post({ url: Api.reexamine, params });
};
// 根据工号查询人员信息
export const selectUserName = (jobNum) => {
  return defHttp.get({ url: `/jnStaffCertifications/selectUserName/${jobNum}` });
};
// 到期提醒
export const remind = (data) => {
  return defHttp.post({ url: '/jnStaffCertifications/remind', data });
};
// 查询顶部统计
export const statistics = () => {
  return defHttp.get({ url: '/jnStaffCertifications/statistics' });
};
// 人员资质证书管理-检查签字/确认签字
export const sign = (data) => {
  return defHttp.post({ url: '/jnStaffCertifications/sign', data });
};
