import { defHttp } from '/@/utils/http/axios';

enum Api {
  investLedgerList = '/investLedger/pageList',
  inputRecordDownload = '/investLedger/download',
  inputRecordUpload = '/investLedger/upload',
  investLedgerView = '/investLedger/info',
}

export const investLedgerList = (params) => defHttp.get({ url: Api.investLedgerList, params });

export const downloadInputRecord = (params) => defHttp.get({ url: Api.inputRecordDownload, params, responseType: 'blob' });

export const uploadInputRecord = (params) => defHttp.post({ url: Api.inputRecordUpload, params });

export const investLedgerView = (params) => defHttp.get({ url: Api.investLedgerView, params });
