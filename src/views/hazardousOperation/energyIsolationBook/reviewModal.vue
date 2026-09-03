<template>
  <BasicModal
    v-bind="$attrs"
    :canFullscreen="false"
    @register="register"
    :width="900"
    :title="title"
    :get-container="getContainer"
    :zIndex="999"
    @ok="isoConfirm"
    destroyOnClose
  >
    <a-table
      :columns="columns6"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      :rowSelection="rowSelection"
      :scroll="tableData.length > 0 ? { x: 1200 } : false"
      bordered
      rowKey="id"
      size="small"
      style="background: #fff;"
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
  </BasicModal>
</template>
<script lang="ts" name="review-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { list } from '../../socialFacilitiesManage/ledger/api'
  import { ref, reactive, computed } from 'vue';
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const title = ref('能源隔离点位');
  const getContainer = () => document.getElementById('app');
  const [register, { closeModal }] = useModalInner((data) => {
    globalSelectedRowKeys.value = data.value;
    queryParams.org = data.orgCode;
    queryParams.depart = data.workShop;
    getData();
  });

  const tableData = ref<any[]>([]);
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.pageNo,
    pageSize: queryParams.pageSize,
  }));
  const globalSelectedRowKeys = ref<any[]>([]);
  const rowSelection = computed(() => {
    return {
      selectedRowKeys: getCurrentPageSelectedKeys(),
      onSelect: (record, selected) => {
        const rowId = record.id;
        if (selected) {
          // 选中：若全局数组中没有该ID，添加
          if (!globalSelectedRowKeys.value[rowId]) {
            globalSelectedRowKeys.value.push({id: rowId, name: record.quarantineSiteName});
          }
        } else {
          // 取消选中：从全局数组中删除该ID
          globalSelectedRowKeys.value = globalSelectedRowKeys.value.filter(item => item.id !== rowId);
        }
        console.log(globalSelectedRowKeys.value);
        
      },
      onSelectAll: (selected, selectedRows) => {
        const currentPageRowIds = selectedRows.map(item => ({id: item.id, name: item.quarantineSiteName}));
        if (selected) {
          // 全选：将当前页所有ID添加到全局数组（去重）
          currentPageRowIds.forEach(val => {
            if (!globalSelectedRowKeys.value.find(item => val.id === item.id)) {
              globalSelectedRowKeys.value.push(val);
            }
          });
        } else {
          const currentPageRowIds = tableData.value.map(item => ({id: item.id, name: item.quarantineSiteName}));
          // 取消全选：从全局数组中删除当前页所有ID
          globalSelectedRowKeys.value = globalSelectedRowKeys.value.filter(item => !currentPageRowIds.some(val => val.id == item.id));
        }
        console.log(globalSelectedRowKeys.value);
      },
    };
  });
 
  function getCurrentPageSelectedKeys() {
    // 当前页所有行的ID
    const currentPageRowIds = tableData.value.map(item => item.id);
    const res = globalSelectedRowKeys.value.filter(item => currentPageRowIds.find(val => val === item.id));
    // 全局选中数组中，属于当前页的ID
    return res.map(item => item.id);
  }
  const queryParams = reactive({
    org: '',
    depart: '',
    pageNo: 1,
    pageSize: 10,
    ledgerType: 5
  });
  const handleTableChange = ({ current, pageSize }) => {
    queryParams.pageNo = current;
    queryParams.pageSize = pageSize;
    getData();
  };
  // 能源隔离点位台账
  const columns6 = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
    { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
    { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
    { title: '区域', dataIndex: 'region', key: 'region', align: 'center', width: 150, ellipsis: true },
    {
      title: '设备设施',
      dataIndex: 'equipmentFacilities',
      key: 'equipmentFacilities',
      align: 'center',
      width: 150,
      ellipsis: true,
    },
    {
      title: '作业指导书',
      dataIndex: 'workingInstruction',
      key: 'workingInstruction',
      align: 'center',
      width: 150,
      ellipsis: true,
    },
    {
      title: '隔离点位名称',
      dataIndex: 'quarantineSiteName',
      key: 'quarantineSiteName',
      align: 'center',
      width: 150,
      ellipsis: true,
    },
    {
      title: '能源介质类型',
      dataIndex: 'energyMediumType_dictText',
      key: 'energyMediumType_dictText',
      align: 'center',
      width: 150,
      ellipsis: true,
    },
    { title: '位置', dataIndex: 'position', key: 'position', align: 'center', width: 150, ellipsis: true },
    { title: '能源隔离点编号', dataIndex: 'code', key: 'code', align: 'center', width: 150, ellipsis: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', width: 200, ellipsis: true },
  ];
  const getData = () => {
    list(queryParams).then((res) => {
      tableData.value = res.records;
      total.value = res.total;
    });
  }

  const isoConfirm = () => {
    emit('success', globalSelectedRowKeys.value);
    close();
  };

  const close = () => {
    closeModal();
  };
</script>
<style lang="less"></style>
