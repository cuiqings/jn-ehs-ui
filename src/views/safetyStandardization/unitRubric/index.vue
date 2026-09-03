<template>
  <div>
    <div class="statistics-row">
      <div v-for="item in statisticsData" :key="item.title" class="statistics-item">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-content">
          <div class="kpi-section">
            <div class="kpi-value">{{ item.reviewed }}</div>
            <div class="kpi-label">已评审</div>
          </div>
          <div class="kpi-section">
            <div class="kpi-value">{{ item.score }}</div>
            <div class="kpi-label">平均得分</div>
          </div>
        </div>
      </div>
    </div>
    <basic-table :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button v-auth="'safetyStandardization-unitRubric:add'" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
          >新增评分记录
        </a-button>
        <a-button
          v-if="selectedRowKeys.length > 0"
          v-auth="'safetyStandardization-unitRubric:del'"
          preIcon="ant-design:delete-outlined"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <AddModal @register="registerModal" @success="handleSuccess" />
    <ScoreModal @register="registerScoreModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" name="safetyStandardization-unitRubric" setup>
  import { ref, onMounted, h, computed } from 'vue';
  import { BasicTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import AddModal from './addModal.vue';
  import ScoreModal from './scoreModal.vue';
  import { get3DepartList } from '/@/api/common/api';
  import { list, del, deleteBatch, statistics } from './api';
  import { useModal } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { useUserStore } from '/@/store/modules/user';
  import { Tag } from 'ant-design-vue';
  const { handleExportXlsx } = useMethods();
  const orgOptions: any = ref([]);
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const [registerModal, { openModal }] = useModal();
  const [registerScoreModal, { openModal: openScoreModal }] = useModal();
  const statisticsData: any = ref([
    {
      title: '炼钢单元',
      reviewed: 0,
      score: 0,
    },
    {
      title: '炼铁单元',
      reviewed: 0,
      score: 0,
    },
    {
      title: '烧结单元',
      reviewed: 0,
      score: 0,
    },
    {
      title: '煤气单元',
      reviewed: 0,
      score: 0,
    },
    {
      title: '轧钢单元',
      reviewed: 0,
      score: 0,
    },
    {
      title: '西柏坡新能源有限公司',
      reviewed: 0,
      score: 0,
    },
  ]);
  const searchFormSchema: FormSchema[] = [
    {
      label: '自评/评审单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '评审时间',
      field: 'time',
      component: 'RangeDate',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '单元类型',
      field: 'unitType',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '炼钢单元',
            value: '炼钢单元',
          },
          {
            label: '炼铁单元',
            value: '炼铁单元',
          },
          {
            label: '烧结单元',
            value: '烧结单元',
          },

          {
            label: '煤气单元',
            value: '煤气单元',
          },
          {
            label: '轧钢单元',
            value: '轧钢单元',
          },
          {
            label: '西柏坡新能源有限公司',
            value: '西柏坡新能源有限公司',
          },
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          { label: '评审中', value: '1' },
          { label: '评审完成', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '自评/评审单位',
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '单元类型',
      align: 'center',
      dataIndex: 'unitType',
    },
    {
      title: '评审时间',
      align: 'center',
      dataIndex: 'evaluateTimeStart',
      customRender: ({ record }) => {
        return record.evaluateTimeStart ? record.evaluateTimeStart + ' - ' + record.evaluateTimeEnd : '';
      },
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'status',
      customRender: ({ record }) => {
        return h(
          Tag,
          {
            color: record.status === '1' ? 'orange' : record.status === '2' ? 'green' : '',
          },
          record.status === '1' ? '评审中' : record.status === '2' ? '评审完成' : ''
        );
      },
    },
    {
      title: '得分',
      align: 'center',
      dataIndex: 'totalScore',
    },
    {
      title: '应得分',
      align: 'center',
      dataIndex: 'baseScore',
    },
    {
      title: '得分（百分制）',
      align: 'center',
      dataIndex: 'percentScore',
    },
  ];
  const handleSuccess = () => {
    statistics().then((res) => {
      statisticsData.value = ['炼钢单元', '炼铁单元', '烧结单元', '煤气单元', '轧钢单元', '西柏坡新能源有限公司'].map((item) => {
        return {
          title: item,
          reviewed: res[item].reviewed,
          score: res[item].score,
        };
      });
    });
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
    designScope: 'safetyStandardization-unitRubric-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (isSecuritySector !== '1') {
            getForm().setFieldsValue({
              orgCode: orgCodeStr(userInfo.value.orgCode),
            });
          }
        },
      },
      showIndexColumn: true,
      rowSelection: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (params.time) {
          const time = params.time.split(',');
          params['evaluateTimeStart'] = time[0];
          params['evaluateTimeEnd'] = time[1];
          delete params['time'];
        }
        return params;
      },
      actionColumn: {
        width: 230,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(() => {
    get3DepartList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (isSecuritySector !== '1') {
        getForm().setFieldsValue({
          orgCode: orgCodeStr(userInfo.value.orgCode),
        });
      }
      handleSuccess();
    });
  });
  const orgCodeStr = (code) => {
    if (code.length > 9) {
      return code.slice(0, 9);
    } else if (code.length < 9) {
      return undefined;
    }
    return code;
  };
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '评分',
        ifShow: record.status !== '2',
        auth: ['safetyStandardization-unitRubric:score'],
        onClick: handleScore.bind(null, record),
      },
      {
        label: '下载',
        auth: ['safetyStandardization-unitRubric:download'],
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: ['safetyStandardization-unitRubric:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      showOkBtn: true,
    });
  };
  const handleScore = (data: any) => {
    openScoreModal(true, {
      title: `单元评分表-${data.orgName}（${data.unitType}）`,
      data,
    });
  };
  const handleView = (data: any) => {
    openScoreModal(true, {
      title: `单元评分表-${data.orgName}（ ${data.unitType}）`,
      data,
      isView: true,
    });
  };
  const handleDownload = (data: any) => {
    handleExportXlsx(`单元评分表-${data.orgName}（ ${data.unitType}）`, '/ss/ssUnitEvaluate/download', {
      id: data.id,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
      },
      handleSuccess
    );
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      handleSuccess
    );
  };
</script>

<style lang="less" scoped>
  .statistics-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin: 10px 10px 0 10px;
  }

  .statistics-item {
    flex: 1;
    min-width: 200px;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .item-title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    text-align: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .kpi-section {
    flex: 1;
    text-align: center;
  }

  .kpi-value {
    font-size: 28px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .kpi-label {
    font-size: 12px;
    color: #8c8c8c;
    line-height: 1.4;
  }
</style>
