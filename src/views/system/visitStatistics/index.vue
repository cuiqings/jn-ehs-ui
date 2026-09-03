<template>
  <div class="visit-statistics-container">
    <a-card title="访问统计" :bordered="false">
      <div class="search-bar">
        <a-month-picker v-model:value="filterMonth" placeholder="选择月份" allow-clear style="width: 160px" />
        <a-button type="primary" style="margin-left: 12px" :loading="exportLoading" @click="handleExport">导出</a-button>
      </div>

      <a-spin :spinning="loading">
        <a-empty v-if="!loading && filteredData.length === 0" description="暂无统计数据" />

        <div v-for="item in filteredData" :key="item.yearMonth" class="month-block">
          <div class="month-title">{{ item.yearMonth }}</div>
          <a-table
            :columns="columns"
            :data-source="buildTableData(item)"
            :pagination="false"
            bordered
            size="small"
            row-key="date"
            :custom-row="customRow"
          />
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import type { Dayjs } from 'dayjs';
  import { getVisitStatisticsList, exportVisitStatistics } from '/@/api/sys/visitStatistics';

  interface DayVO {
    date: string;
    count: number;
  }

  interface MonthVO {
    yearMonth: string;
    year: number;
    month: number;
    days: DayVO[];
    total: number;
  }

  interface TableRow {
    date: string;
    count: number | string;
    isTotal: boolean;
  }

  const loading = ref(false);
  const exportLoading = ref(false);
  const monthlyData = ref<MonthVO[]>([]);
  const filterMonth = ref<Dayjs | null>(null);

  const filteredData = computed(() => {
    if (!filterMonth.value) return monthlyData.value;
    const year = filterMonth.value.year();
    const month = filterMonth.value.month() + 1;
    return monthlyData.value.filter((item) => item.year === year && item.month === month);
  });

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: '60%' },
    { title: '访问人数', dataIndex: 'count', key: 'count', width: '40%' },
  ];

  function buildTableData(item: MonthVO): TableRow[] {
    const rows: TableRow[] = (item.days || []).map((d) => ({
      date: d.date,
      count: d.count,
      isTotal: false,
    }));
    rows.push({ date: '总计', count: item.total, isTotal: true });
    return rows;
  }

  function customRow(record: TableRow) {
    return record.isTotal ? { class: 'total-row' } : {};
  }

  async function loadData() {
    loading.value = true;
    try {
      const data = await getVisitStatisticsList();
      monthlyData.value = data || [];
    } catch (e) {
      message.error('加载失败');
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => loadData());

  async function handleExport() {
    exportLoading.value = true;
    try {
      const params: { year?: number; month?: number } = {};
      if (filterMonth.value) {
        params.year = filterMonth.value.year();
        params.month = filterMonth.value.month() + 1;
      }
      await exportVisitStatistics(params);
    } finally {
      exportLoading.value = false;
    }
  }
</script>

<style scoped>
  .visit-statistics-container {
    padding: 12px;
  }

  .search-bar {
    margin-bottom: 16px;
  }

  .month-block {
    margin-bottom: 32px;
  }

  .month-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.85);
  }

  :deep(.total-row) td {
    font-weight: 700;
    background-color: #fafafa;
  }
</style>
