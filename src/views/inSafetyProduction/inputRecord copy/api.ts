import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 投入台账相关接口
  inputRecordList = '/inputRecord/list',
  inputRecordDetail = '/inputRecord/detail',
  inputRecordDownload = '/inputRecord/download',
  inputRecordUploadSignature = '/inputRecord/uploadSignature',
  inputRecordView = '/inputRecord/view',
}

/**
 * 获取投入台账列表
 * @param params
 */
export const getInputRecordList = (params) => defHttp.get({ url: Api.inputRecordList, params });

/**
 * 获取投入台账详情
 * @param params
 */
export const getInputRecordDetail = (params) => defHttp.get({ url: Api.inputRecordDetail, params });

/**
 * 下载投入台账
 * @param params
 */
export const downloadInputRecord = (params) => defHttp.get({ url: Api.inputRecordDownload, params, responseType: 'blob' });

/**
 * 上传签字版
 * @param params
 */
export const uploadInputRecordSignature = (params) => defHttp.post({ url: Api.inputRecordUploadSignature, params });

/**
 * 查看投入台账
 * @param params
 */
export const viewInputRecord = (params) => defHttp.get({ url: Api.inputRecordView, params });
