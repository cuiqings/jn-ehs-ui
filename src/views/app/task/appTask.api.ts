import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();

// /jnboot/taskManagement/jnPublish/findByReportCycle //回报周期查询
enum appApi {
  debriefedCount = '/taskManagement/jnPublish/getTaskCount',
  toDebriefed = '/taskManagement/jnPublish/getTaskList',
  goingDetail = '/taskManagement/jnPublishRecord/getDutyUnitDetail', //进行详情
  cycleDetail = '/taskManagement/jnPublishRecord/getDetail',
  process1App1 = '/taskManagement/jnPublishRecord/getProcess1App',
  processApp2 = '/taskManagement/jnPublish/getProcess1App',
  oarticipantList = '/taskManagement/jnPublishParticipant/list',
  repUpl = '/taskManagement/jnPublishRecord/report',
  departCom = '/jn/common/getDepart',
  parAdd = '/taskManagement/jnPublishParticipant/add',
  historyList = '/taskManagement/jnPublishRecord/getHistoryList',
  checkAccept = '/taskManagement/jnPublishRecord/check',
}

export const debriefedCount = () => defHttp.get({ url: appApi.debriefedCount });
export const toDebriefed = (params) => defHttp.get({ url: appApi.toDebriefed, params: params });
export const goingDetail = (publishId) => defHttp.get({ url: appApi.goingDetail, params: { publishId } }); //详情
export const cycleDetail = (id) => defHttp.get({ url: appApi.cycleDetail, params: { id } }); //周期详情
export const process1App1 = (recordId) => defHttp.get({ url: appApi.process1App1, params: { publishId: recordId } }); //流程
export const processApp2 = (publishId) => defHttp.get({ url: appApi.processApp2, params: { publishId } });
export const oarticipantList = (publishId) => defHttp.get({ url: appApi.oarticipantList, params: { publishId } });
export const repUpl = (params) => defHttp.post({ url: appApi.repUpl, params });
export const departCom = (params) => defHttp.get({ url: appApi.departCom, params });
export const parAdd = (params) => defHttp.post({ url: appApi.parAdd, params });
export const historyList = (publishId) => defHttp.get({ url: appApi.historyList, params: { publishId } });
export const checkAccept = (params) => defHttp.post({ url: appApi.checkAccept, params });
// 获取用户列表
export const getUserList = (params) => {
  return defHttp.get({ url: '/jn/common/getUserList', params });
};
// 评论个数
export const listByForm = (params) => {
  return defHttp.get({ url: '/sys/comment/listByForm', params });
};
