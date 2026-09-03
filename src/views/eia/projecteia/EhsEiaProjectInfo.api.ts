import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

enum Api {
  list = '/eia/ehsEiaApply/list',
  save='/eia/ehsEiaApply/add',
  edit='/eia/ehsEiaApply/edit',
  deleteOne = '/eia/ehsEiaApply/delete',
  deleteBatch = '/eia/ehsEiaApply/deleteBatch',
  importExcel = '/eia/ehsEiaApply/importExcel',
  exportXls = '/eia/ehsEiaApply/exportXls',


//  环评提资信息 接口
updateBatch ='/eia/ehsEiaInfo/updateBatch',

//  审核 接口
saveAudit ='/eia/ehsEiaAudit/add',
saveBatchAudit ='/eia/ehsEiaAudit/saveBatch',
editAudit ='/eia/ehsEiaAudit/edit',

listEiaAuditByCondition ='/eia/ehsEiaAudit/listByCondition',

// 项目基础信息编辑
editOption = '/eia/ehsEiaInfo/editOption',


// 项目批次信息编辑
editApplyOption = '/eia/ehsEiaApply/editOption',

// 项目基础信息查询
listEiaInfoByCondition = '/eia/ehsEiaInfo/listByCondition',


// 资料补充批量新增
addEiaExtraBatch = '/eia/ehsEiaAdd/addBatch',

// 资料补充查询
addAuditList = '/eia/ehsEiaAdd/extraAuditGroupByCompanyName',
addAuditList1 = '/eia/ehsEiaAdd/addAuditList',

// 审核人追加
addAuditUserOption = '/eia/ehsEiaAddAudit/saveBatch',

// 批量保存节点审核人
saveBatchByUserInfoOption = '/eia/ehsEiaAudit/saveBatchByUserInfo',

// 环评提资单审核意见
auditCommentAudit = '/eia/ehsEiaAddAudit/edit',

}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) =>
  defHttp.get({url: Api.list, params});

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}


// 所属单位
export const orgList = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};


/**
 * 环评提资信息批量更新
 * @param params
 */
export const updateBatch = (params) => {
  return defHttp.post({url: Api.updateBatch, params});
}

/**
 * 环评提资信息批量更新
 * @param params
 */
export const saveAudit = (params) => {
  return defHttp.post({url: Api.saveAudit, params},{ isTransformResponse: false });
}

/**
 * 环评提资信息批量更新
 * @param params
 */
export const saveBatchAudit = (params) => {
  return defHttp.post({url: Api.saveBatchAudit, params});
}

/**
 * 审核意见查询
 * @param params
 */
export const listEiaAuditByCondition = (params) => {
  return defHttp.post({url: Api.listEiaAuditByCondition, params});
}


/**
 * 项目基础信息
 * @param params
 */
export const editOption = (params) => {
  return defHttp.post({url: Api.editOption, params},{ isTransformResponse: false });
}

/**
 * 项目基础信息查询
 * @param params
 */
export const listEiaInfoByCondition = (params) => {
  return defHttp.post({url: Api.listEiaInfoByCondition, params});
}


/**
 * 资料补充批量更新
 * @param params
 */
export const addEiaExtraBatch = (params) => {
  return defHttp.post({url: Api.addEiaExtraBatch, params},{ isTransformResponse: false });
}


/**
 * 资料补充查询
 * @param params
 */
export const addAuditList = (params) => {
  return defHttp.get({url: Api.addAuditList, params});
}

export const addAuditList1 = (params) => {
  return defHttp.get({url: Api.addAuditList1, params});
}

/**
 * 项目批次信息更新
 * @param params
 */
export const editApplyOption = (params) => {
  return defHttp.post({url: Api.editApplyOption, params},{ isTransformResponse: false });
}

/**
 * 审核人追加
 * @param params
 */
export const addAuditUserOption = (params) => {
  return defHttp.post({url: Api.addAuditUserOption, params});
}

/**
 * 批量保存节点审核人
 * @param params
 */
export const saveBatchByUserInfoOption = (params) => {
  return defHttp.post({url: Api.saveBatchByUserInfoOption, params});
}

/**
 * 审核意见更新
 * @param params
 */
export const editAuditOption = (params) => {
  return defHttp.post({url: Api.editAudit, params});
}

/**
 * 环评提资单审核意见
 * @param params
 */
export const auditCommentAudit = (params) => {
  return defHttp.post({url: Api.auditCommentAudit, params});
}
