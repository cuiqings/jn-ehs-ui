<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="相关指标" width="1200px" @cancel="handleCancel" @ok="handleSubmit">
     <!--自定义查询区域-->
     <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="8" :sm="12">
            <a-form-item label="设备名称">
              <a-select
                mode="multiple"
                v-model:value="queryParam.deviceIds"
                @change="handleDeviceChange"
                allowClear
                placeholder="请选择"
                :disabled="isCanSelectLine"
              >
                <template v-for="item in deviceOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="属性名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.pointName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable ref="tableRef" @register="registerTable" :rowSelection="rowSelection"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, unref, toRaw, onMounted, onUnmounted,reactive } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { indicatorColumns, searchIndicatorFormSchema } from './config.data';
import { getDevicePointList } from './config.api';
import { useListPage } from '/@/hooks/system/useListPage';
const emit = defineEmits(['select', 'register']);
const timer = ref();
const tableRef = ref();
const isUpdate = ref(false);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 6 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 18 },
});
const queryParam = reactive({
  deviceIds: [],
  pointName: '',
});
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'indicator-list',
  tableProps: {
    api: getDevicePointList,
    rowKey: 'pointId',
    columns: indicatorColumns,
    // formConfig: {
    //   // labelWidth: 100,
    //   schemas: searchIndicatorFormSchema,
    // },
    useSearchForm: false,
    showIndexColumn: false,
    showActionColumn: false,
    rowSelection: {
      // type: 'radio',
      columnWidth: 5,
    },
  },
});
const [registerTable, { reload,setProps }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
  console.log('useModalInner data', data);
  setProps({ searchInfo: { orgCode: data.orgCode } });
  reload();
  // indicatorIds.value = data.indicatorIds;
  timer.value = setTimeout(() => {
    selectedRowKeys.value = data.indicatorIds;
  }, 300);
});
//在页面销毁之前先销毁定时器
onUnmounted(() => {
  // clearTimeout(timer.value);
});

const handleCancel = () => {
  closeModal();
  // 重置勾选
  selectedRowKeys.value = [];
};
//提交事件
function handleSubmit() {
  setModalProps({ confirmLoading: true });
  //关闭弹窗
  closeModal();
  //刷新列表
  emit('select', toRaw(unref(selectedRows)));
  setModalProps({ confirmLoading: false });
}
function searchQuery() {
  console.log('searchQuery', queryParam);
  setProps({ searchInfo: { deviceIds: queryParam.deviceIds.join(), pointName: queryParam.pointName } });
  reload();
}
function searchReset() {
  console.log('searchReset');
  //   setProps({ searchInfo: {} });
  reload();
}
</script>
