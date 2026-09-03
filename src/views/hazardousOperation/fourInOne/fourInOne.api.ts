import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

/**
 * API接口枚举
 */
enum Api {
  list = '/siheyiDeviceConfig/list',
  save = '/siheyiDeviceConfig/add',
  edit = '/siheyiDeviceConfig/edit',
}


/**
 * 获取四合一危险作业列表
 * @param params 查询参数
 */
export const getList = (params: any) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或更新四合一危险作业
 * @param params 数据参数
 * @param isUpdate 是否为更新操作
 */
export const saveOrUpdate = (params: any, isUpdate: boolean) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};