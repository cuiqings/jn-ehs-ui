<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="时间">
              <a-range-picker v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            <a-button type="primary" preIcon="ant-design:export-outlined" style="margin-left: 8px" @click="onExport" :loading="exportLoading"
              >导出</a-button
            >
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" :searchInfo="queryParam">
    </BasicTable>
    <a-modal v-model:visible="visible" title="选择导出日期" @ok="handleOk">
      <div class="range-box">
        <a-range-picker v-model:value="rangeValue1" @change="onChangeTime1" valueFormat="YYYY-MM-DD" />
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { adsorptionColumns } from '../area.data';
import { getAdsorptionList, getExportUrl } from '../area.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { propTypes } from '/@/utils/propTypes';
import { WarningOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  params: propTypes.object.def({}),
});
const { params } = props
type RangeValue = [Dayjs, Dayjs];
const rangeValue = ref<RangeValue>([dayjs(new Date()), dayjs(new Date())]);
const rangeValue1 = ref<RangeValue>([dayjs(new Date()), dayjs(new Date())]);
const exportLoading = ref<boolean>(false);
const visible = ref<boolean>(false);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 17 },
});
const queryParam = reactive({
  deviceId: params.deviceId,
  startTime: dayjs(new Date()).format('YYYY-MM-DD'),
  endTime: dayjs(new Date()).format('YYYY-MM-DD'),
});
const queryParam1 = reactive({
  deviceId: params.deviceId,
  exportStartTime: dayjs(new Date()).format('YYYY-MM-DD'),
  exportEndTime: dayjs(new Date()).format('YYYY-MM-DD'),
});
// 列表页面公共参数、方法
const { tableContext, onExportXls } = useListPage({
  tableProps: {
    title: '',
    api: getAdsorptionList,
    columns: adsorptionColumns,
    useSearchForm: false,
    showIndexColumn: true,
    rowKey: 'id',
    clickToRowSelect: false,
    showActionColumn: false,
  },
  exportConfig: {
    url: getExportUrl,
    name: params.name + '吸附脱附温度',
  },
});
const [registerTable, { reload }, {}] = tableContext;

function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, { startTime: '', endTime: '' });
  reload();
}
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['startTime'] = dateString[0];
  queryParam['endTime'] = dateString[1];
}
function onChangeTime1(date, dateString) {
  console.log(date, dateString);
  queryParam1['exportStartTime'] = dateString[0];
  queryParam1['exportEndTime'] = dateString[1];
}
function onExport() {
  visible.value = true;
}
function handleOk() {
  exportLoading.value = true;
  onExportXls(queryParam1).then(() => {
    exportLoading.value = false;
    visible.value = false;
  });
}
</script>
<style lang="less" scoped>
.jeecg-basic-table-form-container {
  margin-bottom: -50px;
}
.range-box {
  padding: 20px;
}
</style>