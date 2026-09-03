import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';

export const { viewImage } = useFileList();

// /jnboot
enum Api {
    overList = '/taskManagement/jnPublishStatistics/overTimeList',
    expXls = '/taskManagement/jnPublishStatistics/exportXls',
    taskFinish = '/taskManagement/jnPublishStatistics/taskFinishStats',
    juStatistics = '/taskManagement/jnPublishStatistics/statisticsData',
    juTaskType = '/taskManagement/jnPublishStatistics/taskTypeStats',
    noticeOvertime = '/taskManagement/publishList/noticeOvertime'
}

export const getExportUrl = Api.expXls;
export const overList = (params) => defHttp.get({ url: Api.overList, params });
export const expXls = () => defHttp.get({ url: Api.expXls }); //导出
export const taskFinish = (params) => defHttp.get({ url: Api.taskFinish, params });
export const juStatistics = (params) => defHttp.get({ url: Api.juStatistics, params });
export const juTaskType = (params) => defHttp.get({ url: Api.juTaskType, params });
export const noticeOvertime = () => defHttp.get({ url: Api.noticeOvertime });
