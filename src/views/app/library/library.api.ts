import { defHttp } from '/@/utils/http/axios';

enum Api {
  yhAIRecognize = '/baseLibrary/bsYhLib/recognize',
}
/**
 * 列表
 * @param params
 */
export const getYhAIRecognizeList = (params) => defHttp.get({ url: Api.yhAIRecognize, params });