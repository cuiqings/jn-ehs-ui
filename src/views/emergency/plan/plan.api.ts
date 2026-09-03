import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();


enum PlanApi {
  list = '/emergency/emergencyPlan/list',
  save = '/emergency/emergencyPlan/add',
  edit = '/emergency/emergencyPlan/edit',
  getFileViewDomain = '/sys/comment/getFileViewDomain',
  downloadOne = '/sys/comment/downloadOne',
  deleteOne = '/emergency/emergencyPlan/delete',
  downloadAll = '/emergency/emergencyPlan/downloadALL',
}

export const list = (params) => defHttp.get({ url: PlanApi.list, params: params });
export const add = (params) => defHttp.post({ url: PlanApi.save, params: params });
export const edit = (params) => defHttp.post({ url: PlanApi.edit, params: params });
export const downloadOne = (params) => defHttp.post({ url: PlanApi.downloadOne, params: params });
export const deleteOne = (params) => defHttp.delete({ url: PlanApi.deleteOne, params: params }, { joinParamsToUrl: true });
export const downloadAll = (params) => defHttp.get({ url: PlanApi.downloadAll, params: params});
