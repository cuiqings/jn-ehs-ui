import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();


enum Api {
    list = '/taskManagement/publishList/getList',
    getFileViewDomain = '/sys/comment/getFileViewDomain',
    reportInfo1 = '/taskManagement/jnPublish/findByReportCycle',
    reportInfo2 = '/taskManagement/jnPublish/findByDutyUnit',
    reportInfo3 = '/taskManagement/jnPublish/findByJobRequirement',
    participantList = '/taskManagement/jnPublishParticipant/list',
    addParticipant = '/taskManagement/jnPublishParticipant/add',
    process1 = '/taskManagement/jnPublish/getProcess1',
    process2 = '/taskManagement/jnPublish/getProcess2',
    endTask = '/taskManagement/jnPublish/close',
    canCheck = '/taskManagement/jnPublishRecord/canCheck',
    tabCount = '/taskManagement/publishList/getTaskCount',
    checkReport = '/taskManagement/jnPublishRecord/check',
    reviewList = '/taskManagement/publishList/getDelayApplyList',
    // reviewReport = '/taskManagement/jnPublishRecord/delayCheck',
    reviewReport = '/taskManagement/jnPublishRecord/delayApprove',
    oneRemind = '/taskManagement/publishList/noticeReporting',
    canAddParticipant = '/taskManagement/jnPublishParticipant/canAddParticipant',
}

export const list = (params) => defHttp.get({ url: Api.list, params: params });
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
// 获取参与人
export const getParticipantList = (params) => {
    return defHttp.get({ url: Api.participantList, params });
};
// 添加参与人
export const addParticipant = (params) => {
    return defHttp.post({ url: Api.addParticipant, params });
};
// 获取流程1
export const getProcess1 = (params) => {
    return defHttp.get({ url: Api.process1, params });
};
// 获取流程2
export const getProcess2 = (params) => {
    return defHttp.get({ url: Api.process2, params });
};
// 关闭任务
export const endTask = (params) => {
    return defHttp.post({ url: Api.endTask, params });
};
// 判断是否可以验收
export const canCheck = (params) => {
    return defHttp.get({ url: Api.canCheck, params });
};
export const getTabCount = (params) => defHttp.get({ url: Api.tabCount, params: params });
// 验收
export const checkReport = (params) => {
    return defHttp.post({ url: Api.checkReport, params });
};
// 获取延期申请列表
export const reviewList = (params) => {
    return defHttp.get({ url: Api.reviewList, params });
};
// 延期申请-审核
export const reviewReport = (params) => {
    return defHttp.post({ url: Api.reviewReport, params });
};
// 一键
export const oneRemind = (params) => {
    return defHttp.get({ url: Api.oneRemind, params });
};
// 判断是否可以添加参与人
export const canAddParticipant = (params) => {
    return defHttp.get({ url: Api.canAddParticipant, params });
};