import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/rk/skRkMajorHazard/list',
  save = '/rk/skRkMajorHazard/add',
  edit = '/rk/skRkMajorHazard/edit',
  delete = '/rk/skRkMajorHazard/delete',
  deleteBatch = '/rk/skRkMajorHazard/deleteBatch',
}

export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url, params });
};

export const deleteRecord = (params, handleSuccess) => {
  return defHttp.get({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const batchDeleteRecord = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.get({ url: Api.deleteBatch, params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

export const saveMark = (params) => {
  return defHttp.post({ url: Api.edit, params });
};
