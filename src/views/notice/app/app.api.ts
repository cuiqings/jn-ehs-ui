import { defHttp } from '/@/utils/http/axios';

enum appApi {
  list = '/notice/ehsNoticeInfo/appList',
}

export const list = (params) => defHttp.get({ url: appApi.list, params: params });
