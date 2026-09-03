import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/jnSecurityOrgStructure/list',
  save = '/jnSecurityOrgStructure/add',
  edit = '/jnSecurityOrgStructure/edit',

  get = '/test/jeecgDemo/queryById',
  delete = '/jnSecurityOrgStructure/delete',
  deleteBatch = '/jnSecurityOrgStructure/deleteBatch',
  userDepartList = '/sys/user/userDepartList',
  getUserRole = '/sys/user/queryUserRole',
  getselectpeople = '/sys/user/listAll',
  getLastDep = '/jnSecurityOrgStructure/getSuperiorDepart',
  getNextDep = '/jnSecurityOrgStructure/getDepart',
  queryDepartTreeSyncNew = '/sys/sysDepart/queryDepartTreeSyncNew',
  queryAlltree = '/jnSecurityOrgStructure/queryTree',
  orgListTree = '/sys/common/orgList',
}
/**
 * 获取部门树列表
 */
export const queryDepartTreeSyncNew = (params?) => defHttp.get({ url: Api.queryDepartTreeSyncNew, params });
export const queryAlltree = (params?) => defHttp.get({ url: Api.queryAlltree, params });
export const getOrgList = (params) => {
  return defHttp.get({ url: Api.orgListTree, params });
};

/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除示例
 * @param params
 */
export const batchDeleteDemo = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 用户角色接口
 * @param params
 */
export const getUserRoles = (params) => defHttp.get({ url: Api.getUserRole, params }, { errorMessageMode: 'none' });
/**
 * 获取指定用户负责部门
 */
export const getUserDepartList = (params) => defHttp.get({ url: Api.userDepartList, params }, { successMessageMode: 'none' });

/**
 * 获取选中部门的人员
 * @param params
 */
export const getSelectPeople = (params) => {
  return defHttp.get({ url: Api.getselectpeople, params });
};
// 获取上级
export const getLastDep = (params) => {
  return defHttp.get({ url: Api.getLastDep, params });
};
// 获取下级
export const getNextDep = (params) => {
  return defHttp.get({ url: Api.getNextDep, params });
};
// 安全组织架构表-获取树形结构
export const getTree = () => {
  return defHttp.get({ url: '/jnSecurityOrgStructure/getTree' });
};
