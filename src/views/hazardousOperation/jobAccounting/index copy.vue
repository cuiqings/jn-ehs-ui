<template>
  <div class="jobAccounting">
    <div class="inner">
      <div class="top">
        <TopHeader :listData="applicantData" @change="getTypeStatusData" title="危险作业类型与状态统计" />
        <div class="t-b">
          <BarMutil ref="barMutilRef" />
          <div class="right">
            <div class="rosebar" ref="roseBar"></div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <BasicTable @register="registerTable">
          <template #applicationTimeStr="{ record }"
            >{{ record.workStartTime && record.workStartTime.substr(0, 10) }}至{{ record.workEndTime && record.workEndTime.substr(0, 10) }}</template
          >
          <template #workState="{ text }">
            <span :class="{ red: text == '验收退回', yellow: text == '作业中' }">{{ text }}</span>
          </template>
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </div>
    </div>
    <DetailDrawer @register="register" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, onMounted, ref, Ref } from 'vue';
  import BarMutil from './components/barMutil.vue';
  import TopHeader from './components/topHeader.vue';
  import { getApplicantData, workStatisticsListData, getDepart3List, getOrganizationNew, getTypeAndStateData } from './jobAccounting.api';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { ActionItem, BasicColumn, BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { getDerive } from '../api';
  import { saveAs } from 'file-saver';
  import DetailDrawer from '../detail/detailDaver.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const userStore = useUserStore();

  const [register, { openDrawer }] = useDrawer();
  const columns: BasicColumn[] = [
    {
      title: '作业状态',
      dataIndex: 'workState',
      slots: { customRender: 'workState' },
    },
    {
      title: '作业单位',
      dataIndex: 'applicationUnitName',
    },
    {
      title: '作业车间',
      dataIndex: 'workUnitName',
    },
    {
      title: '作业班组',
      dataIndex: 'workTeam',
    },
    {
      title: '作业类型',
      dataIndex: 'workType',
    },
    {
      title: '作业等级',
      dataIndex: 'workGrade',
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
    },

    {
      title: '作业负责人',
      dataIndex: 'workHead',
    },
    {
      title: '现场监护人',
      dataIndex: 'workGuardian',
    },
    {
      title: '作业时间',
      width: 220,
      dataIndex: 'applicationTimeStr',
      slots: { customRender: 'applicationTimeStr' },
    },
    {
      title: '安全作业检查',
      dataIndex: 'result',
    },
  ];
  //表单搜索字段
  //@ts-ignore
  const searchFormSchema: FormSchema[] = [
    {
      label: '作业状态',
      field: 'state',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '审批中', value: '1' },
          { label: '待作业', value: '2' },
          { label: '作业中', value: '3' },
          { label: '待验收', value: '4' },
          { label: '已验收', value: '5' },
          { label: '验收退回', value: '6' },
          { label: '作业中断', value: '7' },
          { label: '已超时', value: '8' },
        ],
        class: 'work-apply-select',
      },
      colProps: {
        span: 6,
      },
    },
    {
      label: '作业单位',
      field: 'applicationUnit',
      component: 'JDictSelectTag',
      componentProps: {
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        type: 'select',
        onChange: async (value) => {
          getForm().setFieldsValue({
            workUnit: '',
          });
          if (value) {
            getOrg3(value);
          } else {
            getForm().updateSchema({
              field: 'workUnit',
              componentProps: {
                options: [],
              },
            });
          }
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '作业车间',
      field: 'workUnit',
      component: 'JDictSelectTag',
      componentProps: {
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        type: 'select',
      },
      colProps: { span: 6 },
    },
    {
      label: '作业类型',
      field: 'workType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        class: 'work-apply-select',
        options: userStore.getAllDictItems.work_type,
      },
      colProps: { span: 6 },
    },
    {
      label: '作业内容',
      field: 'workContent',
      component: 'Input',
      componentProps: {
        placeholder: '请输入关键字',
      },
      colProps: { span: 6 },
    },
    {
      label: '作业时间',
      field: 'start',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        placeholder: ['开始时间', '结束时间'],
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '安全作业检查',
      field: 'result',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        mode: 'multiple',
        class: 'work-apply-select',
        options: [
          { label: '合格', value: 1 },
          { label: '不合格', value: 2 },
        ],
      },
      colProps: { span: 6 },
    },
  ];

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      api: workStatisticsListData,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          if (orgList.value.length == 1) {
            getForm().setFieldsValue({
              applicationUnit: orgList.value[0].value,
            });
            // getOrg3(orgOptions[0].value);
          }
        },
      },
      beforeFetch: (params) => {
        delete params['column'];
        delete params['order'];
        if (params.start) {
          const time = params.start.split(',');
          params['startTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['start'];
        }
        if (route?.query?.state && !params.state) {
          getForm().setFieldsValue({
            state: route.query.state,
          });
          params.state = route.query.state;
        }
        if (route?.query?.orgCode && !params.applicationUnit) {
          getForm().setFieldsValue({
            applicationUnit: route.query.orgCode,
          });
          params.applicationUnit = route.query.orgCode;
        }
        return params;
      },
      immediate: false,
      showIndexColumn: true,
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });

  pageInit();
  function pageInit() {
    let orgOptions = [];
    getOrganizationNew({}).then((res) => {
      orgOptions = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      orgList.value = orgOptions;
      getForm().updateSchema({
        field: 'applicationUnit',
        componentProps: {
          options: orgOptions,
          disabled: orgOptions.length == 1,
        },
      });
      if (orgOptions.length == 1) {
        getForm().setFieldsValue({
          applicationUnit: orgOptions[0].value,
        });
        getOrg3(orgOptions[0].value);
      }
      reload();
    });
  }

  function getOrg3(code) {
    getDepart3List({ orgCode: code }).then((res) => {
      let options = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'workUnit',
        componentProps: {
          options: options,
        },
      });
    });
  }
  //BasicTable绑定注册
  const [registerTable, { getForm, reload }] = tableContext;
  const orgList = ref<any[]>([]);
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '导出作业票',
        onClick: handleExporta.bind(null, record),
        ifShow: () => record.workState == '已验收',
      },
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
    ];
  }

  async function handleExporta(record) {
    const res = await getDerive({ id: record.id });
    var reader = new FileReader();
    reader.onload = function (event) {
      //@ts-ignore
      var textData = event.target.result; //@ts-ignore
      if (!JSON.parse(textData).success) message.error(JSON.parse(textData).message); //@ts-ignore
      if (JSON.parse(textData).success) message.success(JSON.parse(textData).message);
    };
    reader.readAsText(res.data); // 这里的 blobData 是从响应中获取的 Blob 数据
    const fileName = decodeURIComponent(res.headers['content-disposition'].split('=')[1]);
    // const binaryData = new Uint8Array([res.data]);
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  }

  function handleView(record) {
    openDrawer(true, {
      id: record.id,
      title: record.workType,
    });
  }

  const applicantData = ref<any[]>([]);
  const barMutilRef = ref<HTMLDivElement | null>(null);

  onMounted(async () => {
    // applicantData.value = [];
    let res = await getDepart3ListWithSecurity();
    if (applicantData.value.length > 0) {
      applicantData.value = [];
    }
    applicantData.value.push(...res);
  });

  const getTypeStatusData = (val: any) => {
    if (applicantData.value.length == 1) {
      barMutilRef.value?.getData(val);
    } else {
      barMutilRef.value?.getData('A04');
    }
    getRoseData(val);
  };

  // 玫瑰图
  const roseBar = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(roseBar as Ref<HTMLDivElement>);
  const getRoseData = async (value) => {
    let data = await getTypeAndStateData({ applicant: value }).catch((err) => (loading.value = false));
    roseInit(data);
  };
  const roseInit = (data) => {
    let legend: string[] = [];
    let colors = ['#ffdb5c', '#67e0e3', '#37a2da', '#e062ae', '#ff9f7f'];
    let series: any = [];
    if (data.series.length > 0) {
      data.series.forEach((val) => {
        legend.push(val.name);
        series.push({
          type: 'bar',
          data: val.data,
          coordinateSystem: 'polar',
          name: val.name,
          stack: 'a',
          emphasis: {
            focus: 'series',
          },
          label: {
            show: true,
            position: 'middle',
            formatter: (params) => {
              return !params.data ? '' : params.data;
            },
          },
        });
      });
    }

    let option = {
      tooltip: {
        show: true,
        formatter: '{a}: {c}',
      },
      grid: {
        top: 150,
      },
      radiusAxis: {},
      polar: {
        radius: [20, '80%'],
        center: ['55%', '55%'],
      },
      legend: {
        x: 'center',
        data: legend,
      },
      calculable: true,
      // label: {
      //   formatter: (params) => {
      //     return params.name.split('：')[1];
      //   },
      // },
      angleAxis: {
        type: 'category',
        data: data.xAxis,
      },
      series: series,
    };

    setOptions(option);
  };
</script>

<style lang="less" scoped>
  .jobAccounting {
    height: 100%;
    padding: 10px;
    .inner {
      width: 100%;
      height: 100%;
      padding: 15px;
      background-color: #fff;
      flex-direction: column;
      display: flex;
      justify-content: space-between;
    }
    .top,
    .bottom {
      padding: 0 10px;
      height: auto;
      border: 1px solid rgba(215, 215, 215, 1);
      display: flex;
      flex-direction: column;
    }
    .top {
      height: calc(50% - 7.5px);
    }
  }
  .red {
    color: #ff4d4f;
  }
  .yellow {
    color: orange;
  }
  .t-b {
    display: flex;
    .right {
      width: 520px;
      height: 100%;
      .rosebar {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
