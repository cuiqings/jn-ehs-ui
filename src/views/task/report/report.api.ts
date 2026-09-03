import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();
enum Api {
    list = '/taskManagement/jnPublish/getTaskList',
    detail = '/taskManagement/jnPublishRecord/getDutyUnitDetail',
    report = '/taskManagement/jnPublishRecord/report',
    reportingList = '/taskManagement/jnPublishRecord/getReportingList',
    historyReport = '/taskManagement/jnPublishRecord/getHistoryList',
    applyExtension = '/taskManagement/jnPublishRecord/delayApply',
    tabCount = '/taskManagement/jnPublish/getTaskCount',
    historyDetail = '/taskManagement/jnPublishRecord/getCycleProcess',
    addParticipant = '/taskManagement/jnPublishParticipant/add',
    participantList = '/taskManagement/jnPublishParticipant/list',
    process1 = '/taskManagement/jnPublishRecord/getProcess1',
    process2 = '/taskManagement/jnPublishRecord/getProcess2',
    reportInfo1 = '/taskManagement/jnPublish/findByReportCycle',
    reportInfo2 = '/taskManagement/jnPublish/findByDutyUnit',
    reportInfo3 = '/taskManagement/jnPublish/findByJobRequirement',
    canAddParticipant = '/taskManagement/jnPublishParticipant/canAddParticipant',
    previousReportDetail = '/taskManagement/jnPublishRecord/getDetail'
}
export const reportList = (params) => defHttp.get({ url: Api.list, params: params });
export const applyExtension = (params) => defHttp.post({ url: Api.applyExtension, params: params });
export const getReportDetail = (params) => defHttp.get({ url: Api.detail, params: params });
export const reportTask = (params) => defHttp.post({ url: Api.report, params: params });
export const reportingList = (params) => defHttp.get({ url: Api.reportingList, params: params });
export const getHistoryReport = (params) => { return defHttp.get({ url: Api.historyReport, params: params }); }
export const getTabCount = (params) => defHttp.get({ url: Api.tabCount, params: params });
// 通过id查询历史记录
export const getHistoryDetail = (params) => {
    return defHttp.get({ url: Api.historyDetail, params });
};
// 添加参与人
export const addParticipant = (params) => {
    return defHttp.post({ url: Api.addParticipant, params });
};
// 获取参与人
export const getParticipantList = (params) => {
    return defHttp.get({ url: Api.participantList, params });
};
// 获取流程1
export const getProcess1 = (params) => {
    return defHttp.get({ url: Api.process1, params });
};
// 获取流程2
export const getProcess2 = (params) => {
    return defHttp.get({ url: Api.process2, params });
};
// 获取报告信息1
export const getReportInfo1 = (params) => {
    return defHttp.get({ url: Api.reportInfo1, params });
};
// 获取报告信息2
export const getReportInfo2 = (params) => {
    return defHttp.get({ url: Api.reportInfo2, params });
};
// 获取报告信息3
export const getReportInfo3 = (params) => {
    return defHttp.get({ url: Api.reportInfo3, params });
};
// 判断是否可以添加参与人
export const canAddParticipant = (params) => {
    return defHttp.get({ url: Api.canAddParticipant, params });
};
// 获取之前的报告详情
export const getPreviousReportDetail = (params) => {
    return defHttp.get({ url: Api.previousReportDetail, params });
};