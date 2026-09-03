import { defHttp } from '/@/utils/http/axios';
import { getToken } from '/@/utils/auth';
export const getFileList = (params?) => {
  return defHttp.get({ url: '/hb/filemanage/api/getFileList', params });
};
// 下载
export const download = (fileId: string | number) => {
  return defHttp.get({ url: `/hb/filemanage/api/download?token=${getToken()}&source=${fileId}` });
};
// 预览
export const doPreview = (fileId: string | number) => {
  return defHttp.put({ url: `/hb/filemanage/api/doPreview?token=${getToken()}&id=${fileId}` });
};
