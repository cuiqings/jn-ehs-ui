import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();


enum appApi {
  list1 = '/emergency/emergencyPlan/list',
  list2 = '/emergency/emergencyResponsePlan/list',
  list3 = '/emergency/emergencyDrillRecord/list',
  orgList = '/sys/sysDepart/queryTreeList',
}

export const list1 = (params) => defHttp.get({ url: appApi.list1, params: params });
export const list2 = (params) => defHttp.get({ url: appApi.list2, params: params });
export const list3 = (params) => defHttp.get({ url: appApi.list3, params: params });
