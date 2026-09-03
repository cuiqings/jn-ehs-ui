import { defHttp } from '/@/utils/http/axios';
enum Api {
  //完结验收
  workManageGetInfo = '/workManage/getInfo',
}
//jn/common/getDepart  获取单位列表
// 相关方单位   若当前登陆人是以A04B12开头的默认选中当前登陆人的orgCode，置灰
// 人员/jn/common/getUser  参数departIds 传递单位的companyId
// 2接口都是get方式
//申请人
export const workManageGetInfo = (params) => {
  return defHttp.get({ url: Api.workManageGetInfo, params });
};
