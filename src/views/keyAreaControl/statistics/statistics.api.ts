import { defHttp } from '/@/utils/http/axios';

enum Api {
  monthList = '/fireManagement/jnFirePositionMonitor/monthList',
  getOrganizationNew = '/jn/common/getOrganizationNew',
  queryByMonth = '/fireManagement/jnFirePositionMonitor/queryByMonth',
  exportXls = '/fireManagement/jnFirePositionMonitor/exportXlsMonitor',
}

// 获取所属机构
export const getOrganizationNew = () => {
  return defHttp.get({ url: Api.getOrganizationNew });
};

// 查询月份
export const getMonthList = (params) => {
  return defHttp.get({ url: Api.monthList, params });
};

// 重点部位统计-通过部门名称、年月份查询
export const getList = (params) => {
  return defHttp.get({ url: Api.queryByMonth, params });
};

export const exportXls = (parameter) => {
  return defHttp.get(
    {
      url: Api.exportXls,
      params: parameter,
      responseType: 'blob',
    },
    { isTransformResponse: false }
  );
};
