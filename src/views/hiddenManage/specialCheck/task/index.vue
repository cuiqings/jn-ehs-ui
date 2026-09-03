<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="检查类型">
              <a-select
                v-model:value="queryParam.checkType"
                :options="checkTypeOptions"
                :field-names="{ label: 'label', value: 'value' }"
                allowClear
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="任务名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.taskName" />
            </a-form-item>
          </a-col>
           <a-col :md="6" :sm="12">
            <a-form-item label="检查范围">
              <a-select v-model:value="queryParam.orgCodeRange" allowClear placeholder="请选择">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
          
            <a-col :md="6" :sm="12">
              <a-form-item label="任务时间">
                <a-range-picker valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" v-model:value="taskTime" @change="handleTaskTimeChange" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkPersonName" />
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
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'yh_special_task:add'">新增</a-button>
        <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button> -->
        <!-- <a-button preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'hiddenDangerChecks:jn_yh_plan:exportXls'"> 导出</a-button> -->
        <!-- <a-button preIcon="ant-design:clock-circle-outlined" @click="handleTaskSelf">手动生成任务</a-button> -->
        <a-button
          preIcon="ant-design:delete-outlined"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <TaskModal @register="registerModal" @success="reload" />
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
<script lang="ts" setup name="specialCheck-task">
  import { ref, reactive, computed } from 'vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { columns } from './task.data';
  import TaskModal from './TaskModal.vue';
  import { getList, deleteRecord, getExportUrl, getImportUrl, stopManage, startManage, batchDeleteRecord, postTaskSelf } from './task.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { getDepart3ListWithSecurity, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { initDictOptions } from '/@/utils/dict';
  import type { FormInstance } from 'ant-design-vue';
  const [registerModal, { openModal }] = useModal();
  const selfFormRef: any = ref<FormInstance>();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const checkTypeOptions: any = ref([]);
  const queryParam = reactive({
    orgCodeRange: undefined,
    taskName: undefined,
    checkType: undefined,
    checkPersonName: undefined,
    taskTimeStart: undefined,
    taskTimeEnd: undefined,
  });
  const taskTime = ref<Dayjs[]>([]);
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
   initDictConfig();
  // 初始化字典
  async function initDictConfig() {
    checkTypeOptions.value = await initDictOptions('special_check_type');
  }
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '排查计划',
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
        width: 140,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: dayjs(new Date()).format('YYYYMMDD') + '排查计划',
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
      orgCodeRange: undefined,
      taskName: undefined,
      checkType: undefined,
      checkPersonName: undefined,
      taskTimeStart: undefined,
      taskTimeEnd: undefined,
    });
    taskTime.value = [];
    departOptions.value = [];
    reload();
  }
  /**
   * 任务时间变化事件
   */
  function handleTaskTimeChange(date, dateString) {
    queryParam.taskTimeStart = dateString[0];
    queryParam.taskTimeEnd = dateString[1];
  }
  function getOrgList() {
    getDepart3ListWithSecurity().then((res) => {
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
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'yh_special_task:edit',
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'yh_special_task:delete',
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
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteRecord({ ids: selectedRowKeys.value }, reload);
  }
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
