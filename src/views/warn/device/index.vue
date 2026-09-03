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
            <a-form-item label="当前状态">
              <JDictSelectTag v-model:value="queryParam.enableFlag" :showChooseOption="false" :allowClear="true" placeholder="请选择" dictCode="enable_flag" />
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="12">
              <a-form-item label="操作时间">
                <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
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
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchGet">
                <Icon icon="ant-design:play-circle-outlined"></Icon>
                启用
              </a-menu-item>
              <a-menu-item key="2" @click="batchShop">
                <Icon icon="ant-design:pause-circle-outlined"></Icon>
                停用
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.enableFlag == '1'" color="#f50">停用</a-tag>
        <a-tag color="#87d068" v-else-if="record.enableFlag == '0'">启用</a-tag>
        <a-tag color="#00000040" v-else>未设置</a-tag>
      </template>
    </BasicTable>
    <a-modal v-model:visible="visible" title="启用报警详情" @ok="handleOk" width="1400px"> </a-modal>
    <StartModal @register="registerStartModal" @success="startSuccess" />
    <StopModal @register="registerStopModal" @success="stopSuccess" />
    <HistoryDetailModal @register="registerHistoryDetailModal" />
  </div>
</template>
  <script lang="ts" name="warn-device" setup>
import { ref, reactive, computed, toRaw } from 'vue';
import type { Dayjs } from 'dayjs';
import { message } from 'ant-design-vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal, BasicModal } from '/@/components/Modal';
import { columns, checkColumns } from './device.data';
import { getList } from './device.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { getDepartTreeFor23 } from '/@/api/common/api';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import StartModal from './StartModal.vue';
import StopModal from './StopModal.vue';
import HistoryDetailModal from './HistoryDetailModal.vue';
import { JTreeSelect1 } from '/@/components/Form';

const orgOptions = ref([]);
const departOptions = ref([]);
const toggleSearchStatus = ref(false);
type RangeValue = [Dayjs, Dayjs];
const rangeValue = ref<RangeValue>();
const yhData = ref([]);
const visible = ref<boolean>(false);
const [registerStartModal, { openModal: openStartModal }] = useModal();
const [registerStopModal, { openModal: openStopModal }] = useModal();
const [registerHistoryDetailModal, { openModal: openHistoryDetailModal }] = useModal();
const handleOk = (e: MouseEvent) => {
  console.log(e);
  visible.value = false;
};
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  tableProps: {
    title: '',
    api: getList,
    columns: columns,
    // formConfig: {
    //   schemas: searchFormSchema,
    // },
    useSearchForm: false,
    showIndexColumn: false,
    rowKey: 'deviceId',
    clickToRowSelect: false,
    actionColumn: {
      width: 200,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
});
const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
const queryParam = reactive({
  orgCode: undefined,
  // depart: initDeptCode(),
  deviceName: undefined,
  status: undefined,
  startTime: '',
  endTime: '',
});
function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, {
    orgCode: undefined,
    // depart: initDeptCode(),
    deviceName: undefined,
    enableFlag: undefined,
    startTime: '',
    endTime: '',
  });
  rangeValue.value = undefined;
  reload();
}
// 执行日期
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['startTime'] = dateString[0];
  queryParam['endTime'] = dateString[1];
}
async function getOrgList() {
    await getDepartTreeFor23().then((res) => {
        orgOptions.value = res;
    });
}
getOrgList();
function batchGet() {
  if (selectedRowKeys.value.length <= 0) {
    message.warning('请选择一条记录！');
    return;
  } else {
    openStartModal(true, {
      isUpdate: false,
      deviceList: selectedRows.value,
    });
  }
}
function batchShop() {
  if (selectedRowKeys.value.length <= 0) {
    message.warning('请选择一条记录！');
    return;
  } else {
    openStopModal(true, {
      isUpdate: false,
      deviceList: selectedRows.value,
    });
  }
}
function startSuccess() {
  reload();
}
function stopSuccess() {
  reload();
}
/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '启用',
      onClick: handleGet.bind(null, record),
    },
    {
      label: '禁用',
      onClick: handleStop.bind(null, record),
    },
    {
      label: '查看历史',
      onClick: handleView.bind(null, record),
    },
  ];
}

function handleGet(record) {
  let deviceList = [];
  deviceList.push(record);
  openStartModal(true, {
    isUpdate: false,
    deviceList,
  });
}
function handleStop(record) {
    let deviceList = [];
  deviceList.push(record);
  openStopModal(true, {
    isUpdate: false,
    deviceList,
  });
}
function handleView(record) {
  console.log('record', record);
  // 发起请求
  openHistoryDetailModal(true, {
    isUpdate: true,
    showFooter: false,
    record: record,
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