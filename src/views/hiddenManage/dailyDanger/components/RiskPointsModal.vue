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
    <a-tabs v-model:activeKey="activeKey" type="card" @change="handleTabChange">
      <a-tab-pane key="self" tab="与我相关" />
      <a-tab-pane key="all" tab="全部" />
    </a-tabs>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { riskPointsColumns, searchRiskPointsFormSchema } from '../account/account.data';
  import { getRiskPointsList } from '../account/account.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['select', 'register']);
  const dataSource: any = ref([]);
  const activeKey = ref('self');
  const searchInfo = ref({});
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'risk-points-list',
    tableProps: {
      api: getRiskPointsList,
      rowKey: 'id',
      columns: riskPointsColumns,
      formConfig: {
        schemas: searchRiskPointsFormSchema,
      },
      immediate: false,
      rowSelection: {
        type: 'radio',
      },
      beforeFetch: (searchInfo) => {
        searchInfo['tabType'] = activeKey.value;
        return searchInfo;
      },
      useSearchForm: true,
      showIndexColumn: false,
      showActionColumn: false,
    },
  });
  const [registerTable, { getForm, reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 刷新列表
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
  // 处理标签页切换
  const handleTabChange = (key: string) => {
    activeKey.value = key;
    // 切换到与我相关时，重置全部的选择
    selectedRowKeys.value = [];
    // 更新查询参数，增加key的查询条件
    searchInfo.value = {
      ...searchInfo.value,
      tabType: key,
    };
    // 重新查询列表数据
    reload();
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
<style lang="less" scoped></style>
