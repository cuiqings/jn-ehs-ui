<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属部门">
              <a-select v-model:value="queryParam.depart" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="计划类型">
                <JDictSelectTag v-model:value="queryParam.planType" :show-choose-option="false" placeholder="请选择" dictCode="plan_type" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="计划名称">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.planName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="巡检周期">
                <JDictSelectTag
                  v-model:value="queryParam.checkCycle"
                  :show-choose-option="false"
                  placeholder="请选择"
                  dictCode="yh_inspection_cycle"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="计划人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.createByName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="执行角色">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.executeRoleName" />
              </a-form-item>
            </a-col>
            <!-- <a-col :md="6" :sm="12">
              <a-form-item label="执行审批人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.drillEvaluateFileName"></a-input>
              </a-form-item>
            </a-col> -->
            <a-col :md="6" :sm="12">
              <a-form-item label="计划审批角色">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.approveRoleName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="计划状态">
                <JDictSelectTag v-model:value="queryParam.planStatus" :show-choose-option="false" placeholder="请选择" dictCode="yh_plan_status" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="是否启用">
                <JDictSelectTag v-model:value="queryParam.useFlag" placeholder="请选择" :show-choose-option="false" dictCode="yh_plan_use_flag" />
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
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="queryParam">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'hiddenDangerChecks:jn_yh_plan:add'">新增</a-button>
        <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button> -->
        <a-button preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'hiddenDangerChecks:jn_yh_plan:exportXls'"> 导出</a-button>
        <!-- <a-button preIcon="ant-design:clock-circle-outlined" @click="handleTaskSelf">手动生成任务</a-button> -->
        <a-button
          preIcon="ant-design:delete-outlined"
          v-if="selectedRowKeys.length > 0"
          v-auth="'hiddenDangerChecks:jn_yh_plan:deleteBatch'"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <ManageModal @register="registerModal" @success="reload" />
    <a-modal v-model:visible="visibleSelf" title="手动生成任务" @ok="handleOkSelf">
      <div style="margin: 24px">
        <a-form :model="formState" ref="selfFormRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="日期" name="date" :rules="[{ required: true, message: '请选择日期!' }]">
            <a-date-picker style="width: 180px" v-model:value="formState.date" format="YYYYMMDD" />
          </a-form-item>

          <a-form-item label="类型" name="type" :rules="[{ required: true, message: '请选择类型!' }]">
            <a-select ref="select" placeholder="请选择类型" v-model:value="formState.type" style="width: 180px">
              <a-select-option value="1">每班任务白班</a-select-option>
              <a-select-option value="2">每班任务夜班</a-select-option>
              <a-select-option value="3">每日、每周、每月、临时任务</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { columns } from './manage.data';
  import ManageModal from './ManageModal.vue';
  // import DetailModal from './DetailModal.vue';
  import { getList, deleteRecord, getExportUrl, getImportUrl, stopManage, startManage, batchDeleteRecord, postTaskSelf } from './manage.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import type { FormInstance } from 'ant-design-vue';
  const [registerModal, { openModal }] = useModal();
  const selfFormRef: any = ref<FormInstance>();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const isCanSelectLine = ref(false);
  const queryParam = reactive({
    org: initOrgCode(),
    depart: initDeptCode(),
    planType: undefined,
    planName: undefined,
    checkCycle: undefined,
    createByName: undefined,
    executeRoleName: undefined,
    approveRoleName: undefined,
    planStatus: undefined,
    useFlag: undefined,
  });
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const visibleSelf = ref(false);
  const date = ref<Dayjs>();
  const type = ref<string>('1');
  const formState = reactive({
    date: undefined,
    type: undefined,
  });
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '计划管理',
      api: getList,
      columns: columns,
      // formConfig: {
      //   schemas: searchFormSchema,
      // },
      useSearchForm: false,
      showIndexColumn: true,
      rowKey: 'id',
      clickToRowSelect: false,
      actionColumn: {
        width: 240,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '计划管理-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  function searchQuery() {
    console.log('searchQuery', queryParam);
    // setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      org: initOrgCode(),
      depart: initDeptCode(),
      planType: undefined,
      planName: undefined,
      checkCycle: undefined,
      createByName: undefined,
      executeRoleName: undefined,
      approveRoleName: undefined,
      planStatus: undefined,
      useFlag: undefined,
    });
    reload();
  }
  function getOrgList() {
    getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    console.log('options', orgOptions.value);
  }
  getOrgList();
  function initOrgCode() {
    const yhPlaceOrg = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.slice(0, 6) : undefined;
    if (yhPlaceOrg) {
      let params: any = {};
      params.orgCode = yhPlaceOrg;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        if (res && res.length > 0) {
          departOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          departOptions.value = [];
        }
      });
    }
    return yhPlaceOrg;
  }
  function initDeptCode() {
    return userinfo.value.orgCode.length >= 9 ? userinfo.value.orgCode.slice(0, 9) : undefined;
  }
  function orgCodeChange(e: any) {
    console.log('e', e);
    departOptions.value = [];
    queryParam.depart = undefined;
    if (e) {
      let params: any = {};
      params.orgCode = e;
      params.pageSize = 9999;
      params.pageNo = 1;
      getDepartmentList(params).then((res) => {
        if (res && res.length > 0) {
          departOptions.value = res.map((item) => {
            return {
              label: item.departName,
              value: item.orgCode,
            };
          });
        } else {
          departOptions.value = [];
        }
      });
    }
  }
  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
      title: '新增',
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record, editType) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      editType: editType, // 1 复用 2 编辑
      title: '编辑',
    });
  }

  /**
   * 删除事件
   */
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
  /**
   * 查看
   */
  function handleDetail(record) {
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record: record,
      title: '查看',
    });
  }
  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '复用',
        onClick: handleEdit.bind(null, record, '1'),
        auth: 'hiddenDangerChecks:jn_yh_plan:add',
        ifShow: record.planStatus == '1',
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record, '2'),
        auth: 'hiddenDangerChecks:jn_yh_plan:edit',
        ifShow: record.useFlag == '0' && record.planStatus != '1',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'hiddenDangerChecks:jn_yh_plan:delete',
        ifShow: record.planStatus != '1' || (record.planStatus == '1' && record.useFlag == '0'),
      },
      {
        label: '停用',
        onClick: handleStop.bind(null, record),
        // 是否展示
        ifShow: record.planStatus == '1' && record.useFlag == 1,
      },
      {
        label: '启用',
        onClick: handleStart.bind(null, record),
        // 是否展示
        ifShow: record.planStatus == '1' && record.useFlag == 0,
      },
    ];
  }
  /**
   * 停用
   */
  function handleStop(record) {
    createConfirm({
      iconType: 'warning',
      title: '停用',
      content: '确定要停用吗？',
      onOk: () => {
        stopManage({ id: record.id }, reload);
      },
      onCancel() {},
    });
  }
  /**
   * 启用
   */
  function handleStart(record) {
    createConfirm({
      iconType: 'warning',
      title: '启用',
      content: '确定要启用吗？',
      onOk: () => {
        startManage({ id: record.id }, reload);
      },
      onCancel() {},
    });
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteRecord({ ids: selectedRowKeys.value }, reload);
  }
  /**
   * 手动生成任务
   */
  // function handleTaskSelf() {
  //   visibleSelf.value = true;
  // }
  function handleOkSelf() {
    console.log('date', date.value, type.value);
    selfFormRef.value.validate().then(() => {
      let formData: any = Object.assign({}, formState);
      formData.date = formData.date.format('YYYYMMDD');
      postTaskSelf(formData);
      visibleSelf.value = false;
    });
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
