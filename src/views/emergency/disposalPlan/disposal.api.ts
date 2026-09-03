import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();


enum Api {
  list = '/emergency/emergencyResponsePlan/list',
  save = '/emergency/emergencyResponsePlan/add',
  edit = '/emergency/emergencyResponsePlan/edit',
  downloadOne = '/sys/comment/downloadOne',
  deleteOne = '/emergency/emergencyResponsePlan/delete',
  downloadAll = '/sys/comment/downloadAll',
}

export const list = (params) => defHttp.get({ url: Api.list, params: params });
export const add = (params) => defHttp.post({ url: Api.save, params: params });
export const edit = (params) => defHttp.post({ url: Api.edit, params: params });
export const downloadOne = (params) => defHttp.post({ url: Api.downloadOne, params: params });
export const deleteOne = (params) => defHttp.delete({ url: Api.deleteOne, params: params }, { joinParamsToUrl: true });
export const downloadAll = () => defHttp.post({ url: Api.downloadAll });