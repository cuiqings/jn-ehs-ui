import { defHttp } from '/@/utils/http/axios';
// 获取分片上传id
export const uploadId = (params) => {
  return defHttp.get({ url: '/edu/resource/minio/upload-id', params });
};
// 获取上传url
export const preSignUrl = (params) => {
  return defHttp.get({ url: '/edu/resource/minio/pre-sign-url', params });
};
// 分片合并
export const mergeFile = (data) => {
  return defHttp.post({ url: '/edu/resource/minio/merge-file', data });
};
// 上传
export const uploadUrl = (params, onUploadProgress) => {
  return defHttp.post({ url: '/edu/resource/upload', params, headers: { 'Content-Type': 'multipart/form-data' } }, onUploadProgress);
};
// 预览
export const preview = (id) => {
  return defHttp.get({ url: `/edu/resource/preview/${id}` });
};
// 添加试题
export const addQuestion = (id, data) => {
  return defHttp.post({ url: `/edu/resource/addQuestion/${id}`, data });
};
// 查询试题
export const queryQuestion = (id) => {
  return defHttp.post({ url: `/edu/resource/queryQuestion/${id}` });
};
