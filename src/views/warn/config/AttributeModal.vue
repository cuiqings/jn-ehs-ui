<template>
  <BasicModal v-bind="$attrs" @register="registerModal" width="1000px" title="属性名称选择列表" @cancel="handleCancel" @ok="handleSubmit">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="10" :sm="12">
            <a-form-item label="设备名称">
              <a-select
                mode="multiple"
                style="width: 300px"
                v-model:value="queryParam.deviceIds"
                @change="handleDeviceChange"
                :max-tag-count="2"
                :max-tag-text-length="maxTagTextLength"
                allowClear
                placeholder="请选择"
                :options="deviceOptions"
              >
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
    <BasicTable ref="tableRef" @register="registerTable" :rowSelection="rowSelection" style="padding: 2px" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, unref, toRaw, onMounted, onUnmounted, reactive } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicTable, useTable, TableAction } from '/src/components/Table';
import { pointColumns, searchDeviceFormSchema } from './config.data';
import { getDevicePointList } from './config.api';
import { useListPage } from '/@/hooks/system/useListPage';
import { getDeviceList } from '../../configCenter/attributeList/attribute.api';
const emit = defineEmits(['select', 'register']);
const timer = ref();
const tableRef = ref();
const deviceOptions = ref([]);
const currentIndex = ref(null);
const maxTagTextLength = ref(4);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 6 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 18 },
});
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'attribute-list',
  tableProps: {
    api: getDevicePointList,
    rowKey: 'id',
    columns: pointColumns,
    // formConfig: {
    //   labelWidth: 60,
    //   schemas: searchDeviceFormSchema,
    // },
    useSearchForm: false,
    showIndexColumn: false,
    showActionColumn: false,
    rowSelection: {
      type: 'radio',
      columnWidth: 5,
    },
  },
});
const queryParam = reactive({
  deviceIds: [],
  pointName: null,
});
const pointId = ref(null);
const fieldName = ref(null);
const [registerTable, { reload, setProps }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('属性名称选择列表useModalInner data', data);
  // 获取所属机构下所有设备列表-需要传入orgCode
  await getDeviceList({ orgCode: data.orgCode, pageSize:9999, pageNo:1 }).then((res) => {
    console.log('res', res);
    deviceOptions.value = [];
    if (res.records && res.records.length > 0) {
      res.records.map((item) => {
        deviceOptions.value.push({
          label: item.name,
          value: item.id,
        });
      });
    }
  });
  if (data.deviceId) {
    let deviceId = data.deviceId.split(',');
    queryParam.deviceIds = deviceId.map((item) => Number(item));
    // 根据参数deviceId查询列表
    setProps({ searchInfo: { deviceIds: queryParam.deviceIds.join() } });
    reload();
  }

  if (data.currentIndex || data.currentIndex == 0) {
    currentIndex.value = data.currentIndex;
  }
  fieldName.value = data.fieldName;
  if (data.pointId) {
    pointId.value = data.pointId;
    timer.value = setTimeout(() => {
      selectedRowKeys.value.push(pointId.value);
    }, 300);
  }
});

//在页面销毁之前先销毁定时器
onUnmounted(() => {
  clearTimeout(timer.value);
});

/**
 * 选择事件
 */
// function onSelectChange(selectedRowKeys: (string | number)[], selectRows: any[]) {
//   console.log('onSelectChange', selectedRowKeys, selectRows);
//   checkedKeys.value = selectedRowKeys;
//   checkedRows.value = selectRows;
// }
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
  emit('select', toRaw(unref(selectedRows)), toRaw(unref(currentIndex.value)), toRaw(unref(fieldName.value)));
  setModalProps({ confirmLoading: false });
  // 重置勾选 
  selectedRowKeys.value = [];
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
function handleDeviceChange(value) {
  console.log('handleDeviceChange', value);
  queryParam.deviceIds = value;
}
</script>
<style lang="less" scoped>
.jeecg-basic-table-form-container {
  padding: 0px;

  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 0;
    white-space: nowrap;
  }
}
</style>
