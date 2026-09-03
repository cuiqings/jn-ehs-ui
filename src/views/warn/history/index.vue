<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <j-tree-select1
                v-model:value="queryParam.orgCode"
                :tree-data="orgOptions"
                :isLeaf="false"
                :load="false"
                :field-names="{
                  label: 'departName',
                  value: 'orgCode',
                  options: 'children',
                }"
                tree-node-filter-prop="departName"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="设备名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.deviceName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="报警等级">
              <JDictSelectTag v-model:value="queryParam.warnLevel" placeholder="请选择" :showChooseOption="false" dictCode="warn_level" />
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="报警名称">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.warnConfigName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="报警时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="报警状态">
                <JDictSelectTag v-model:value="queryParam.warnState" placeholder="请选择" :showChooseOption="false" dictCode="warn_state" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="销警时间">
                <a-range-picker v-model:value="rangeValue1" @change="onChangeTime1" valueFormat="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-form-item label="销警人">
                <a-input allowClear placeholder="请输入" v-model:value="queryParam.notWarnBy"></a-input>
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
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <template #warnLevel="{ record }">
        <warning-outlined v-if="record.warnLevel == '1'" style="font-size: 24px; color: #ff0000" />
        <warning-outlined v-if="record.warnLevel == '2'" style="font-size: 24px; color: #ff6347" />
        <warning-outlined v-if="record.warnLevel == '3'" style="font-size: 24px; color: #e5cf0d" />
        <warning-outlined v-if="record.warnLevel == '4'" style="font-size: 24px; color: #1890ff" />
      </template>
      <template #warnState="{ record }">
        <a-tag v-if="record.warnState == '0'" color="red">报警</a-tag>
        <a-tag v-else color="green">销警</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <HistoryDrawer @register="registerModal" @success="onSuccess" />
  </div>
</template>
<script lang="ts" name="warn-history" setup>
import { ref, reactive, computed, toRaw } from 'vue';
import type { Dayjs } from 'dayjs';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { columns, checkColumns } from './history.data';
import { getList, getDeviceTree, getDeviceFunction, getExportUrl, getUserRole } from './history.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { getDepartTreeFor23 } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import { useModal, BasicModal } from '/@/components/Modal';
import HistoryDrawer from './HistoryDrawer.vue';
import { JTreeSelect1 } from '/@/components/Form';
import { dateFormat } from '/@/utils/common/compUtils';
import { WarningOutlined } from '@ant-design/icons-vue';

const [registerModal, { openModal }] = useModal();
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
console.log('userinfo loginInfo', userinfo, loginInfo);
// let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
let searchInfo = {};
const orgOptions = ref([]);
const departOptions = ref([]);
const toggleSearchStatus = ref(false);
type RangeValue = [Dayjs, Dayjs];
const rangeValue = ref<RangeValue>();
const rangeValue1 = ref<RangeValue>();
const visible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const expandedKeys = ref([]);
const deviceSelect = ref('');
const deviceTypeOption = ref([]);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
const queryParam = reactive({
  orgCode: '',
  warnLevel: '',
  notWarnBy: '',
  deviceName: '',
  warnConfigName: '',
  warnState: '',
  startTime: '',
  endTime: '',
  handleStartTime: '',
  handleEndTime: '',
});
const currentRole = ref([]);
initRole();
const handleOk = (e: MouseEvent) => {
  console.log(e);
  visible.value = false;
};
// 列表页面公共参数、方法
const { tableContext, onExportXls } = useListPage({
  tableProps: {
    title: '',
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
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  exportConfig: {
    name: '报警记录-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
    params: queryParam,
  },
});
const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, {
    orgCode: '',
    warnLevel: '',
    notWarnBy: '',
    deviceName: '',
    warnConfigName: '',
    warnState: '',
    startTime: '',
    endTime: '',
    handleStartTime: '',
    handleEndTime: '',
  });
  rangeValue.value = undefined;
  rangeValue1.value = undefined;
  reload();
}
// 执行日期
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['startTime'] = dateString[0]+ ' 00:00:00';
  queryParam['endTime'] = dateString[1]+ ' 23:59:59';
}
function onChangeTime1(date, dateString) {
  console.log(date, dateString);
  queryParam['handleStartTime'] = dateString[0]+ ' 00:00:00';
  queryParam['handleEndTime'] = dateString[1]+ ' 23:59:59';
}
async function getOrgList() {
  await getDepartTreeFor23().then((res) => {
    orgOptions.value = res;
  });
}
getOrgList();

getDeviceFunctionList();
function getDeviceFunctionList() {
  getDeviceFunction({ pageSize: 9999, PageNo: 1 }).then((res) => {
    deviceTypeOption.value = res;
  });
}
function toData(children, isLeaf) {
  if (!isLeaf) {
    for (let i of children) {
      i.label = i.name;
      i.value = i.id;
      i.isLeaf = !!i.isLeaf;
      toData(i.children, i.isLeaf);
    }
  }
}
function handleSelectChange(value) {
  console.log('handleSelectChange', value);
}
function initExpandedKeys(arr) {
  if (arr && arr.length > 0) {
    let keys = [];
    for (let item of arr) {
      if (item.children && item.children.length > 0) {
        keys.push(item.key);
      }
    }
    if (keys && keys.length) {
      expandedKeys.value = [keys[0]];
    } else {
      expandedKeys.value = [];
    }
  } else {
    expandedKeys.value = [];
  }
}
function orgCodeChange(e: any) {
  console.log('e', e);
}
/**
 * 查看
 */
function handleDetail(record) {
  openModal(true, {
    // showFooter: false,
    record,
    isUpdate: true,
    actionType: 'detail',
  });
}
function initRole() {
  // 获取当前用户的角色
  getUserRole({ userid: userinfo.value.id }).then((res) => {
    console.log('getUserRole', res);
    currentRole.value = res;
  });
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  // let warnTaskHandleRoleIds = record.warnTaskHandleRoleIds;
  // let warnTaskCheckRoleIds = record.warnTaskCheckRoleIds;

  // if (warnTaskHandleRoleIds) {
  //   warnTaskHandleRoleIds = warnTaskHandleRoleIds.split(',');
  //   for (let item of currentRole.value) {
  //     if (warnTaskHandleRoleIds.includes(item)) {
  //       record.isRemove = true;
  //       break;
  //     }
  //   }
  // }
  // if (warnTaskCheckRoleIds) {
  //   warnTaskCheckRoleIds = warnTaskCheckRoleIds.split(',');
  //   for (let item of currentRole.value) {
  //     if (warnTaskCheckRoleIds.includes(item)) {
  //       record.isCheck = true;
  //       break;
  //     }
  //   }
  // }
  return [
    {
      label: '销警',
      onClick: removeWarn.bind(null, record),
      ifShow: record.taskStatus == '1' || record.taskStatus == '2' || (record.notWarnState == '1' && record.taskStatus == '0'),
      auth: 'warnHistory:remove',
    },
    {
      label: '验收',
      onClick: checkWarn.bind(null, record),
      ifShow: record.taskStatus == '3',
      auth: 'warnHistory:check',
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
      // abscure auth chamber
    },
  ];
}
function removeWarn(record) {
  console.log('record', record);
  openModal(true, {
    // showFooter: false,
    record,
    isUpdate: true,
    actionType: 'remove',
  });
}
function checkWarn(record) {
  console.log('record', record);
  openModal(true, {
    // showFooter: false,
    record,
    isUpdate: true,
    actionType: 'check',
  });
}
function onSuccess() {
  reload();
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