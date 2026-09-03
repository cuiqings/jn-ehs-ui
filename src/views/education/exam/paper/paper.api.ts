import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/edu/examPaper/pageList',
  save = '/edu/examPaper/add',
  edit = '/edu/examPaper/edit',
  savePaper="/edu/examPaper/groupVolume",
  detailByQuestionId = '/edu/question/getInfo/',
  deleteBatch = '/edu/examPaper/delete',
  deleteQuestionBatch = '/edu/question/delete',
  exportXls = '/sys/role/exportXls',
  importExcel = '/sys/role/importExcel',
  paperDetail = '/edu/examPaper/queryGroupVolume',
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
}
/**
 * 保存或者更新题库
 * @param params
 */
export const saveOrUpdateBank = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

/**
 * 根据ID查询试题详情
 * @param params
 */
export const detailByQuestionId = (params) => defHttp.get({ url: Api.detailByQuestionId, params });
/**
 * 保存试卷
 * @param params
 */
export const savePaper = (params) => defHttp.post({ url: Api.savePaper, params });
/**
 * 获取试卷详情
 * @param params
 */
export const getPaperDetail = (params) => defHttp.get({ url: Api.paperDetail, params });