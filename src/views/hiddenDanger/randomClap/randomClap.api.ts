import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/hiddenDangerChecks/jnYhSsp/list',
  delete = '/hiddenDangerChecks/jnYhSsp/delete',
  orgList = '/sys/sysDepart/selectLine',
  confirm = '/hiddenDangerChecks/jnYhConfirm/handle',
  rectify='/hiddenDangerChecks/jnYhConfirm/repair',
  review = '/hiddenDangerChecks/jnYhConfirm/check',
}
/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 查询所属机构列表
 * @param params
 */
export const orgList = () => {
  return defHttp.get({ url: Api.orgList })
};
/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 确认
 * @param params
 */
export const hiddenConfirm = (params) => {
  return defHttp.post({ url: Api.confirm, params });
}
/**
 * 整改
 * @param params
 */
export const hiddenRectify = (params) => {
  return defHttp.post({ url: Api.rectify, params });
}
/**
 * 复查
 * @param params
 */
export const hiddenReview = (params) => {
  return defHttp.post({ url: Api.review, params });
}