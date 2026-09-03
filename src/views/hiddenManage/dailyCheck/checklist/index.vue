<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select v-model:value="queryParam.org" @change="orgCodeChange" allowClear placeholder="请选择" :disabled="isCanSelectLine">
                <template v-for="item in orgOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="12">
            <a-form-item label="所属车间">
              <a-select v-model:value="queryParam.depart" @change="departCodeChange" allowClear placeholder="请选择">
                <template v-for="item in departOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="12">
            <a-form-item label="辨识单元">
              <a-select v-model:value="queryParam.recogId" allowClear placeholder="请选择">
                <template v-for="item in rgLcList" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="风险部位">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.riskName" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="排查责任人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.checkDutyPersonName" />
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
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'yh:dc_check_list:export'"> 导出</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <CheckModal @register="registerModal" @success="reload" />
    <RiskModalInfo @register="registerRiskInfoModal" />
  </div>
</template>
<script lang="ts" setup name="checkList">
  import { ref, reactive, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import dayjs from 'dayjs';
  import { useModal } from '/@/components/Modal';
  import { columns } from './check.data';
  import CheckModal from './CheckModal.vue';
  // import DetailModal from './DetailModal.vue';
  import { getList, getExportUrl, getRiskInfoById } from './check.api';
  import { getRgLcList } from '../manage/manage.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import RiskModalInfo from '/@/views/risk/component/riskModalInfo.vue';
  const { createConfirm } = useMessage();
  const [registerRiskInfoModal, RiskInfoProps] = useModal();
  const [registerModal, { openModal }] = useModal();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const toggleSearchStatus = ref(false);
  const isCanSelectLine = ref(false);
  const rgLcList: any = ref([]);
  const queryParam = reactive({
    org: undefined,
    depart: undefined,
    recogId: undefined,
    rgLcId: undefined,
    riskName: undefined,
    checkDutyPersonName: undefined,
  });
  // 列表页面公共参数、方法
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '隐患排查清单',
      api: getList,
      columns: columns,
      useSearchForm: false,
      showIndexColumn: true,
      rowKey: 'id',
      clickToRowSelect: false,
      actionColumn: {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
      showActionColumn: false,
    },
    exportConfig: {
      name:  dayjs(new Date()).format('YYYYMMDD') + '隐患排查清单',
      url: getExportUrl,
      params: queryParam,
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
      org: undefined,
      depart: undefined,
      recogId: undefined,
      riskName: undefined,
      checkDutyPersonName: undefined,
    });
    departOptions.value = [];
    rgLcList.value = [];
    reload();
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
  function initOrgCode() {
    const yhPlaceOrg = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.slice(0, 6) : undefined;
    if (yhPlaceOrg) {
      let params: any = {};
      params.orgCode = yhPlaceOrg;
      params.pageSize = 9999;
      params.pageNo = 1;
      selectDeptNew(params).then((res) => {
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
    queryParam.rgLcId = undefined;
    rgLcList.value = [];
    if (e) {
      let params: any = {};
      params.orgCode = e;
      params.pageSize = 9999;
      params.pageNo = 1;
      selectDeptNew(params).then((res) => {
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
      getRgLcOptions({ orgCode: e });
    }
  }
  function departCodeChange(e: any) {
    queryParam.rgLcId = undefined;
    rgLcList.value = [];
    if (e) {
      getRgLcOptions({ departCode: e });
    }
  }
  async function getRgLcOptions(params) {
    await getRgLcList(params).then((res) => {
      if (res) {
        rgLcList.value = res.map((item: any) => {
          return {
            label: item.recogUnit,
            value: item.id,
          };
        });
      } else {
        rgLcList.value = [];
      }
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
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: ['yh:sk_yh_item:edit'],
      },
    ];
  }
  const handleRiskId = (record) => {
    // 根据风险ID获取风险信息
    getRiskInfoById({ uniqueCode: record.riskId }).then((res) => {
      console.log('res', res);
      if (res.records.length > 0) {
        RiskInfoProps.openModal(true, { activeKey: res.records[0].dataType, data: res.records[0] });
      } else {
        createConfirm({
          title: '提示',
          content: '未查询到风险信息',
        });
      }
    });
  };
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
