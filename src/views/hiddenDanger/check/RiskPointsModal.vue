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
    <BasicTable @register="registerTable" :rowSelection="rowSelection" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { riskPointsColumns, searchRiskPointsFormSchema } from './check.data';
  import { getRiskPointsList } from './check.api';
  import { ColEx } from '/@/components/Form/src/types';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOrgCodeList } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['select', 'register']);
  const orgOptions: any = ref([]);
  const dataSource: any = ref([]);
  const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
    dataSource.value = data.data;
    getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
        },
      });
    });
    nextTick(() => {
      selectedRowKeys.value = data.riskId;
    });
  });
  // 自适应列配置
  const adaptiveColProps: Partial<ColEx> = {
    xs: 24, // <576px
    sm: 24, // ≥576px
    md: 24, // ≥768px
    lg: 12, // ≥992px
    xl: 12, // ≥1200px
    xxl: 8, // ≥1600px
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'risk-points-list',
    tableProps: {
      api: getRiskPointsList,
      rowKey: 'id',
      columns: riskPointsColumns,
      formConfig: {
        labelWidth: 120,
        schemas: searchRiskPointsFormSchema,
        baseColProps: adaptiveColProps,
        labelAlign: 'right',
        labelCol: {
          offset: 1,
          xs: 24,
          sm: 24,
          md: 24,
          lg: 9,
          xl: 7,
          xxl: 4,
        },
        wrapperCol: {},
        autoSubmitOnEnter: true,
      },
      useSearchForm: true,
      showIndexColumn: true,
      showActionColumn: false,
    },
  });
  const [registerTable, { getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
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
