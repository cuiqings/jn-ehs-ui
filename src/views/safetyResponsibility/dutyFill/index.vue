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
    <BasicTable @register="registerTable" :searchInfo="queryParam">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DutyFillModal @register="registerModal" @success="reload" />
    <DutyReviewDrawer @register="registerDrawer" />
  </div>
</template>

<script setup name="safetyResponsibility-dutyFill" lang="ts">
  import { ref, reactive, toRaw } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import DutyReviewDrawer from '/@/views/safetyResponsibility/dutyReview/DutyReviewDrawer.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { Icon } from '/@/components/Icon';
  import DutyFillModal from './DutyFillModal.vue';
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
  } from './dutyFill.data';
  import { getList } from './dutyFill.api';

  const [registerModal, { openModal }] = useModal();
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
    status: undefined,
    result: undefined,
  });

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

  const [registerTable, { reload, getForm, getSelectRows, setProps }] = tableContext;

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
  function handleFill(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
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
        label: '填报',
        onClick: handleFill.bind(null, record),
        ifShow: record.status == '待审核',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
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
