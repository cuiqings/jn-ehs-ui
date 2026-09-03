import { useListPage } from '/@/hooks/system/useListPage';
import { dateFormat } from '/@/utils/common/compUtils';
import { workReportDetails } from '../../api';
import { useData } from './useData';

export const useContent = () => {
  const { orgs, columns } = useData();
  const { tableContext, onExportXls } = useListPage({
    designScope: 'basic-table-work-record',
    tableProps: {
      api: workReportDetails,
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
              style: {
                width: '100%',
              },
            },
            colProps: { span: 6 },
          },
          {
            field: 'orgCode',
            label: '申请单位',
            component: 'Select',
            componentProps: {
              options: orgs,
              filterOption: (input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            },
            colProps: { span: 6 },
          },
        ],
        resetFunc: () => {
          if (sessionStorage.getItem('formData_p7')) {
            sessionStorage.removeItem('formData_p7');
          }
        },
        submitFunc: () => {
          if (sessionStorage.getItem('formData_p7')) {
            sessionStorage.removeItem('formData_p7');
          }
          return reload();
        },
      },
      allowNullParams: true,
      beforeFetch: (params) => {
        if (sessionStorage.getItem('formData_p7')) {
          let data = JSON.parse(sessionStorage.getItem('formData_p7') as string);
          params['orgCode'] = data.orgCode;
          params['time'] = data.time;
          params['flag'] = 123;
          getForm().setFieldsValue(data);
        } else {
          params['flag'] = '';
          params['orgCode'] = '';
        }
        if (params.time) {
          const time = Array.isArray(params.time) ? params.time : params.time.split(',');
          params['startDate'] = time[0];
          params['endDate'] = time[1];
          delete params['time'];
        } else {
          params['startDate'] = '';
          params['endDate'] = '';
        }
        return params;
      },
      afterFetch: (res) => {
        console.log(res);
        let resMap: any = {};
        if (res.length > 0) {
          res.forEach((item, index) => {
            let datasource: any = [];
            if (item.workEndTime) {
              item.workEndTime.forEach((citem) => {
                datasource.push({
                  ...citem,
                  unit: '',
                  workUnit: '',
                  workTeam: '',
                  workLocation: '',
                  workType: '',
                  workContent: '',
                });
              });
            }
            resMap[item.id] = datasource;
          });
          console.log(resMap);
          for (var k in resMap) {
            if (resMap[k].length > 0) {
              let idx = res.findIndex(val => val.id == k);
              console.log(idx);
              
              res.splice(idx + 1, 0, ...resMap[k]);
            }
          }
          console.log(res);
          
          columns.forEach((column: any, index) => {
            if (index < 8) {
              column['customCell'] = (_, index) => {
                if (index === 2) {
                  return { rowSpan: 4 };
                }
                // These two are merged into above cell
                if ([3, 4, 5].includes(index)) {
                  return { rowSpan: 0 };
                }

                // if (index === 4) {
                //   return { colSpan: 0 };
                // }
              };
            }
          });
          // setColumns(columns);
        }
        return res;
      },
    },
    exportConfig: {
      name: '危险作业明细-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/ai/cameraManage/export',
    },
  });

  const [registerTable, { setColumns, getForm, reload }] = tableContext;

  return {
    onExportXls,
    registerTable,
  };
};

