import { defHttp } from '/@/utils/http/axios';
import { getFileblob } from '/@/api/common/api';
import { downloadByData } from '/@/utils/file/download';
import { message } from 'ant-design-vue';

enum Api {
  list = '/sys/visitStatistics/list',
  export = '/sys/visitStatistics/export',
}

/** 获取所有月份访问统计列表 */
export const getVisitStatisticsList = () => defHttp.get({ url: Api.list });

/** 导出访问统计 xlsx，year/month 可选 */
export const exportVisitStatistics = async (params?: { year?: number; month?: number }) => {
  const data = await getFileblob(Api.export, params);
  if (!data || !(data instanceof Blob)) {
    message.error('导出失败');
    return;
  }
  downloadByData(data, '访问统计.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
