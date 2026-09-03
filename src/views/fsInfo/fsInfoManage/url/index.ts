import { defHttp } from '/@/utils/http/axios';
import { getToken } from '/@/utils/auth';
export const getFileList = (params?) => {
  return defHttp.get({ url: '/fire/filemanage/api/getFileList', params });
};
export const postFileList = (params?) => {
  return defHttp.post({ url: `/fire/filemanage/api/getFileList?token=${getToken()}`, params });
};
export const add = (params?) => {
  return defHttp.post({ url: '/fire/filemanage/api/create', params });
};
// 上传
export const uploadFile = (params, fileId: string | number) => {
  return defHttp.post({ url: `/fire/filemanage/api/uploadFile?token=${getToken()}&target=${fileId}`, params });
};
// 下载
export const download = (fileId: string | number) => {
  return defHttp.get({ url: `/fire/filemanage/api/download?token=${getToken()}&source=${fileId}` });
};
// 预览
export const doPreview = (fileId: string | number) => {
  return defHttp.put({ url: `/fire/filemanage/api/doPreview?token=${getToken()}&id=${fileId}` });
};
// 日志
export const showFileLog = (id: string, page: number, limit: number) => {
  return defHttp.get({ url: `/fire/filemanage/api/showFileLog?id=${id}&page=${page}&limit=${limit}&column=updateTime&order=desc` });
};
// 获取用户
export const getUser = () => {
  return defHttp.get({ url: '/jn/common/getUser', timeout: 10 * 60 * 1000 * 6 });
};
// 添加权限
export const doAuth = (params) => {
  return defHttp.post({ url: '/fire/filemanage/api/doAuth', params });
};
// 获取当前权限
export const getInitAuth = (id: string) => {
  return defHttp.get({ url: `/fire/filemanage/api/getInitAuth?token=${getToken()}&id=${id}` });
};
// 获取角色信息
export const getRole = () => {
  return defHttp.get({ url: '/jn/common/getRole' });
};
// 获取组织机构
export const getDepart = () => {
  return defHttp.get({ url: '/jn/common/getDepart', timeout: 10 * 60 * 1000 * 6 });
};
