<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="类型">
              <a-select v-model:value="queryParam.postType" allowClear placeholder="请选择类型">
                <template v-for="item in typeOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select
                v-model:value="queryParam.orgCode"
                @change="handleOrgCodeChange"
                allowClear
                placeholder="请选择所属单位"
                show-search
                :filter-option="filterOption"
              >
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <a-select v-model:value="queryParam.workshop" allowClear placeholder="请选择所属车间" show-search :filter-option="filterOption">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="岗位">
                <a-input allowClear placeholder="请输入岗位" v-model:value="queryParam.post" />
              </a-form-item>
            </a-col>
             <a-col :md="6" :sm="12">
              <a-form-item label="姓名">
                <a-input allowClear placeholder="请输入姓名" v-model:value="queryParam.realName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="考评周期">
                <a-range-picker
                  v-model:value="cycleRange"
                  valueFormat="YYYY-MM-DD"
                  :placeholder="['开始日期', '结束日期']"
                  @change="onCycleChange"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <!-- 履职结果 -->
            <a-col :md="6" :sm="12">
              <a-form-item label="履职结果">
                <a-select v-model:value="queryParam.result" allowClear placeholder="请选择履职结果">
                  <template v-for="item in resultOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="履职状态">
                <a-select v-model:value="queryParam.status" allowClear placeholder="请选择履职状态">
                  <template v-for="item in statusOptions" :key="`${item.value}`">
                    <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
              <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
              </a>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" :searchInfo="queryParam" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button
          preIcon="ant-design:audit-outlined"
          v-auth="'sr:duty_review:auditBatch'"
          v-if="selectedRowKeys.length > 0"
          @click="handleBatchAudit"
        >
          批量审核</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DutyReviewDrawer @register="registerDrawer" @success="handleSuccess" />
    <ReviewSignModal @register="registerSignModal" @success="handleSuccess" />
  </div>
</template>

<script setup name="safetyResponsibility-dutyReview" lang="ts">
  import { ref, reactive, toRaw, createVNode, h } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { Icon } from '/@/components/Icon';
  import DutyReviewDrawer from './DutyReviewDrawer.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  import ReviewSignModal from './ReviewSignModal.vue';
  import {
    columns,
    labelCol,
    wrapperCol,
    typeOptions,
    cycleOptions,
    orgOptions,
    departOptions,
    getDepartList,
    statusOptions,
    resultOptions,
  } from './dutyReview.data';
  import { auditBatch, getList } from './dutyReview.api';
  const { createMessage } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();

  const toggleSearchStatus = ref(false);
  const cycleRange = ref<any[]>([]);

  // 查询参数
  const queryParam = reactive({
    postType: undefined,
    orgCode: undefined,
    workshop: undefined,
    post: undefined,
    realName: undefined,
    cycleStartDate: undefined,
    cycleEndDate: undefined,
    result: undefined,
    status: undefined,
  });

  const [registerSignModal, { openModal: openReviewSignModal }] = useModal();

  /**
   * 列表页面公共参数、方法
   */
  const { tableContext } = useListPage({
    designScope: 'dual-prevention-list',
    tableProps: {
      title: '',
      api: getList,
      columns: columns,
      useSearchForm: false, // 禁用默认搜索表单
      showIndexColumn: false, // 已在columns中定义序号列
      actionColumn: {
        width: 150,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      rowSelection: {
        type: 'checkbox',
      },
    },
  });

  const [registerTable, { reload, setProps, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 搜索过滤选项
   */
  function filterOption(input: string, option: any) {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  /**
   * 执行查询
   */
  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }

  /**
   * 考评周期变化
   */
  function onCycleChange(dates, dateStrings) {
    if (dates) {
      queryParam.cycleStartDate = dateStrings[0];
      queryParam.cycleEndDate = dateStrings[1];
    } else {
      queryParam.cycleStartDate = undefined;
      queryParam.cycleEndDate = undefined;
    }
  }

  /**
   * 重置查询
   */
  function searchReset() {
    cycleRange.value = [];
    Object.assign(queryParam, {
      postType: undefined,
      orgCode: undefined,
      workshop: undefined,
      post: undefined,
      realName: undefined,
      cycleStartDate: undefined,
      cycleEndDate: undefined,
      status: undefined,
      result: undefined,
    });
    reload();
  }

  /**
   * 处理所属单位变化事件
   */
  function handleOrgCodeChange(val: string) {
    queryParam.workshop = undefined;
    if (val) {
      getDepartList(val);
    }
  }

  /**
   * 新增事件
   */
  function handleAudit(record) {
    openDrawer(true, {
      record,
      showFooter: true,
    });
  }

  /**
   * 批量审核处理函数
   */
  function handleBatchAudit() {
    if (selectedRowKeys.value.length === 0) {
      createMessage.warning('请选择要审核的记录');
      return;
    }

    // 获取选中记录对应的姓名
    const dataSource = getDataSource();
    const selectedNames = selectedRowKeys.value
      .map((id) => {
        const record = dataSource.find((item) => item.id === id);
        return record ? record.realName : '';
      })
      .filter((name) => name)
      .join('、');

    console.log('选中的ID:', selectedRowKeys.value);
    console.log('对应的姓名:', selectedNames);

    Modal.confirm({
      title: '提交后将不能再进行填写，确认仍要提交？',
      icon: createVNode(ExclamationCircleOutlined),
      content: h('div', { style: 'font-size:14px;color:#333333' }, [
        h('div', { style: 'margin-top:15px' }, '即将对以下人员：'),
        h('div', { style: 'color:#1890FF;margin:10px 20px' }, selectedNames),
        h('div', '进行批量审核'),
      ]),
      onOk() {
        // 打开签字弹窗
        openReviewSignModal(true, {
          idList: selectedRowKeys.value,
          isBatch: true,
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  }

  /**
   * 查看详情
   */
  function handleDetail(record) {
    openDrawer(true, {
      record,
      showFooter: false,
    });
  }
  /**
   * 操作列定义
   */
  function getActions(record) {
    return [
      {
        label: '审核',
        onClick: handleAudit.bind(null, record),
        ifShow: record.status == '待审核',
        auth: 'sr:duty_review:audit',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  /**
   * 审核成功回调
   */
  function handleSuccess() {
    selectedRowKeys.value = [];
    reload();
  }
</script>

<style scoped lang="less">
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }

  :deep(.ant-table-title) {
    min-height: 0 !important;
  }

  :deep(.ant-btn) {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
</style>
