import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/edu/questionBank/pageList',
  detailList = '/edu/question/pageList',
  save = '/edu/questionBank/add',
  edit = '/edu/questionBank/edit',
  saveQuestion = '/edu/question/add',
  editQuestion = '/edu/question/edit',
  detailByQuestionId = '/edu/question/getInfo/',
  deleteBatch = '/edu/questionBank/delete',
  deleteQuestionBatch = '/edu/question/delete',
  exportXls = '/sys/role/exportXls',
  importExcel = '/edu/question/import',
}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 系统角色列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 获取详情列表
 * @param params
 */
export const detailList = (params) => defHttp.get({ url: Api.detailList, params });

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
 * 保存或者更新题库
 * @param params
 */
export const saveOrUpdateBank = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * 保存或者更新试题
 * @param params
 */
export const saveOrUpdateQuestion = (params, isUpdate) => {
  const url = isUpdate ? Api.editQuestion : Api.saveQuestion;
  return defHttp.post({ url: url, params });
};
/**
 * 根据ID查询试题详情
 * @param params
 */
export const detailByQuestionId = (params) => defHttp.get({ url: Api.detailByQuestionId, params });
// 类型
export const loadTreeData = (params) => {
  return defHttp.get({ url: '/sys/category/loadTreeRoot', params });
};
