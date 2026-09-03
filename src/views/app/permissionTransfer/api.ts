import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/system/sysRoleAssign/list',
  add = '/system/sysRoleAssign/add',
  revoke = '/system/sysRoleAssign/cancel',
  receiverList = '/system/sysRoleAssign/findReceiverList',
  findRoleList = '/system/sysRoleAssign/findRoleList',
}

/**
 * 获取转交历史列表
 */
export const getTransferList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 新建转交
 */
export const addTransfer = (params) => {
  return defHttp.post({ url: Api.add, params });
};

/**
 * 撤销转交
 */
export const revokeTransfer = (params) => {
  return defHttp.post({ url: Api.revoke, params });
};

/**
 * 获取用户列表
 */
export const getReceiverList = (params) => {
  return defHttp.get({ url: Api.receiverList, params });
};

/**
 * 获取角色列表
 */
export const getUserRoleList = (params) => {
  return defHttp.get({ url: Api.findRoleList, params });
};
