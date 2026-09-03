<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #chartContent>
        <div style="margin: 16px 0">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-card :bordered="false">
                <div class="progress-card">
                  <div class="card-title">各事业部部长签署进度</div>
                  <div class="card-value" :style="{ color: getProgressColor(statisticsData.bzRate) }">
                    {{ statisticsData.bzFinishCount }} <span class="separator">/</span>
                    <span class="total">{{ statisticsData.bzCount }}</span>
                  </div>
                  <a-progress :percent="statisticsData.bzRate" :show-info="false" :stroke-color="getProgressColor(statisticsData.bzRate)" />
                  <div class="card-footer" style="margin-top: 8px">
                    <span>完成率</span>
                    <span :style="{ color: getProgressColor(statisticsData.bzRate), fontWeight: 'bold' }">{{ statisticsData.bzRate }}%</span>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false">
                <div class="progress-card">
                  <div class="card-title">科段级干部签署进度</div>
                  <div class="card-value" :style="{ color: getProgressColor(statisticsData.kdjRate) }">
                    {{ statisticsData.kdjFinishCount }} <span class="separator">/</span>
                    <span class="total">{{ statisticsData.kdjCount }}</span>
                  </div>
                  <a-progress :percent="statisticsData.kdjRate" :show-info="false" :stroke-color="getProgressColor(statisticsData.kdjRate)" />
                  <div class="card-footer" style="margin-top: 8px">
                    <span>完成率</span>
                    <span :style="{ color: getProgressColor(statisticsData.kdjRate), fontWeight: 'bold' }">{{ statisticsData.kdjRate }}%</span>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false">
                <div class="progress-card">
                  <div class="card-title">班组长签署进度</div>
                  <div class="card-value" :style="{ color: getProgressColor(statisticsData.bzzRate) }">
                    {{ statisticsData.bzzFinishCount }} <span class="separator">/</span>
                    <span class="total">{{ statisticsData.bzzCount }}</span>
                  </div>
                  <a-progress :percent="statisticsData.bzzRate" :show-info="false" :stroke-color="getProgressColor(statisticsData.bzzRate)" />
                  <div class="card-footer" style="margin-top: 8px">
                    <span>完成率</span>
                    <span :style="{ color: getProgressColor(statisticsData.bzzRate), fontWeight: 'bold' }">{{ statisticsData.bzzRate }}%</span>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :span="6">
              <a-card :bordered="false">
                <div class="progress-card">
                  <div class="card-title">一般员工签署进度</div>
                  <div class="card-value" :style="{ color: getProgressColor(statisticsData.ygRate) }">
                    {{ statisticsData.ygFinishCount }} <span class="separator">/</span>
                    <span class="total">{{ statisticsData.ygCount }}</span>
                  </div>
                  <a-progress :percent="statisticsData.ygRate" :show-info="false" :stroke-color="getProgressColor(statisticsData.ygRate)" />
                  <div class="card-footer" style="margin-top: 8px">
                    <span>完成率</span>
                    <span :style="{ color: getProgressColor(statisticsData.ygRate), fontWeight: 'bold' }">{{ statisticsData.ygRate }}%</span>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </template>
      <template #tableTitle>
        <a-button @click="handleExport">导出</a-button>
        <a-button type="primary" @click="handleBatchSign">监督人批量签署</a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
        </template>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <SignModal @register="registerSignModal" @success="handleSuccess" />
    <BatchSignModal @register="registerBatchSignModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup name="safetyCommitment-sign">
  import { ref, onMounted, computed } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getCommitmentList, exportCommitment, getCommitmentStatistics } from './api';
  import { getDepart3ListWithSecurity, downloadFileAll } from '/@/api/common/api';
  import SignModal from './SignModal.vue';
  import BatchSignModal from './BatchSignModal.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  interface StatisticsData {
    bzFinishCount?: number;
    bzCount?: number;
    bzRate?: number;
    kdjFinishCount?: number;
    kdjCount?: number;
    kdjRate?: number;
    bzzFinishCount?: number;
    bzzCount?: number;
    bzzRate?: number;
    ygFinishCount?: number;
    ygCount?: number;
    ygRate?: number;
  }
  const statisticsData = ref<StatisticsData>({});

  const getUnitOptions = () => {
    getDepart3ListWithSecurity().then((res) => {
      const options = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options,
        },
      });
    });
  };

  onMounted(() => {
    let orgCode = userInfo.value?.orgCode || '';
    if (orgCode.length > 9) {
      orgCode = orgCode.substring(0, 9);
    }
    getStatisticsData(orgCode);
    getUnitOptions();
  });

  // 获取进度条颜色
  const getProgressColor = (rate?: number) => {
    return (rate === 100) ? '#52c41a' : '#faad14';
  };

  // 获取统计数据
  const getStatisticsData = (orgCode: string) => {
    getCommitmentStatistics({ orgCode }).then((res) => {
      statisticsData.value = res || {};
    });
  };

  // --- Search Form Schema ---
  const searchFormSchema: FormSchema[] = [
    {
      field: 'orgCode',
      label: '承诺单位',
      component: 'Select',
      componentProps: {
        options: [],
        onChange: (e: any) => {
          getStatisticsData(e);
        },
      },
      colProps: { span: 5 },
    },
    {
      field: 'status',
      label: '签署状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '待承诺人签署', value: '1' },
          { label: '待监督人签字', value: '2' },
          { label: '签署完成', value: '3' },
        ],
      },
      colProps: { span: 5 },
    },
    {
      field: 'userName',
      label: '承诺人',
      component: 'Input',
      colProps: { span: 5 },
    },
  ];

  // --- Table Configuration ---
  const columns: BasicColumn[] = [
    { title: '序号', dataIndex: 'index', width: 60, customRender: ({ index }) => index + 1 },
    { title: '年度', dataIndex: 'year', width: 90 },
    { title: '承诺单位', dataIndex: 'promiseUnit' },
    {
      title: '岗位层级',
      dataIndex: 'postLevel',
      customRender: ({ text }) => {
        if (text === '1') {
          return '各事业部部长';
        } else if (text === '2') {
          return '科段级干部';
        } else if (text === '3') {
          return '班组长';
        } else if (text === '4') {
          return '一般员工';
        } else {
          return '未知';
        }
      },
    },
    { title: '承诺人', dataIndex: 'userName' },
    { title: '监督人', dataIndex: 'supervisorUserName' },
    { title: '承诺时间', dataIndex: 'commitmentTime' },
    { title: '签署状态', dataIndex: 'status', key: 'status' },
  ];

  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '',
      api: getCommitmentList,
      columns,
      useSearchForm: true,
      formConfig: {
        labelWidth: 80,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
      },
      showTableSetting: false,
      bordered: true,
      showIndexColumn: false,
      actionColumn: {
        width: 150,
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        slots: { customRender: 'action' },
      },
    },
  });
  const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const [registerSignModal, { openModal: openSignModal }] = useModal();
  const [registerBatchSignModal, { openModal: openBatchSignModal }] = useModal();

  function handleExport() {
    // 需要勾选数据
    if (selectedRowKeys.value.length === 0) {
      createMessage.warning('请选择要导出的数据');
      return;
    }
    let params = {};
    if (selectedRowKeys.value && selectedRowKeys.value.length > 0) {
      params['idList'] = selectedRowKeys.value;
    }
    exportCommitment(params)
      .then((data) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', `安全承诺书-${dateFormat(new Date(), 'yyyy-MM-dd')}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); //下载完成移除元素
        window.URL.revokeObjectURL(url); //释放掉blob对象
      })
      .catch(() => {
        createMessage.error('导出失败');
      });
  }

  const getStatusColor = (status: string) => {
    if (status == '1') return 'orange';
    if (status == '2') return 'blue';
    if (status == '3') return 'green';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    if (status == '1') return '待承诺人签署';
    if (status == '2') return '待监督人签字';
    if (status == '3') return '签署完成';
    return '未知';
  };

  const getActions = (record: any) => {
    return [
      {
        label: '签署承诺',
        onClick: () => handleSign(record),
        ifShow: record.status == '1' && record.userPermission,
      },
      {
        label: '监督签字',
        onClick: () => handleSupervisorSign(record),
        ifShow: record.status == '2' && record.supervisorPermission,
      },
      {
        label: '查看详情',
        onClick: () => handleView(record),
      },
    ];
  };

  const handleSign = (record: any) => {
    openSignModal(true, { record, type: '1' });
  };

  const handleSupervisorSign = (record: any) => {
    openSignModal(true, { record, type: '2' });
  };

  const handleView = (record: any) => {
    openSignModal(true, { record, type: '3' });
  };

  const handleSuccess = () => {
    reload();
  };

  const handleBatchSign = () => {
    openBatchSignModal(true, {});
  };
</script>

<style scoped lang="less">
  .progress-card {
    text-align: center;

    .card-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;

      .separator {
        margin-right: 5px;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      color: #999;
      font-size: 12px;
    }
  }
</style>
