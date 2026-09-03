<template>
  <div class="team-panel">
    <a-spin :spinning="loading">
      <!-- Overall Statistics Section -->
      <div class="panel-header">
        <div class="title-line"></div>
        <span class="panel-title">总体统计</span>
      </div>

      <div class="top-stats-container">
        <div class="stat-card purple">
          <div class="stat-value">{{ overallStats.avgRate }}%</div>
          <div class="stat-label">平均班前会比例</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{{ overallStats.maxRate }}%</div>
          <div class="stat-label">最高比例</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-value">{{ overallStats.minRate }}%</div>
          <div class="stat-label">最低比例</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-value">{{ overallStats.overNumber }}个</div>
          <div class="stat-label">超过平均值的事业部</div>
        </div>
      </div>

      <!-- Department Statistics Section -->
      <div class="panel-header" style="margin-top: 20px">
        <div class="title-line"></div>
        <span class="panel-title">各事业部班前会比例统计</span>
      </div>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          row-key="id"
          :row-class-name="getRowClassName"
          size="middle"
          :bordered="false"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'rank'">
              <div class="rank-badge" :class="getRankClass(index + 1)">
                {{ index + 1 }}
              </div>
            </template>
            <template v-else-if="column.key === 'rate'">
              <div class="ratio-cell">
                <a-progress
                  :percent="parseFloat(record.rate)"
                  :stroke-color="getProgressColor(index)"
                  :show-info="false"
                  stroke-linecap="round"
                  :stroke-width="16"
                  class="custom-progress"
                />
                <span class="ratio-text">{{ record.rate }}%</span>
              </div>
            </template>

            <template v-else-if="column.key === 'avg'">
              <span class="avg-text">{{ record.avg }}%</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { getPreDutyReviewStatistics } from '../api';

  // Types
  interface OverallStats {
    avgRate: string;
    maxRate: string;
    minRate: string;
    overNumber: number;
  }

  // State
  const loading = ref(false);
  const overallStats = ref<OverallStats>({
    avgRate: '0.00',
    maxRate: '0',
    minRate: '0',
    overNumber: 0,
  });

  const tableData = ref([]);

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      align: 'center',
      customRender: (text, record, index) => {
        return index + 1;
      },
    },
    {
      title: '事业部',
      dataIndex: 'org',
      key: 'org',
      align: 'center',
    },
    {
      title: '应开班前会次数',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
    },
    {
      title: '已开班前会次数',
      dataIndex: 'completeCount',
      key: 'completeCount',
      align: 'center',
    },
    {
      title: '班前会比例',
      key: 'rate',
      dataIndex: 'rate',
      align: 'center',
      width: 300,
    },
    {
      title: '平均班前会比例',
      dataIndex: 'avg',
      key: 'avg',
      align: 'center',
    },
  ];

  const init = async (dateRange: [Dayjs, Dayjs], orgCode?: string) => {
    console.log('TeamPanel init', dateRange, orgCode);
    loading.value = true;
    try {
      // 请求参数
      const params: any = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      if (orgCode) {
        params.orgCode = orgCode;
      }
      const res = await getPreDutyReviewStatistics(params);
      console.log('TeamPanel init res', res);
      overallStats.value = res;
      tableData.value = res.orgList;
    } finally {
      loading.value = false;
    }
  };

  const resize = () => {
    console.log('TeamPanel resize');
  };

  // Styling Helpers
  const getRowClassName = (record: any, index: number) => {
    const total = tableData.value.length;
    if (index < 3) return 'row-top-3';
    if (index >= total - 3) return 'row-bottom-4'; // Last 3 items
    return 'row-middle';
  };

  const getRankClass = (rank: number) => {
    const total = tableData.value.length;
    if (rank <= 3) return 'rank-top';
    if (rank > total - 3) return 'rank-bottom'; // Last 3 items
    return 'rank-other';
  };

  const getProgressColor = (index: number) => {
    const total = tableData.value.length;
    if (index < 3) return '#64cc45'; // Top 3 Green
    if (index >= total - 3) return '#ff4d4f'; // Bottom 3 Red
    return '#1890ff'; // Others Blue
  };

  defineExpose({
    init,
    resize,
  });
</script>

<style scoped lang="less">
  .team-panel {
    width: 100%;
    height: 100%;
    min-height: 400px;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;

    .panel-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-left: 5px;

      .title-line {
        width: 4px;
        height: 18px;
        background-color: #1890ff;
        margin-right: 10px;
        border-radius: 2px;
      }

      .panel-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    .top-stats-container {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 20px;

      .stat-card {
        flex: 1;
        height: 80px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.9;
        }

        &.purple {
          background: linear-gradient(135deg, #7e6bc4, #6b5eae);
        }
        &.green {
          background: linear-gradient(135deg, #64cc45, #52ba34);
        }
        &.orange {
          background: linear-gradient(135deg, #ffa900, #e69800);
        }
        &.blue {
          background: linear-gradient(135deg, #1890ff, #096dd9);
        }
      }
    }

    .table-container {
      :deep(.ant-table-thead > tr > th) {
        background-color: #7e6bc4;
        color: #fff;
        font-weight: bold;
        text-align: center;
        padding: 12px 8px;
        border-bottom: none;
      }

      :deep(.ant-table-tbody > tr > td) {
        padding: 12px 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      // Row styling
      :deep(.row-top-3) {
        background-color: #fffbf0; // Light yellow
        &:hover > td {
          background-color: #fff7e6 !important;
        }
      }

      :deep(.row-middle) {
        background-color: #f0f7ff; // Very light blue
        &:hover > td {
          background-color: #e6f7ff !important;
        }
      }

      :deep(.row-bottom-4) {
        background-color: #fff1f0; // Light red
        &:hover > td {
          background-color: #ffccc7 !important;
        }
      }

      // Rank Badge
      .rank-badge {
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 50%;
        color: #fff;
        font-weight: bold;
        font-size: 12px;
        margin: 0 auto;

        &.rank-top {
          background-color: #64cc45;
        }
        &.rank-bottom {
          background-color: #ff4d4f;
        }
        &.rank-other {
          background-color: #1890ff;
        }
      }

      // Progress Bar
      .ratio-cell {
        display: flex;
        align-items: center;

        .custom-progress {
          flex: 1;
          margin-right: 10px;

          :deep(.ant-progress-bg) {
            height: 16px !important;
          }
          :deep(.ant-progress-inner) {
            background-color: rgba(255, 255, 255, 0.5); // Slightly transparent track
          }
        }

        .ratio-text {
          font-weight: bold;
          min-width: 45px;
          text-align: right;
          // Color logic could be here, but let's keep it simple black/white depending on contrast?
          // Actually in the image the text is white inside the bar...
          // Ant Design Progress puts text outside by default or inside.
          // The image shows text inside the bar at the right end.
          // Achieving "text inside bar" with AntD is tricky if we want exact look.
          // The image has text *inside* the colored bar.
          // Let's stick to text outside for now for simplicity, or position absolute.
          // Looking at the image again:
          // "99%" is inside the green bar on the right.
          // "83.00%" (avg) is text in the next column.
        }
      }

      .avg-text {
        color: #64cc45; // Or whatever color matches the image
        font-weight: bold;

        // Image shows:
        // Rows 1-3 (Yellow bg): Green text "83.00%"
        // Rows 4-8 (Blue bg): Blue text "83.00%"
        // Rows 9-12 (Red bg): Red text "83.00%"
      }

      // Override avg text color based on row
      :deep(.row-top-3) .avg-text {
        color: #64cc45;
      }
      :deep(.row-middle) .avg-text {
        color: #1890ff;
      }
      :deep(.row-bottom-4) .avg-text {
        color: #ff4d4f;
      }
    }
  }
</style>
