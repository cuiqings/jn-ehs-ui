import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/fire/jnFireSafetyTraining/list',
  save = '/fire/jnFireSafetyTraining/add',
  edit = '/fire/jnFireSafetyTraining/edit',
  deleteOne = '/fire/jnFireSafetyTraining/delete',
  deleteBatch = '/fire/jnFireSafetyTraining/deleteBatch',
  getOrganizationNew = '/jn/common/getOrganizationNew',
}

// 获取所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};

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
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
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
