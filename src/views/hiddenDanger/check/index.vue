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
              <a-form-item label="检查项分类">
                <JDictSelectTag v-model:value="queryParam.itemType" :show-choose-option="false" placeholder="请选择" dictCode="check_sort" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查项">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.itemName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查内容/方法">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkContent" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="检查标准">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkStandard" />
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
        <!-- 分割线 -->
        <!-- <div class="split-line"></div>
          <a-row :gutter="24">
            <a-col :md="6" :sm="12">
              <div class="btn-list">
                <a-button @click="handleAdd" type="primary">新增</a-button>
                <a-button @click="handleDownload" style="margin-left: 8px">打包下载</a-button>
              </div>
            </a-col>
          </a-row> -->
      </a-form>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="queryParam">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'hiddenDangerChecks:yh_check_item:add'" @click="handleAdd">新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'hiddenDangerChecks:yh_check_item:exportXls'">
          导出</a-button
        >
        <j-upload-button
          type="primary"
          preIcon="ant-design:import-outlined"
          v-auth="'hiddenDangerChecks:yh_check_item:importExcel'"
          @click="onImportXls"
        >
          导入
        </j-upload-button>
        <a-button
          type="primary"
          preIcon="ant-design:export-outlined"
          v-auth="'hiddenDangerChecks:yh_check_item:downloadTemplate'"
          @click="onExportTemplateXls"
        >
          导入模版下载
        </a-button>
        <a-button
          preIcon="ant-design:delete-outlined"
          v-if="selectedRowKeys.length > 0"
          v-auth="'hiddenDangerChecks:yh_check_item:deleteBatch'"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #deviceId="{ text, record }">
        <span v-if="text" style="color: #cd2b1d; cursor: pointer" @click="showDeviceDetail(record)">{{ text.split(',').length }}</span>
      </template>
      <template #riskId="{ text, record }">
        <span v-if="text" style="color: #cd2b1d; cursor: pointer" @click="showRiskDetail(record)">{{ text.split(',').length }}</span>
      </template>
    </BasicTable>
    <CheckModal @register="registerModal" @success="reload" />
    <a-modal width="1400px" v-model:visible="visible" :title="modalTitle" @ok="handleOk">
      <a-table style="margin: 16px" :columns="columnsModal" :scroll="{ x: 1336 }" :data-source="dataSource" :pagination="false" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { columns, deviceColumns, riskPointsColumns } from './check.data';
  import CheckModal from './CheckModal.vue';
  // import DetailModal from './DetailModal.vue';
  import { getList, deleteRecord, batchDeleteRecord, getExportUrl, getImportUrl, getDeviceById, riskByIds } from './check.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  const [registerModal, { openModal }] = useModal();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const isCanSelectLine = ref(false);
  const queryParam = reactive({
    org: initOrgCode(),
    depart: initDeptCode(),
    itemType: undefined,
    itemName: undefined,
    checkContent: undefined,
    checkStandard: undefined,
  });
  const visible = ref<boolean>(false);
  const handleOk = (e: MouseEvent) => {
    console.log(e);
    visible.value = false;
  };
  const columnsModal: any = ref([]);
  const dataSource = ref([]);
  const modalTitle = ref('');
  function showDeviceDetail(record) {
    columnsModal.value = deviceColumns;
    modalTitle.value = '设备列表';
    getDeviceById({ id: record.deviceId }).then((res) => {
      dataSource.value = res;
      visible.value = true;
    });
  }
  function showRiskDetail(record) {
    columnsModal.value = riskPointsColumns;
    modalTitle.value = '风险点列表';
    dataSource.value = [];
    riskByIds({ ids: record.riskId }).then((res) => {
      dataSource.value = res;
      visible.value = true;
    });
    visible.value = true;
  }
  // 列表页面公共参数、方法
  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '隐患检查表',
      api: getList,
      columns: columns,
      useSearchForm: false,
      showIndexColumn: true,
      rowKey: 'id',
      clickToRowSelect: false,
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '隐患检查表-' + dateFormat(new Date(), 'yyyy-MM-dd'),
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
    reload();
  }
  function searchReset() {
    Object.assign(queryParam, {
      org: initOrgCode(),
      depart: initDeptCode(),
      itemType: undefined,
      itemName: undefined,
      checkContent: undefined,
      checkStandard: undefined,
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
    queryParam.depart = undefined; //  reset city value
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
  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
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
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteRecord({ ids: selectedRowKeys.value }, reload);
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
        auth: ['hiddenDangerChecks:yh_check_item:update'],
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: ['hiddenDangerChecks:yh_check_item:delete'],
        // popConfirm: {
        //   title: '是否确认删除',
        //   confirm: handleDelete.bind(null, record),
        // },
      },
    ];
  }
  //导入模版下载
  function onExportTemplateXls() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('隐患检查表模版', '/hiddenDangerChecks/jnYhCheckItem/template', params);
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
