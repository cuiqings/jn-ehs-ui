import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/edu/trainArchival/pageList',
  save = '/edu/trainArchival/edit',
  saveQuestion = '/edu/question/add',
  editQuestion = '/edu/question/edit',
  detailByQuestionId = '/edu/question/getInfo/',
  deleteBatch = '/edu/questionBank/delete',
  deleteQuestionBatch = '/edu/question/delete',
  exportXls = '/edu/trainArchival/export',
  importExcel = '/edu/trainArchival/import',
  orgCodeUrl = '/jn/common/getOrganizationNew',
  deptCodeUrl = '/jn/common/selectDeptNew',
  generateArchival = '/edu/trainArchival/generate',
  getCompletionStats = '/edu/trainArchival/statistics',
  downloadTemplateUrl = '/edu/trainArchival/downloadTemplate',
  selfSignUrl = '/edu/trainArchival/userSign',
  checkSignUrl = '/edu/trainArchival/checkSign',
}
/**
 * 导出api
 */
export const exportUrl = Api.exportXls;
/**
 * 导入api
 */
export const importUrl = Api.importExcel;
/**
 * 下载模板
 */
export const getDownloadTemplateUrl = Api.downloadTemplateUrl;
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
// 发生单位
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.orgCodeUrl });
};
export const getDeptNew = (params) => {
  return defHttp.get({ url: Api.deptCodeUrl, params });
};
export const generateArchivalFile = (params) => {
  return defHttp.get({ url: Api.generateArchival, params,responseType: 'blob',}, { isTransformResponse: false });
};

/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.post({ url: Api.deleteBatch, data: params }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 批量删除试题
 * @param params
 */
export const batchDeleteQuestion = (params, handleSuccess) => {
  console.log(params);
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.post({ url: Api.deleteQuestionBatch, data: params }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 保存或者更新
 * @param params
 */
export const saveTrainArchival = (params) => {
  return defHttp.post({ url: Api.save, params });
};
/**
 * 保存或者更新试题
 * @param params
 */
export const saveOrUpdateQuestion = (params, isUpdate) => {
  let url = isUpdate ? Api.editQuestion : Api.saveQuestion;
  return defHttp.post({ url: url, params });
};
/**
 * 根据ID查询试题详情
 * @param params
 */
export const detailByQuestionId = (params) => defHttp.get({ url: Api.detailByQuestionId, params });

/**
 * 获取完成情况统计
 */
export const getCompletionStats = (params) => {
  return defHttp.get({ url: Api.getCompletionStats, params });
};
/**
 * 获取自签单位
 */
export const addSelfSign = (params) => {
  return defHttp.post({ url: Api.selfSignUrl, params });
};
/**
 * 检查自签单位
 */
export const addCheckSign = (params) => {
  return defHttp.post({ url: Api.checkSignUrl, params });
}
