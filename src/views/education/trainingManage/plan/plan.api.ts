import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';
import { Modal } from 'ant-design-vue';

export const { viewImage } = useFileList();

enum Api {
  list = '/edu/trainPlan/pageList',
  save = '/edu/trainPlan/add',
  edit = '/edu/trainPlan/edit',
  delete = '/edu/trainPlan/delete',
  projectList = '/edu/trainProject/pageList',
  saveProject = '/edu/trainProject/add',
  editProject = '/edu/trainProject/edit',
  deleteProject = '/edu/trainProject/delete',
  importUrl = '/edu/trainProject/import',
}

export const list = (params) => defHttp.get({ url: Api.list, params: params });
export const add = (params) => defHttp.post({ url: Api.save, params: params });
export const edit = (params) => defHttp.post({ url: Api.edit, params: params });
export const deletePlan = (params) => defHttp.post({ url: Api.delete, params: params });
export const projectList = (params) => defHttp.get({ url: Api.projectList, params: params });
export const saveOrUpdateProject = (params, isUpdate) => {
  let url = isUpdate ? Api.editProject : Api.saveProject;
  return defHttp.post({ url: url, params });
}
export const deleteProject = (params, handleSuccess) => defHttp.post({ url: Api.deleteProject, params: params }).then(() => {
  handleSuccess();
});
export const deleteBatchProject = (params, handleSuccess) => {
  console.log(params);
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.post({ url: Api.deleteProject, params: params }).then(() => {
        handleSuccess();
      });
    },
  });
}
export const getImportUrl = Api.importUrl;