import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;

// 总库获取分类
export const getTree = () => {
  return defHttp.get({ url: '/sysComplianceLibrary/getTree' });
};

// 总库获取详情
export const getInfo = (params) => {
  return defHttp.get({ url: '/sysComplianceLibrary/getInfo', params });
};

// 我的合规库
export const myGetTree = (params) => {
  return defHttp.get({ url: '/complianceLibrary/getTree', params });
};

// 我的合规库获取详情
export const myGetInfo = (params) => {
  return defHttp.get({ url: '/complianceLibrary/getInfo', params });
};

// 更改适用性
export const changeApplicability = (data) => {
  return defHttp.post({ url: '/complianceLibrary/changeApplicability', data });
};

// 获取企业信息配置 
export const comGetInfo = () => {
  return defHttp.get({ url: '/complianceConfig/getInfo' });
};

// 企业信息配置
export const updateOrAdd = (data) => {
  return defHttp.post({ url: '/complianceConfig/updateOrAdd', data });
}

// 合规性评估 - 获取企业信息配置
export const pageList = (params) => {
  return defHttp.get({ url: '/complianceAssess/pageList', params });
};

// 统计
export const statistics = () => {
  return defHttp.get({ url: '/complianceAssess/statistics' });
};

// 获取评估名称
export const getName = (params) => {
  return defHttp.get({ url: '/complianceAssess/getName', params });
};

// 合规性评估-获取树
export const homeGetTree = (params) => {
  return defHttp.get({ url: '/complianceAssess/getTree', params });
};

// 获取法规详情
export const getStatuteInfo = (params) => {
  return defHttp.get({ url: '/complianceAssess/getStatuteInfo', params });
};

// 获取法规历史详情 
export const getItemInfo = (params) => {
  return defHttp.get({ url: '/complianceAssess/getItemInfo', params });
};
// 获取详情 一个id
export const getStatuteItemInfo = (params) => {
  return defHttp.get({ url: '/complianceAssess/getStatuteItemInfo', params });
}
// 获取详情
export const homeGetInfo = (params) => {
  return defHttp.get({ url: '/complianceAssess/getInfo', params });
};

// 全部人员
export const getAllUser = () => {
  return defHttp.get({ url: '/sys/api/queryAllUserBackCombo'},  { isTransformResponse: false });
}

// 评估 
export const assess = (data) => {
  return defHttp.post({ url: '/complianceAssess/assess', data });
}

// 评估报告
export const getReport = (params) => {
  return defHttp.get({ url: '/complianceAssess/getReport', params });
}

// 导出评估报告
export const exportReport = () => {
  return defHttp.get({ url: '/complianceAssess/exportReport', responseType: 'blob' }, { isReturnNativeResponse: true });
}

// 导出评估报告
export const exportReportById = (id) => {
  return defHttp.get({ url: '/complianceAssess/exportReportById/'+id, responseType: 'blob' }, { isReturnNativeResponse: true });
}
// 清空
export const cleanState = () => {
  return defHttp.get({ url: '/complianceAssess/cleanState' });
}

// 导入
// export const importData = () => {
//   return defHttp.post({ url: '/sysComplianceLibrary/importData' });
// }
export const uploadUrl = baseUploadUrl + '/sysComplianceLibrary/importData'

// 获取法规详情 /filemanage/jnFileManage/list
export const getJnFileManageList = (params) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/list', params });
}
