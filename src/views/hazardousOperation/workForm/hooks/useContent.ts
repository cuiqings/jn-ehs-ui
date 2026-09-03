import { useListPage } from '/@/hooks/system/useListPage';
import { dateFormat } from '/@/utils/common/compUtils';
import { getWorkReport } from '../../api/index';
import { useRouter } from 'vue-router';
import { useData } from './useData';
import dayjs from 'dayjs';
export const useContent = () => {
  const { columns } = useData();

  const { tableContext, onExportXls } = useListPage({
    designScope: 'basic-table-work-form',
    tableProps: {
      api: getWorkReport,
      columns: columns,
      showActionColumn: false,
      formConfig: {
        schemas: [
          {
            field: 'time',
            label: '作业开始时间',
            component: 'RangeDate',
            componentProps: {
              valueFormat: 'YYYY-MM-DD',
              format: 'YYYY-MM-DD',
              disabledDate: (current) => {
                let data = getForm().getFieldsValue().time;
                if (!data || data.length === 0) {
                  return false;
                }
                const [start, end] = data.split(',');
                const tooLate = start && current.diff(start, 'days') > 30;
                const tooEarly = end && dayjs(end).diff(current, 'days') > 30;
                return tooEarly || tooLate;
              },
            },
            defaultValue: getDay(),
            colProps: { span: 6 },
          },
        ],
      },
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['startDate'] = time[0];
          params['endDate'] = time[1];
          delete params['time'];
        }
        return params;
      },
    },
    exportConfig: {
      name: '危险作业报表-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/workStatistics/workReportExport',
    },
  });

  const router = useRouter();

  const toDetail = (code) => {
    sessionStorage.setItem('formData_p7', JSON.stringify({ orgCode: code, ...getForm().getFieldsValue() }));
    router.push({ path: '/HazardousOperation/WorkRecord' });
  };

  const [registerTable, { getForm }] = tableContext;

  return {
    toDetail,
    onExportXls,
    registerTable,
  };
};
// 获取近日期
export const getDay = () => {
  const date = new Date();
  const startDate = dateFormat(date, 'yyyy-MM-dd');
  const endDate = dateFormat(date, 'yyyy-MM-dd');
  return [startDate, endDate].toString();
};
