<template>
  <div class="facility-panel">
    <!-- 上：各事业部设备设施状态统计 -->
    <div class="panel-block">
      <div class="panel-header">
        <span class="header-line"></span>
        <span class="header-title">各事业部设备设施状态统计</span>
      </div>
      <div class="panel-content">
        <a-table :columns="equipmentColumns" :data-source="equipmentData" :pagination="false" :loading="equipmentLoading" size="middle" bordered row-key="id">
          <template #bodyCell="{ column, text }">
            <template v-if="column.key === 'rate1'">
              <span :style="{ color: getRateColor(text) }">{{ text !== '-' ? text + '%' : text }}</span>
            </template>
            <template v-if="column.key === 'rate2'">
              <span :style="{ color: getRateColor(text) }">{{ text !== '-' ? text + '%' : text }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 下：各事业部脱水器点检完成率 -->
    <div class="panel-block">
      <div class="panel-header">
        <span class="header-line"></span>
        <span class="header-title">各事业部脱水器点检完成率</span>
      </div>
      <div class="panel-content">
        <a-table
          :columns="inspectionColumns"
          :data-source="inspectionData"
          :pagination="false"
          :loading="inspectionLoading"
          size="middle"
          bordered
          row-key="org"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'rank'">
              <div class="rank-badge" :class="getRankClass(record.index)">{{ record.index }}</div>
            </template>
            <template v-if="column.key === 'checkedCount'">
              <span style="color: #52c41a">{{ text }}</span>
            </template>
            <template v-if="column.key === 'uncheckedCount'">
              <span :style="{ color: Number(text) > 0 ? '#f5222d' : 'inherit' }">{{ text }}</span>
            </template>
            <template v-if="column.key === 'rate'">
              <span class="rate-success">{{ text !== '-' ? text + '%' : text }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { getEquipmentStatusStatistics, getEquipmentCheckStatistics } from '../api';

  const equipmentLoading = ref(false);
  const inspectionLoading = ref(false);
  const equipmentData = ref([]);
  const inspectionData = ref([]);

  const getSortValue = (rate: string) => {
    if (rate === '-' || rate === null || rate === undefined) return -1;
    return parseFloat(rate);
  };

  // 设备设施状态统计表头
  const equipmentColumns = [
    {
      title: '事业部',
      dataIndex: 'org',
      key: 'org',
      width: 150,
      fixed: 'left' as const,
      align: 'center' as const,
    },
    {
      title: '灭火器',
      children: [
        { title: '正常', dataIndex: 'count11', key: 'count11', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#52c41a' } }, text) },
        { title: '超期未检', dataIndex: 'count12', key: 'count12', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#f5222d' } }, text) },
        { title: '即将到期', dataIndex: 'count13', key: 'count13', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#fa8c16' } }, text) },
        { title: '超期未检率', dataIndex: 'rate1', key: 'rate1', align: 'center' as const, sorter: (a: any, b: any) => getSortValue(a.rate1) - getSortValue(b.rate1) },
      ],
    },
    {
      title: '绝缘工具',
      children: [
        { title: '正常', dataIndex: 'count21', key: 'count21', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#52c41a' } }, text) },
        { title: '超期未检', dataIndex: 'count22', key: 'count22', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#f5222d' } }, text) },
        { title: '即将到期', dataIndex: 'count23', key: 'count23', align: 'center' as const, customRender: ({ text }: any) => h('span', { style: { color: '#fa8c16' } }, text) },
        { title: '超期未检率', dataIndex: 'rate2', key: 'rate2', align: 'center' as const, sorter: (a: any, b: any) => getSortValue(a.rate2) - getSortValue(b.rate2) },
      ],
    },
  ];

  // 脱水器点检完成率表头
  const inspectionColumns = [
    { title: '排名', key: 'rank', dataIndex: 'index', width: 70, align: 'center' as const },
    { title: '事业部', dataIndex: 'org', key: 'org', align: 'center' as const },
    { title: '点检任务数量', dataIndex: 'checkTaskSum', key: 'checkTaskSum', align: 'center' as const },
    { title: '已点检数量', dataIndex: 'checkTask', key: 'checkedCount', align: 'center' as const },
    { title: '未点检数量', dataIndex: 'noCheckTask', key: 'uncheckedCount', align: 'center' as const },
    { title: '点检完成率', dataIndex: 'rate', key: 'rate', align: 'center' as const },
  ];

  const getRateColor = (rate: string) => {
    const val = parseFloat(rate);
    if (val > 10) return '#f5222d';
    if (val > 5) return '#fa8c16';
    return '#f5222d';
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-blue';
  };

  const fetchEquipmentData = async (params?: any) => {
    equipmentLoading.value = true;
    try {
      const res = await getEquipmentStatusStatistics(params);
      equipmentData.value = res || [];
    } catch (error) {
      console.error('Failed to fetch equipment data:', error);
    } finally {
      equipmentLoading.value = false;
    }
  };

  const fetchInspectionData = async (params?: any) => {
    inspectionLoading.value = true;
    try {
      const res = await getEquipmentCheckStatistics(params);
      inspectionData.value = res || [];
    } catch (error) {
      console.error('Failed to fetch inspection data:', error);
    } finally {
      inspectionLoading.value = false;
    }
  };

  const init = async (dateRange?: any, orgCode?: string) => {
    let params: any = {};
    if (dateRange) {
      params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
    }
    if (orgCode) {
      params.orgCode = orgCode;
    }
    fetchEquipmentData(params);
    fetchInspectionData(params);
  };

  const resize = () => {};

  defineExpose({ init, resize });
</script>

<style lang="less" scoped>
  .facility-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    padding: 16px;
    background-color: #f0f2f5;
    overflow-y: auto;

    .panel-block {
      background: #fff;
      border-radius: 4px;
      padding: 16px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .header-line {
        width: 4px;
        height: 16px;
        background-color: #1890ff;
        margin-right: 8px;
        border-radius: 2px;
      }

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .rank-badge {
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 50%;
      margin: 0 auto;
      color: #fff;
      font-size: 12px;
      font-weight: bold;

      &.rank-1 { background-color: #ff9a3c; }
      &.rank-2 { background-color: #ffb800; }
      &.rank-3 { background-color: #ffd700; }
      &.rank-blue { background-color: #1890ff; }
    }
  }

  :deep(.ant-table-thead > tr > th) {
    background-color: #5b6bd6 !important;
    color: #fff !important;
    font-weight: 500;
  }

  :deep(.ant-table-thead > tr > th.ant-table-column-has-sorters:hover) {
    background-color: #4a5bc4 !important;
  }

  :deep(.ant-table-row:nth-child(even)) {
    background-color: #fafafa;
  }

  .rate-success {
    color: #52c41a;
    font-weight: 500;
  }
</style>
