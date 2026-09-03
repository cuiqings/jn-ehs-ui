<template>
  <div>
    <a-tabs v-model:activeKey="activeTab" class="inspection-tabs" @change="handleTabChange">
      <a-tab-pane key="plan" tab="点检计划">
        <div class="plan-content">
          <BasicTable :rowSelection="rowSelection" @register="registerPlanTable">
            <template #tableTitle>
              <a-button v-auth="'dehydratorInspection:add'" type="primary" @click="handleAddPlan">新增</a-button>
              <a-button
                v-if="selectedRowKeys.length > 0"
                v-auth="'dehydratorInspection:del'"
                preIcon="ant-design:delete-outlined"
                @click="batchHandleDeletePlan"
              >
                批量删除
              </a-button>
              <a-button v-if="selectedRowKeys.length > 0" v-auth="'dehydratorInspection:mergerPlan'" type="primary" @click="handleMergerPlan"
                >合并计划
              </a-button>
            </template>
            <template #planStatus="{ record }">
              <a-tag :color="record.planStatus === '1' ? 'green' : 'orange'">
                {{ record.planStatus === '1' ? '已发布' : '待发布' }}
              </a-tag>
            </template>
            <template #checkFrequency="{ record }">
              {{
                record.checkFrequency === '1'
                  ? '每2小时'
                  : record.checkFrequency === '2'
                  ? '每3小时'
                  : record.checkFrequency === '3'
                  ? '每4小时'
                  : record.checkFrequency === '4'
                  ? '每6小时'
                  : ''
              }}
            </template>
            <template #action="{ record }">
              <TableAction :actions="getPlanActions(record)" />
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>

      <a-tab-pane key="record" tab="点检记录">
        <div>
          <!-- 统计信息 -->
          <div style="display: flex; gap: 10px; margin: 10px">
            <div>
              <a-card style="width: 220px; text-align: center; border-radius: 8px">
                <template #title>检查情况</template>
                <div>
                  <span style="font-size: 32px; color: #1890ff; font-weight: 600">{{ statistics.checkedCount }}</span>
                  <div>已检查</div>
                </div>
                <div>
                  <span style="font-size: 32px; color: #ff4d4f; font-weight: 600">{{ statistics.uncheckedCount }}</span>
                  <div>未检查</div>
                </div>
              </a-card>
              <a-card style="width: 220px; text-align: center; margin-top: 10px; border-radius: 8px">
                <template #title>完成率</template>
                <div style="font-size: 32px; color: #1890ff; font-weight: 600">{{ statistics.completionRate }}%</div>
              </a-card>
            </div>
            <!-- 柱状图统计（ECharts） -->
            <a-card style="margin-bottom: 0; width: calc(100% - 230px); border-radius: 8px">
              <template #title>
                <div style="display: flex; align-items: center; justify-content: space-between">
                  <span>各事业部检查完成率对比</span>
                  <div>单位：
                    <a-select style="width: 200px" v-model:value="orgCode" @change="orgCodeChange" placeholder="请选择" :allowClear="true">
                      <a-select-option v-for="(item, index) in orgList" :value="item.value" :key="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select></div>
                  <div>任务时间：<a-range-picker v-model:value="dateRange" valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" /></div>
                </div>
              </template>
              <a-spin :spinning="chartLoading">
                <div ref="chartRef" style="width: 100%; height: 312px"></div>
              </a-spin>
            </a-card>
          </div>
          <BasicTable @register="registerRecordTable">
            <template #status="{ record }">
              <a-tag :color="record.status === '1' ? 'green' : 'orange'">
                {{ record.status === '1' ? '已检查' : '未检查' }}
              </a-tag>
            </template>
            <template #action="{ record }">
              <TableAction :actions="getRecordActions(record)" />
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
  <dehydratorInspectionDrawer @register="registerDrawer" @success="handleSuccess" />
  <examineDrawer
    @register="registerExamineDrawer"
    @success="
      () => {
        recordFormContext.reload();
        statisticsTaskFn();
        statisticsBusinessDepartFn();
      }
    "
  />
</template>
<script lang="ts" name="socialFacilitiesManage-dehydratorInspection" setup>
  import { ref, nextTick, onMounted, watch } from 'vue';
  import { BasicTable, TableAction, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import * as echarts from 'echarts';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDepart3ListWithSecurity, getDepartmentList, selectDeptNew } from '/@/api/common/api';
  import { useDrawer } from '/@/components/Drawer';
  import dehydratorInspectionDrawer from './drawer.vue';
  import examineDrawer from './examineDrawer.vue';
  import { list, del, batchDel, recordList, statisticsTask, statisticsBusinessDepart } from './api';
  import dayjs from 'dayjs';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerExamineDrawer, { openDrawer: openExamineDrawer }] = useDrawer();
  const { createMessage } = useMessage();
  // 活动标签页
  const activeTab = ref('plan');
  // 统计数据
  const statistics = ref({
    checkedCount: 0,
    uncheckedCount: 0,
    completionRate: 0,
  });
  // 默认本月：从月初到月末
  const dateRange = ref([dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')]);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const orgList: any = ref([]);
  const orgCode: any = ref(undefined);
  // 图表相关
  const chartRef = ref(null);
  const chartLoading = ref(false);
  // 点检计划表格列配置
  const planColumns = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      dataIndex: 'departName',
    },
    {
      title: '脱水器编号',
      dataIndex: 'code',
    },
    {
      title: '巡检责任人',
      dataIndex: 'checkDutyPersonName',
    },
    {
      title: '检查频次',
      dataIndex: 'checkFrequency',
      slots: { customRender: 'checkFrequency' },
    },
    {
      title: '计划状态',
      dataIndex: 'planStatus',
      slots: { customRender: 'planStatus' },
    },
  ];
  // 点检计划搜索表单配置
  const planSearchFormSchema: FormSchema[] = [
    {
      field: 'org',
      label: '所属单位',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'depart',
      label: '所属车间',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'code',
      label: '脱水器编号',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      field: 'planStatus',
      label: '计划状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '已发布', value: '1' },
          { label: '待发布', value: '0' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  // 点检记录表格列配置
  const recordColumns = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      dataIndex: 'departName',
    },
    {
      title: '脱水器编号',
      dataIndex: 'code',
    },
    {
      title: '任务时间',
      dataIndex: 'taskTime',
    },
    {
      title: '检查状态',
      dataIndex: 'status',
      slots: { customRender: 'status' },
    },
    {
      title: '异常个数',
      dataIndex: 'yhCount',
    },
    {
      title: '检查时间',
      dataIndex: 'checkTime',
    },
    {
      title: '检查人',
      dataIndex: 'checkPersonName',
    },
  ];
  // 点检记录搜索表单配置
  const recordSearchFormSchema: FormSchema[] = [
    {
      field: 'org',
      label: '所属单位',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'depart',
      label: '所属车间',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'code',
      label: '脱水器编号',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      field: 'checkTime',
      label: '检查时间',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'checkPersonName',
      label: '检查人',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      field: 'status',
      label: '检查状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '未检查', value: '0' },
          { label: '已检查', value: '1' },
        ],
        allowClear: true,
      },
      colProps: { span: 6 },
    },
  ];

  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      orgList.value = orgOptions.value;
      init(planFormContext);
    });
  });
  // 点检计划表格
  const { tableContext: planTableContext, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns: planColumns,
      formConfig: {
        schemas: planSearchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            planFormContext.getForm().updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
          }
        },
      },
      immediate: false,
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.org = orgOptions.value[0].value;
          planFormContext.getForm().setFieldsValue({
            org: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  // 点检记录表格
  const { tableContext: recordTableContext } = useListPage({
    tableProps: {
      api: recordList,
      columns: recordColumns,
      formConfig: {
        schemas: recordSearchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            recordFormContext.getForm().updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
          }
        },
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.org = orgOptions.value[0].value;
          recordFormContext.getForm().setFieldsValue({
            org: orgOptions.value[0].value,
          });
        }
        if (params.checkTime) {
          params.checkTime = params.checkTime + ' 00:00:00';
        }
        return params;
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerPlanTable, planFormContext, { rowSelection, selectedRowKeys, selectedRows }] = planTableContext;
  const [registerRecordTable, recordFormContext] = recordTableContext;
  const init = (type) => {
    type.getForm().updateSchema({
      field: 'org',
      componentProps: {
        options: orgOptions.value,
        disabled: orgOptions.value.length === 1,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        onChange: (value) => {
          type.getForm().setFieldsValue({
            depart: undefined,
          });
          type.getForm().updateSchema({
            field: 'depart',
            componentProps: {
              options: [],
            },
          });
          if (value) {
            getDepartList(value, type);
          }
        },
      },
    });
    if (orgOptions.value.length === 1) {
      type.getForm().setFieldsValue({
        org: orgOptions.value[0]?.value,
      });
      getDepartList(orgOptions.value[0].value, type);
    }
    type.reload();
    if (activeTab.value === 'record') {
      refreshStatistics();
    }
  };
  // 统计检查情况、检查完成率
  const statisticsTaskFn = () => {
    return statisticsTask({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    }).then((res) => {
      statistics.value = {
        checkedCount: res['已检查'],
        uncheckedCount: res['未检查'],
        completionRate: res['完成率'],
      };
    });
  };
  // 各事业部检查完成率对比
  const statisticsBusinessDepartFn = () => {
    return statisticsBusinessDepart({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      orgCode: orgCode.value,
    }).then((res) => {
      if (chartRef.value) {
        const chart = echarts.init(chartRef.value);
        const echartsOption = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              const colors = [
                '#1890ff',
                '#13c2c2',
                '#faad14',
                '#fa541c',
                '#52c41a',
                '#eb2f96',
                '#722ed1',
                '#f5222d',
                '#a0d911',
                '#fa8c16',
                '#b37feb',
                '#36cfc9',
                '#ffec3d',
              ];
              const param = params[0];
              const color = colors[param.dataIndex % colors.length];
              return `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color}"></span>${param.name}: ${param.value}%`;
            },
          },
          grid: {
            top: 20,
            left: 0,
            right: 0,
            bottom: 0,
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: res.names,
            axisLabel: {
              rotate: 20,
              fontSize: 12,
            },
          },
          yAxis: {
            type: 'value',
            max: 100,
            min: 0,
            axisLabel: {
              formatter: '{value}%',
            },
          },
          series: [
            {
              type: 'bar',
              data: res.datas,
              itemStyle: {
                color: function (params) {
                  const colors = [
                    '#1890ff',
                    '#13c2c2',
                    '#faad14',
                    '#fa541c',
                    '#52c41a',
                    '#eb2f96',
                    '#722ed1',
                    '#f5222d',
                    '#a0d911',
                    '#fa8c16',
                    '#b37feb',
                    '#36cfc9',
                    '#ffec3d',
                  ];
                  return colors[params.dataIndex % colors.length];
                },
              },
              label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
              },
            },
          ],
        };
        chart.setOption(echartsOption);
        window.addEventListener('resize', () => chart.resize());
      }
    });
  };

  // 根据当前时间范围刷新统计（带 loading）
  const refreshStatistics = () => {
    chartLoading.value = true;
    Promise.all([statisticsTaskFn(), statisticsBusinessDepartFn()])
      .catch(() => {
        // 请求失败时不抛出到外面
      })
      .finally(() => {
        chartLoading.value = false;
      });
  };
  // 车间
  const getDepartList = (orgCode, type) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      type.getForm().updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
  };
  // 点检计划操作
  const getPlanActions: any = (record) => {
    return [
      {
        label: '编辑',
        auth: ['dehydratorInspection:edit'],
        onClick: () => handleEditPlan(record),
      },
      {
        label: '删除',
        auth: ['dehydratorInspection:del'],
        color: 'error',
        onClick: () => handleDeletePlan(record),
      },
      // {
      //   label: '发布',
      //   auth: ['dehydratorInspection:publish'],
      //   onClick: () => handlePublishPlan(record),
      // },
      {
        label: '查看',
        onClick: () => handleViewPlan(record),
      },
    ];
  };
  const handleAddPlan = () => {
    openDrawer(true, {
      title: '新增点检计划',
      type: 'add',
      showOkBtn: true,
    });
  };
  const handleEditPlan = (record) => {
    openDrawer(true, {
      title: '编辑点检计划',
      type: 'edit',
      showOkBtn: true,
      mergeFlag: record.mergeFlag,
      record,
    });
  };
  const handleViewPlan = (record) => {
    openDrawer(true, {
      title: '查看点检计划',
      type: 'view',
      showOkBtn: false,
      mergeFlag: record.mergeFlag,
      record,
    });
  };
  const handleMergerPlan = () => {
    const isSameOrg = selectedRows.value.every((item) => item.org === selectedRows.value[0].org);
    const isSameDepart = selectedRows.value.every((item) => item.depart === selectedRows.value[0].depart);
    if (!isSameOrg || !isSameDepart) {
      createMessage.warning('只能合并相同单位和车间的计划！');
      return;
    }
    const codes = selectedRows.value.map((item) => item.code).join(',');
    const org = selectedRows.value[0].org;
    const depart = selectedRows.value[0].depart;
    const departName = selectedRows.value[0].departName;
    if (codes.length > 2000) {
      createMessage.warning('脱水器编号超出限制，请分开合并！');
      return;
    }
    openDrawer(true, {
      title: '合并计划',
      type: 'mergerPlan',
      showOkBtn: true,
      mergeFlag: true,
      mergeIds: selectedRowKeys.value.join(','),
      data: {
        codes,
        org,
        depart,
        departName,
      },
    });
  };
  const handleDeletePlan = (record) => {
    operateRequest(() => del({ id: record.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  const batchHandleDeletePlan = () => {
    operateRequest(() => batchDel({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const getRecordActions = (record) => {
    return [
      {
        label: '查看',
        onClick: () => handleViewRecord(record),
      },
      // {
      //   label: '检查',
      //   ifShow: () => record.status === '0',
      //   auth: ['dehydratorInspection:check'],
      //   onClick: () => handleDoInspection(record),
      // },
    ];
  };
  const handleViewRecord = (record) => {
    openExamineDrawer(true, {
      title: '查看记录',
      type: 'view',
      showOkBtn: false,
      record,
    });
  };
  // const handleDoInspection = (record) => {
  //   openExamineDrawer(true, {
  //     title: '执行检查',
  //     type: 'check',
  //     showOkBtn: true,
  //     record,
  //   });
  // };
  // 监听标签页切换
  const handleTabChange = (key) => {
    activeTab.value = key;
    if (key === 'record') {
      nextTick(() => {
        init(recordFormContext);
      });
    } else {
      init(planFormContext);
    }
  };
  const handleSuccess = () => {
    planFormContext.reload();
    selectedRowKeys.value = [];
  };

  // 时间范围变化时，自动刷新统计（仅在记录 tab 下）
  watch(
    dateRange,
    () => {
      if (activeTab.value === 'record') {
        refreshStatistics();
      }
    },
    { deep: true }
  );
  function orgCodeChange(val) {
    refreshStatistics();
  }
</script>

<style scoped lang="less">
  :deep(.ant-tabs-nav) {
    margin: 10px 10px 0 !important;
    background-color: #fff;
    padding: 0 10px 5px;
  }

  :deep(.jeecg-basic-table-form-container) {
    padding: 0 10px 10px !important;
  }
</style>
