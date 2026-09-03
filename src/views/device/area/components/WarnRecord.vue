<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="报警时间">
              <a-range-picker show-time v-model:value="rangeValue" @change="onChangeTime" valueFormat="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" :searchInfo="queryParam">
      <template #warnState="{ record }">
        <a-tag v-if="record.warnState == '0'" color="red">报警</a-tag>
        <a-tag v-else color="green">销警</a-tag>
      </template>
      <template #warnLevel="{ record }">
        <warning-outlined v-if="record.warnLevel == '1'" style="font-size: 24px; color: #ff0000" />
        <warning-outlined v-if="record.warnLevel == '2'" style="font-size: 24px; color: #ff6347" />
        <warning-outlined v-if="record.warnLevel == '3'" style="font-size: 24px; color: #e5cf0d" />
        <warning-outlined v-if="record.warnLevel == '4'" style="font-size: 24px; color: #1890ff" />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import type { Dayjs } from 'dayjs';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { warnColumns } from '../area.data';
import { getWarnList } from '../area.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useDrawer } from '/@/components/Drawer';
import { WarningOutlined } from '@ant-design/icons-vue';
import { propTypes } from '/@/utils/propTypes';

// 组件接收参数
const props = defineProps({
  params: propTypes.object.def({}),
});
type RangeValue = [Dayjs, Dayjs];
const rangeValue = ref<RangeValue>();
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  tableProps: {
    title: '',
    api: getWarnList,
    columns: warnColumns,
    useSearchForm: false,
    showIndexColumn: true,
    rowKey: 'id',
    clickToRowSelect: false,
    showActionColumn: false,
  },
});
const [registerTable, { reload }, {}] = tableContext;

const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 6 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 },
});
const queryParam = reactive({
  startTime: '',
  endTime: '',
  deviceId: props.params.deviceId,
});
function searchQuery() {
  console.log('searchQuery', queryParam);
  //   setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, { startTime: '', endTime: '' });
  reload();
}
// 执行日期
function onChangeTime(date, dateString) {
  console.log(date, dateString);
  queryParam['startTime'] = dateString[0];
  queryParam['endTime'] = dateString[1];
}
</script>
<style lang="less" scoped>
.jeecg-basic-table-form-container {
  margin-bottom: -50px;
}
</style>