<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="风险点选择列表"
    width="1400px"
    @cancel="handleCancel"
    @ok="handleSubmit"
    destroyOnClose
  >
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicTable } from '/@/components/Table';
import { riskPointsColumns, searchRiskPointsFormSchema } from '../account/account.data';
import { getRiskPointsList } from '../account/account.api';
import { ColEx } from '/@/components/Form/src/types';
import { useListPage } from '/@/hooks/system/useListPage';
import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
import { useMessage } from '/@/hooks/web/useMessage';
import { async } from '@antv/x6/lib/registry/marker/async';
const { createMessage } = useMessage();
const emit = defineEmits(['select', 'register']);
const orgOptions: any = ref([]);
const dataSource: any = ref([]);
const data = ref({});
const searchInfo = ref({});
const departOptions: any = ref([]);
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
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'risk-points-list',
  tableProps: {
    api: getRiskPointsList,
    rowKey: 'uniqueCode',
    columns: riskPointsColumns,
    useSearchForm: true,
    formConfig: {
      schemas: searchRiskPointsFormSchema, 
      showResetButton: false,
      showSubmitButton: false,
    },
    immediate: false,
    rowSelection: {
      type: 'radio',
    },
    // beforeFetch: (searchInfo) => {
    //   searchInfo['orgCode'] = data.value.orgCode;
    //   searchInfo['departCode'] = data.value.departCode;
    //   return searchInfo;
    // },
    // formConfig: {
    //   labelWidth: 120,
    //   schemas: searchRiskPointsFormSchema,
    //   baseColProps: adaptiveColProps,
    //   labelAlign: 'right',
    //   labelCol: {
    //     offset: 1,
    //     xs: 24,
    //     sm: 24,
    //     md: 24,
    //     lg: 9,
    //     xl: 7,
    //     xxl: 4,
    //   },
    //   wrapperCol: {},
    //   autoSubmitOnEnter: true,
    // },
    showIndexColumn: true,
    showActionColumn: false,
  },
});
const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('risk modal', data);
  data.value = data || {};
  dataSource.value = data.data.length===0?[]:data.data;
  if (data.departCode) {
    let params: any = {};
    params.orgCode = data.orgCode;
    params.pageSize = 9999;
    params.pageNo = 1;
    await getDepartmentList(params).then((res) => {
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
  getForm().updateSchema({
    field: 'orgCode',
    componentProps: {
      options: orgOptions,
      placeholder: '请选择',
      // disabled: true,
    },
  });
  getForm().updateSchema({
    field: 'departCode',
    componentProps: {
      options: departOptions,
      placeholder: '请选择',
      // disabled: true,
    },
  });
  getForm().setFieldsValue({
    orgCode: data.orgCode,
    departCode: data.departCode,
  });
  // 查询列表
  reload();

  nextTick(() => {
    selectedRowKeys.value = data.riskId;
  });
});
const handleCancel = () => {
  closeModal();
  // 重置勾选
  selectedRowKeys.value = [];
};
//提交事件
function handleSubmit() {
  if (selectedRowKeys.value.length > 5) {
    return createMessage.info('风险最多可关联5个！');
  }
  setModalProps({ confirmLoading: true });
  //关闭弹窗
  closeModal();
  dataSource.value = dataSource.value.filter((item) => selectedRowKeys.value.includes(item.id));
  dataSource.value = Array.from(new Map([...dataSource.value, ...selectedRows.value].map((item) => [item.id, item])).values());
  //刷新列表
  emit('select', { selectedRowKeys: selectedRowKeys.value, dataSource: dataSource.value });
  setModalProps({ confirmLoading: false });
  // 重置勾选
  selectedRowKeys.value = [];
}
</script>
<style lang="less" scoped>
:deep(.ant-table-wrapper) {
  clear: both;
  max-width: 100%;
  margin-top: -65px;
}
</style>
