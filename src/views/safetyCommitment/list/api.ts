import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/commitmentTemplate/pageList',
  add = '/commitmentTemplate/add',
  publish = '/commitmentTemplate/publish',
  edit = '/commitmentTemplate/update',
  delete = '/commitmentTemplate/delete',
  templateContent = '/commitmentTemplate/templateContent',
  detail = '/commitmentTemplate/detail',
  supervisorList = '/commitmentTemplate/querySupervisor',
  download = '/commitmentTemplate/download',
}

/**
 * @description: 获取安全承诺书列表
 */
export const getList = (params) => {
  return  defHttp.get({url: Api.list, params});
};

/**
 * @description: 获取监督人列表
 */
export const getSupervisorList = (params) => {
  return defHttp.get({url: Api.supervisorList, params});
};

/**
 * @description: 获取承诺书模板示例
 */
export const getTemplateExample = (params?) => {
  return defHttp.get({url: Api.templateContent, params});
//   return new Promise((resolve) => {
//       setTimeout(() => {
//           resolve('<p><strong>安全承诺书示例</strong></p><p>本人郑重承诺：</p><ol><li>严格遵守公司各项安全生产规章制度和操作规程。</li><li>认真履行本岗位安全生产职责，不违章指挥、不违章作业。</li><li>积极参加安全培训教育，提高安全意识和技能。</li></ol>');
//       }, 500);
//   });
};
export const add = (params) => {
  return defHttp.post({url: Api.add, params});
};
export const publish = (params) => {
  return defHttp.post({url: Api.publish, params});
};
export const edit = (params) => {
  return defHttp.post({url: Api.edit, params});
};
export const deleteCommitmentTemplate = (params) => {
  return defHttp.get({url: Api.delete, params});
};

/**
 * @description: 获取承诺书模板详情
 */
export const getDetail = (params) => {
  return defHttp.get({url: Api.detail, params});
};

/**
 * @description: 下载承诺书模板
 */
export const download = (params) => {
  return defHttp.get({url: Api.download, params, responseType: 'blob'}, { isTransformResponse: false });
};
