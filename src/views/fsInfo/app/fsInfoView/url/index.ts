import { defHttp } from '/@/utils/http/axios';
import { getToken } from '/@/utils/auth';
export const getFileList = (params?) => {
  return defHttp.get({ url: '/fire/filemanage/api/getFileList', params });
};
// 预览
export const doPreview = (fileId: string) => {
  return defHttp.put({ url: `/fire/filemanage/api/doPreview?token=${getToken()}&id=${fileId}` });
};
