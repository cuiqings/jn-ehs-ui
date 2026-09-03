import { defHttp } from '/@/utils/http/axios';
import { getToken } from '/@/utils/auth';
export const getFileList = (params?) => {
  return defHttp.get({ url: '/secure/filemanage/api/getFileList', params });
};
// 预览
export const doPreview = (fileId: string) => {
  return defHttp.get({ url: `/secure/filemanage/api/doPreview?token=${getToken()}&id=${fileId}` });
};
