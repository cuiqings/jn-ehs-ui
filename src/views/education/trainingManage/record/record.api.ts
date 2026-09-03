import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/edu/trainRecord/pageList',
  userList = '/jn/common/getAllUserByOrg',
  add = '/edu/trainRecord/add',
  detail = '/edu/trainRecord/getInfo/',
  deleteBatch = '/edu/trainRecord/delete',
  projectList = '/edu/trainProject/getProjectList',
}
/**
 * 系统列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

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
 * 新增培训记录
 * @param params
 */
export const addRecord = (params) => {
  return defHttp.post({ url: Api.add, params });
};
/**
 * 根据ID查询详情
 * @param params
 */
export const getDetailById = (params) => defHttp.get({ url: Api.detail+params.id });

export const getUserList = (params) => {
  return defHttp.get({ url: Api.userList, params });
}
export const getProjectList = (params) => {
  return defHttp.get({ url: Api.projectList, params });
}