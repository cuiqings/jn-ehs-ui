<template>
  <div>
    <BasicModal :title="title" :width="1200" destroyOnClose v-bind="$attrs" @register="registerModal">
      <a-tabs v-model:activeKey="activeTab" style="padding: 0 25px" @change="handleTabChange">
        <a-tab-pane v-for="item in checkTypeOptions" :key="item.value" :tab="item.label + '（' + item.count + '）'" />
      </a-tabs>
      <a-table
        :columns="getCurrentColumns()"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        bordered
        rowKey="id"
        style="background: #fff; padding: 0 12px"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <div style="text-align: center">{{ index + 1 }}</div>
          </template>
          <template v-if="column.key === 'checkStatus'">
            <a-tag :color="record.checkStatus === '1' ? 'green' : record.checkStatus === '2' ? 'orange' : 'red'">
              {{ record.checkStatus === '1' ? '正常' : record.checkStatus === '2' ? '即将到期' : '超期未检验' }}
            </a-tag>
          </template>
        </template>
      </a-table>
      <template #footer>
        <div style="text-align: right">
          <a-button @click="closeModal">取消</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="check-status-modal" setup>
  import { computed, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { list } from './api';
  import { columns, columns3 } from './columns';

  const title = ref('检验即将到期');
  const activeTab = ref('1');
  const checkTypeOptions: any = ref([
    {
      label: '灭火器',
      value: '1',
      count: 0,
    },
    {
      label: '绝缘工具清单',
      value: '2',
      count: 0,
    },
  ]);
  const tableData = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const queryParams = ref({
    pageNo: 1,
    pageSize: 10,
    checkStatus: '',
  });
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.value.pageNo,
    pageSize: queryParams.value.pageSize,
  }));
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    Object.assign(queryParams.value, {
      pageNo: 1,
      pageSize: 10,
      checkStatus: '',
    });
    activeTab.value = '1';
    title.value = data.title;
    queryParams.value.checkStatus = data.checkStatus;
    init();
    init('2');
  });
  const init = async (type?) => {
    loading.value = true;
    tableData.value = [];
    const params: any = {
      ...queryParams.value,
      ledgerType: type ? type : activeTab.value,
    };
    if (activeTab.value === '1' && !type) {
      params.fireEquipmentType = '1';
    }
    try {
      const res = await list(params);
      if (!type) {
        tableData.value = res.records;
        total.value = res.total;
      }
      if (type) {
        checkTypeOptions.value[1].count = res.total;
      } else if (!type && activeTab.value === '1') {
        checkTypeOptions.value[0].count = res.total;
      } else if (!type && activeTab.value === '2') {
        checkTypeOptions.value[1].count = res.total;
      }
    } catch (error) {
      tableData.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };
  const handleTableChange = ({ current }) => {
    queryParams.value.pageNo = current;
    init();
  };

  function handleTabChange() {
    queryParams.value.pageNo = 1;
    queryParams.value.pageSize = 10;
    init();
  }

  const getCurrentColumns = () => {
    if (activeTab.value === '1') {
      return columns.filter((item) => item.key !== 'action');
    } else if (activeTab.value === '2') {
      return columns3.filter((item) => item.key !== 'action');
    }
    return [];
  };
</script>
<style lang="less" scoped></style>
