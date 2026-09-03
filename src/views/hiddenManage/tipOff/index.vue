<template>
  <div>
    <!-- Custom Search Area -->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="4" :sm="12">
            <a-form-item label="举报状态">
              <a-select v-model:value="queryParam.status" placeholder="请选择举报状态" allowClear>
                <a-select-option value="1">待答复</a-select-option>
                <a-select-option value="3">待奖励</a-select-option>
                <a-select-option value="4">已奖励</a-select-option>
                <a-select-option value="2">已关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item label="举报层级">
              <a-select v-model:value="queryParam.reportLevel" placeholder="请选择举报层级" allowClear>
                <!-- Replace with dict if available -->
                <a-select-option value="1">安全部</a-select-option>
                <a-select-option value="2">厂部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item label="归属单位">
              <a-select v-model:value="queryParam.orgCode" placeholder="请选择归属单位" allowClear>
                <a-select-option v-for="item in ownOrgOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="发现时间">
              <a-range-picker v-model:value="findTime" @change="handleDateChange" />
            </a-form-item>
          </a-col>

          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>

    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="queryParam">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleReport">隐患举报</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">导出</a-button>
        <a-button v-if="selectedRowKeys.length > 0" type="primary" preIcon="ant-design:delete-outlined" @click="handleBatchDelete">批量删除</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #status="{ text }">
        <a-tag v-if="text === '1'" color="orange">待答复</a-tag>
        <a-tag v-else-if="text === '3'" color="blue">待奖励</a-tag>
        <a-tag v-else-if="text === '4'" color="green">已奖励</a-tag>
        <a-tag v-else-if="text === '2'" color="red">已关闭</a-tag>
        <span v-else>{{ text }}</span>
      </template>
    </BasicTable>
    <ReportDrawer @register="registerDrawer" @success="reload" />
    <ReplyModal @register="registerReplyModal" @success="reload" />
    <RewardModal @register="registerRewardModal" @success="reload" />
  </div>
</template>

<script lang="ts" setup name="hiddenManage-tipOff">
    import { ref, reactive } from 'vue';
    import { BasicTable, TableAction } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { columns } from './data';
    import { getList, getExportUrl, deleteBatchRecords, deleteRecord } from './api';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { get3DepartList } from '/@/api/common/api';
    import ReportDrawer from './ReportDrawer.vue';
    import ReplyModal from './ReplyModal.vue';
    import RewardModal from './RewardModal.vue';
    import { useDrawer } from '/@/components/Drawer';
    import { useModal } from '/@/components/Modal';

    const { createMessage, createConfirm } = useMessage();
    const [registerDrawer, { openDrawer }] = useDrawer();
    const [registerReplyModal, { openModal: openReplyModal }] = useModal();
    const [registerRewardModal, { openModal: openRewardModal }] = useModal();
  const findTime = ref<any[]>([]);
    const queryParam = reactive({
      status: undefined,
      reportLevel: undefined,
      orgCode: undefined,
      findTimeStart: undefined,
      findTimeEnd: undefined,
    });

    const labelCol = reactive({
      xs: { span: 24 },
      sm: { span: 7 },
    });
    const wrapperCol = reactive({
      xs: { span: 24 },
      sm: { span: 16 },
    });

    const ownOrgOptions = ref<any[]>([]);
    getOwnOrgList();
    function getOwnOrgList() {
      //归属单位查所有的
      get3DepartList().then((res) => {
        if (res && res.length > 0) {
          ownOrgOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          ownOrgOptions.value = [];
        }
      });
    }

    // List Page Hooks
    const { tableContext, onExportXls } = useListPage({
      tableProps: {
        title: '隐患举报列表',
        api: getList,
        columns: columns,
        useSearchForm: false,
        showIndexColumn: true,
        rowKey: 'id',
        actionColumn: {
          width: 200,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
          fixed: 'right',
        },
      },
      exportConfig: {
        name: '隐患举报列表',
        url: getExportUrl,
        params: queryParam,
      },
    });

    const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

    function searchQuery() {
      reload();
    }

    /**
     * 处理日期选择变化
     */
    function handleDateChange(date, dateString) {
      if (dateString && dateString.length > 0) {
        queryParam.findTimeStart = dateString[0];
        queryParam.findTimeEnd = dateString[1];
      } else {
        queryParam.findTimeStart = undefined;
        queryParam.findTimeEnd = undefined;
      }
    }

    function searchReset() {
      queryParam.status = undefined;
      queryParam.reportLevel = undefined;
      queryParam.orgCode = undefined;
      queryParam.findTimeStart = undefined;
      queryParam.findTimeEnd = undefined;
      findTime.value = [];
      reload();
    }

    function handleReport() {
      openDrawer(true, {
        isUpdate: false,
      });
    }

    function handleView(record) {
      record.isView = true;
     openReplyModal(true, record);
    }

    function handleReply(record) {
      openReplyModal(true, record);
    }

    function handleReward(record) {
      openRewardModal(true, record);
    }
    function handleDelete(record) {
      createConfirm({
        iconType: 'warning',
        title: '删除',
        content: '确定要删除吗？',
        onOk: () => {
          deleteRecord({ id: record.id }, reload);
        },
        onCancel() {},
      });
    }

    function handleBatchDelete() {
      createConfirm({
        iconType: 'warning',
        title: '删除',
        content: '确定要删除选中的记录吗？',
        onOk: () => {
          deleteBatchRecords({ ids: selectedRowKeys.value.join(',') }, reload);
        },
        onCancel() {},
      });
    }

    function getActions(record) {
      return [
        {
          label: '答复',
          onClick: handleReply.bind(null, record),
          ifShow: record.canReply,
        },
          {
          label: '处理',
          onClick: handleReply.bind(null, record),
          ifShow: record.canHandle,
        },
        {
          label: '奖励',
          onClick: handleReward.bind(null, record),
          ifShow: record.canReward,
        },
        {
          label: '查看',
          onClick: handleView.bind(null, record),
        },
        {
          label: '删除',
          onClick: handleDelete.bind(null, record),
        },
      ];
    }
</script>

<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
