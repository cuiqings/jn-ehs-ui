<template>
  <div class="p-2" style="background: #ffffff;height: calc(100vh - 98px);">
    <BasicForm @register="registerForm" @submit="handleSubmit" style="margin-top: 23px; margin-left: 10px" />
    <a-row>
      <a-col :span="24">
        <div class="flex justify-start">
          <a-button type="primary" v-auth="'workrecord:export'" @click="exportExcel(queryParams.value)">导出</a-button>
        </div>
      </a-col>
    </a-row>
    <div class="mt-4"></div>
    <a-table :pagination="false" :columns="columns" :data-source="dataSorce" bordered :scroll="{ x: 1500, y: 'calc(100vh - 400px)' }">
      <template #bodyCell="{ column, text, index }">
        <template v-if="column.dataIndex === 'name'">
          <a href="javascript:;">{{ text }}</a>
        </template>
      </template>
    </a-table>
    <div class="flex justify-end mt-4">
      <pagination
        v-model:current="queryParams.pageNo"
        v-model:pageSize="queryParams.pageSize"
        :page-size-options="pageSizeOptions"
        :total="totalSize"
        :show-total="(totalSize) => `共${totalSize}条`"
        show-size-changer
        show-quick-jumper
        @change="getList"
        @showSizeChange="getList"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useForm, BasicForm, FormSchema } from '/@/components/Form';
  import { Pagination } from 'ant-design-vue';
  import { useData } from './hooks/useData';
  import { ref, nextTick } from 'vue';
  import { workReportDetails } from '../api';
  import { onBeforeUnmount } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';

  const { columns, orgs } = useData();
  const dataSorce = ref<any[]>([]);

  const formSchemas: FormSchema[] = [
    {
      field: 'time',
      label: '作业开始时间',
      component: 'RangeDate',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
      },
    },
    {
      field: 'orgCode',
      label: '申请单位',
      component: 'Select',
      show: false,
      componentProps: {
        options: orgs,
        filterOption: (input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      },
    },
  ];
 
  // 重置
  const customResetFunc = () => {
    queryParams.value = {
      orgCode: '',
      time: '',
      flag: '',
      startDate: '',
      endDate: ''
    };
    getDay();
    handleSubmit(queryParams.value);
  };
  const [registerForm, {setFieldsValue}] = useForm({
    schemas: formSchemas,
    autoSubmitOnEnter: true,
    resetFunc: customResetFunc,
    baseColProps: { span: 6 },
    actionColOptions: { span: 6 },
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  });
  const queryParams = ref({
    orgCode: '',
    time: '',
    flag: '',
  });

  const handleSubmit = (values: any) => {
    sessionStorage.removeItem('formData_p7');
    Object.assign(queryParams.value, values);
    if (!queryParams.value.orgCode) {
      queryParams.value['orgCode'] = '';
    }
    if (queryParams.value.time) {
      const time = Array.isArray(queryParams.value.time) ? queryParams.value.time : queryParams.value.time.split(',');
      queryParams.value['startDate'] = time[0];
      queryParams.value['endDate'] = time[1];
      delete queryParams.value['time'];
    }
    getList();
  };

  const totalSize = ref(0);
  const pageSizeOptions = ref<string[]>(['10', '30', '100']);
  const getList = () => {
    workReportDetails(queryParams.value).then(({ records, total }) => {
      totalSize.value = total;
      let resMap: any = {};
      const data = [];
      const recordsO: any = JSON.parse(JSON.stringify(records));
      // 拼装数据
      records.forEach((item: any, index) => {
        item['index'] = index + 1;
        let datasource: any = [];
        if (item.workEndTime) {
          item.workEndTime.forEach((citem: any, idx: number) => {
            if (citem.unitChild && citem.unitChild.length > 0) {
              citem.unitChild.forEach((c: any, i: number) => {
                c['u_workCheckTimeChild'] = c.workCheckTimeChild;
                c['u_userName'] = c.userName;
                c['u_result'] = c.result;
              });
            }
            if (citem.companyChild && citem.companyChild.length > 0) {
              citem.companyChild.forEach((c: any, i: number) => {
                c['c_workCheckTimeChild'] = c.workCheckTimeChild;
                c['c_userName'] = c.userName;
                c['c_result'] = c.result;
              });
            }

            let key = '';
            if (citem.unitChild && citem.companyChild && citem.unitChild.length > 0 && citem.companyChild.length > 0) {
              if (citem.unitChild.length > citem.companyChild.length) {
                key = 'unitChild';
              } else {
                key = 'companyChild';
              }
            } else if (citem.unitChild && citem.unitChild.length > 0 && (!citem.companyChild || citem.companyChild.length == 0)) {
              key = 'unitChild';
            } else if (citem.companyChild && citem.companyChild.length > 0 && (!citem.unitChild || citem.unitChild.length == 0)) {
              key = 'companyChild';
            }
            if (key) {
              citem[key].forEach((c: any, i: number) => {
                delete c['workStartTime'];
                delete c['workEndTime'];
                datasource.push({
                  ...item,
                  ...citem,
                  ...c,
                  pid: `C_${idx}` + item.id,
                  cid: `C_${idx}_${i}` + item.id,
                });
              });
              if (
                (key != 'unitChild' && citem.unitChild) ||
                (citem.companyChild && citem.unitChild && citem.companyChild.length == citem.unitChild)
              ) {
                citem.unitChild.forEach((c: any, i: number) => {
                  delete c['workStartTime'];
                  delete c['workEndTime'];
                  Object.assign(
                    datasource.find((d) => d.cid == `C_${idx}_${i}` + item.id),
                    c
                  );
                });
              }
              if (
                (key != 'companyChild' && citem.companyChild) ||
                (citem.companyChild && citem.unitChild && citem.companyChild.length == citem.unitChild)
              ) {
                citem.companyChild.forEach((c: any, i: number) => {
                  delete c['workStartTime'];
                  delete c['workEndTime'];
                  Object.assign(
                    datasource.find((d) => d.cid == `C_${idx}_${i}` + item.id),
                    c
                  );
                });
              }
            } else {
              datasource.push({
                ...item,
                ...citem,
              });
            }
          });
        } else {
          datasource.push({
            ...item,
          });
        }
        data.push(...datasource);
      });
      // 合并单元格 信息
      let spanMap = {};
      recordsO.forEach((item: any, index: number) => {
        let rowSpan = 0;
        let rowSpanC = 0;
        if (item.workEndTime) {
          item.workEndTime.forEach((citem: any, idx: number) => {
            if ((citem.unitChild && citem.unitChild.length > 0) || (citem.companyChild && citem.companyChild.length > 0)) {
              let num = 0;
              if (citem.unitChild && citem.companyChild) {
                num = Math.max(citem.unitChild.length, citem.companyChild.length);
                rowSpan += num;
              }
              if (citem.unitChild && citem.unitChild.length > 0 && !citem.companyChild) {
                num = citem.unitChild.length;
                rowSpan += num;
              }
              if (citem.companyChild && citem.companyChild.length > 0 && !citem.unitChild) {
                num = citem.companyChild.length;
                rowSpan += num;
              }
              if (!spanMap[item.id]) {
                spanMap[item.id] = {
                  rowSpan: 0,
                  rowSpanC: {},
                };
              }
              if (spanMap[item.id] && spanMap[item.id].rowSpanC) {
                spanMap[item.id].rowSpanC[`C_${idx}` + item.id] = num;
              } else {
                spanMap[item.id] = {
                  rowSpanC: { [`C_${idx}` + item.id]: num },
                };
              }
            } else {
              rowSpan += 1;
              if (spanMap[item.id] && spanMap[item.id].rowSpanC) {
                spanMap[item.id].rowSpanC[`C_${idx}` + item.id] = 1;
              } else {
                spanMap[item.id] = {
                  rowSpanC: { [`C_${idx}` + item.id]: 1 },
                };
              }
            }
          });
          if (!spanMap[item.id]) {
            spanMap[item.id] = {
              rowSpan: rowSpan,
              rowSpanC: {},
            };
          } else {
            spanMap[item.id]['rowSpan'] = rowSpan;
          }
        }
      });
      columns.forEach((column: any, cindex) => {
        if (cindex < 8) {
          column['customCell'] = (row, rindex) => {
            if (!spanMap[row.id]) {
              return { rowSpan: 1 };
            }
            if (spanMap[row.id] && rindex == data.findIndex((item: any) => item.id == row.id)) {
              return { rowSpan: spanMap[row.id].rowSpan };
            }
            if (rindex < rindex + spanMap[row.id].rowSpan) {
              return { rowSpan: 0 };
            }
          };
        }
        if (cindex >= 8 && cindex < 10) {
          let midx = 0;
          let span = { rowSpan: 1 };
          column['customCell'] = (row, rindex) => {
            if (!spanMap[row.id]) {
              return { rowSpan: 1 };
            }
            Object.keys(spanMap[row.id].rowSpanC).forEach((key) => {
              if (rindex == data.findIndex((item: any) => item.pid == key)) {
                midx = rindex;
                span = { rowSpan: spanMap[row.id].rowSpanC[key] };
              }
            });
            if (rindex == midx) {
              return span;
            }
            if (rindex > midx && rindex < midx + span.rowSpan) {
              return { rowSpan: 0 };
            }
          };
        }
      });
      dataSorce.value = data;
    });
  };

  const pageInit = () => {
    // 初始化作业开始时间为当天
    queryParams.value['time'] = getDay();
    if (sessionStorage.getItem('formData_p7')) {
      let data = JSON.parse(sessionStorage.getItem('formData_p7') as string);
      queryParams.value['orgCode'] = data.orgCode;
      queryParams.value['time'] = data.time;
      queryParams.value['flag'] = 123;
      setFieldsValue({
        time: data.time,
        orgCode: data.orgCode
      })
    } else {
      queryParams.value['flag'] = '';
      queryParams.value['orgCode'] = '';
    }
    if (queryParams.value.time) {
      const time = Array.isArray(queryParams.value.time) ? queryParams.value.time : queryParams.value.time.split(',');
      queryParams.value['startDate'] = time[0];
      queryParams.value['endDate'] = time[1];
    } else {
      queryParams.value['startDate'] = '';
      queryParams.value['endDate'] = '';
    }
    getList();
  };

  // 获取近日期
function getDay (){
  const date = new Date();
  const startDate = dateFormat(date, 'yyyy-MM-dd');
  const endDate = dateFormat(date, 'yyyy-MM-dd');
  let time = startDate + ',' + endDate;
  setFieldsValue({
    time: time
  })
  return time;
};

  nextTick(() => {
    pageInit();
  })
  onBeforeUnmount(() => {
    sessionStorage.removeItem('formData_p7');
  });
  const exportExcel = () => {
    const { handleExportXls } = useMethods();
    let params = queryParams.value;
    handleExportXls('危险作业明细-' + dateFormat(new Date(), 'yyyy-MM-dd'), '/workStatistics/workReportDetailsExport', params);
  };
</script>

<style lang="scss" scoped></style>
