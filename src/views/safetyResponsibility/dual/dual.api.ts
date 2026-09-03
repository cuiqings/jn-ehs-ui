import { defHttp } from '/@/utils/http/axios';
import axios from 'axios';
import { useGlobSetting } from '/@/hooks/setting';
import { getToken, getTenantId } from '/@/utils/auth';
import signMd5Utils from '/@/utils/encryption/signMd5Utils';
import { ConfigEnum } from '/@/enums/httpEnum';

enum Api {
  list = '/manifestManagement/pagelist',
  save = '/manifestManagement/add',
  edit = '/manifestManagement/update',
  delete = '/manifestManagement/delete',
  detail = '/manifestManagement/info',
}

/**
 * 分页查询列表
 * @param params 查询参数
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 根据ID查询详情
 * @param params 包含id的参数对象
 */
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail +'/'+ params.id });
};

/**
 * 新增记录
 * @param params 新增数据
 */
export const saveRecord = (params) => {
  return defHttp.post({ url: Api.save, params });
};

/**
 * 编辑记录
 * @param params 编辑数据
 */
export const editRecord = (params) => {
  return defHttp.put({ url: Api.edit, params });
};

/**
 * 保存或更新记录
 * @param params 数据参数
 * @param isUpdate 是否为更新操作
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  const method = isUpdate ? 'put' : 'post';
  return defHttp[method]({ url, params });
};

/**
 * 保存或更新记录（支持文件上传）
 * @param formData FormData对象，包含表单数据和文件
 * @param isUpdate 是否为更新操作
 */
export const saveOrUpdateWithFile = (formData: FormData, isUpdate: boolean) => {
  const globSetting = useGlobSetting();
  const url = isUpdate ? Api.edit : Api.save;
  const token = getToken();
  let tenantid = getTenantId();
  
  if (!tenantid) {
    tenantid = '0';
  }
  
  // 使用原生 axios 来处理文件上传，避免 defHttp 的默认 Content-Type 设置
  return axios.post(`${globSetting.apiUrl}${url}`, formData, {
    headers: {
      'Authorization': token,
      [ConfigEnum.TOKEN]: token,
      [ConfigEnum.TIMESTAMP]: signMd5Utils.getTimestamp(),
      [ConfigEnum.Sign]: signMd5Utils.getSign(url, {}),
      [ConfigEnum.TENANT_ID]: tenantid,
      [ConfigEnum.VERSION]: 'v3',
      // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
    },
  }).then(response => {
    // 返回与 defHttp 相同的数据格式
    return response.data;
  });
};

/**
 * 删除单条记录
 * @param params 包含id的参数对象
 * @param handleSuccess 成功回调函数
 */
export const deleteRecord = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete +'/'+ params.id }).then(() => {
    handleSuccess();
  });
};
