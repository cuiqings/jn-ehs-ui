<template>
  <div class="emergency-panel">
    <!-- Common Filter Section -->
    <div class="panel-section filter-section">
      <div class="filter-bar">
        <a-date-picker
          v-model:value="selectedDate"
          picker="month"
          format="YYYY-MM"
          :allow-clear="false"
          style="width: 200px"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Top Section: Drill Task Statistics -->
    <div class="panel-section">
      <div class="section-header">
        <div class="title-bar">
          <span class="bar">|</span>
          <span class="title">各事业部演练任务统计</span>
        </div>
      </div>

      <div class="table-container">
        <a-table :columns="columns" :data-source="drillData" :pagination="false" :loading="loading" size="middle" bordered row-key="id">
          <template #bodyCell="{ column, text, index }">
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'completedCount'">
              <span style="color: #52c41a; font-weight: bold">{{ text }}</span>
            </template>
            <template v-if="column.key === 'overdueCompletedCount'">
              <span style="color: #faad14; font-weight: bold">{{ text }}</span>
            </template>
            <template v-if="column.key === 'overdueUncompletedCount'">
              <span style="color: #ff4d4f; font-weight: bold">{{ text }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Bottom Section: Overdue Lists -->
    <div class="panel-section lists-section">
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="list-card">
            <div class="section-header">
              <div class="title-bar">
                <span class="bar">|</span>
                <span class="title">超期演练列表</span>
              </div>
            </div>
            <!-- Overdue Drill List -->
            <div class="table-wrapper">
              <a-table
                class="overdue-table"
                :columns="overdueColumns"
                :data-source="overdueDrillList"
                :pagination="false"
                size="small"
                bordered
                row-key="id"
              >
                <template #bodyCell="{ column, text, index }">
                  <template v-if="column.key === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.key === 'content'">
                    <span style="color: #faad14; font-weight: bold">{{ text }}</span>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="list-card">
            <div class="section-header">
              <div class="title-bar">
                <span class="bar">|</span>
                <span class="title">超期未演练列表</span>
              </div>
            </div>
            <!-- Overdue Uncompleted Drill List -->
            <div class="table-wrapper">
              <a-table
                class="overdue-table"
                :columns="overdueColumns"
                :data-source="overdueUncompletedDrillList"
                :pagination="false"
                size="small"
                bordered
                row-key="id"
              >
                <template #bodyCell="{ column, text, index }">
                  <template v-if="column.key === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.key === 'content'">
                    <span style="color: #ff4d4f; font-weight: bold">{{ text }}</span>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import { getTaskNumList, getOverdueList, getOverdueNotList } from '../api';

  // --- State ---
  const loading = ref(false);
  const selectedDate = ref<Dayjs>(dayjs().subtract(1, 'month'));
  const drillData = ref<any[]>([]);
  const overdueDrillList = ref<any[]>([]);
  const overdueUncompletedDrillList = ref<any[]>([]);

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      align: 'center',
    },
    {
      title: '事业部',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: '演练任务总数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      align: 'center',
    },
    {
      title: '演练完成数量',
      dataIndex: 'completeCount',
      key: 'completeCount',
      align: 'center',
    },
    {
      title: '超期完成数量',
      dataIndex: 'overdueCount',
      key: 'overdueCount',
      align: 'center',
    },
    {
      title: '超期未完成数量',
      dataIndex: 'overdueUncompletedCount',
      key: 'overdueUncompletedCount',
      align: 'center',
    },
  ];

  const overdueColumns = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      align: 'center',
    },
    {
      title: '事业部',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 120,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '车间',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 100,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '演练内容',
      dataIndex: 'drillContent',
      key: 'drillContent',
      width: 140,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '演练地点',
      dataIndex: 'drillPlace',
      key: 'drillPlace',
      width: 100,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '计划实施时间',
      dataIndex: 'drillTime',
      key: 'drillTime',
      width: 120,
      align: 'center',
    },
  ];

  const fetchDrillData = async (year: number, month: number | string): Promise<any[]> => {
    const params = {
      year,
      month,
    };
    const res = await getTaskNumList(params);
    return res || [];
  };

  /**
   * 处理日期变化事件
   */
  const handleDateChange = () => {
    init();
  };

  /**
   * 初始化组件数据
   * @param dateRange 时间范围 (此处为了兼容保留参数，实际上使用 internal selectedDate)
   */
  const init = async (dateRange?: [Dayjs, Dayjs]) => {
    console.log('EmergencyPanel init', dateRange);
    loading.value = true;
    try {
      const year = selectedDate.value.year();
      const month = (selectedDate.value.month() + 1).toString().padStart(2, '0');
      const res = await fetchDrillData(year, month);
      drillData.value = res || [];
      overdueDrillList.value = (await getOverdueList({ year, month })) || [];
      overdueUncompletedDrillList.value = (await getOverdueNotList({ year, month })) || [];
    } catch (error) {
      console.error('Failed to fetch drill data', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    init();
  });

  defineExpose({
    init,
  });
</script>

<style scoped lang="less">
  .emergency-panel {
    width: 100%;
    height: 100%;
    background-color: #f0f2f5;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .panel-section {
      background: #fff;
      border-radius: 4px;
      padding: 16px;
      display: flex;
      flex-direction: column;

      &.filter-section {
        padding: 12px 16px;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;

        .filter-bar {
          display: flex;
          align-items: center;

          .filter-label {
            margin-right: 8px;
            font-weight: bold;
          }
        }
      }

      &.lists-section {
        background: transparent;
        padding: 0;

        .list-card {
          background: #fff;
          border-radius: 4px;
          padding: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;

          .empty-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #999;
            min-height: 200px;
          }
        }
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-bar {
        display: flex;
        align-items: center;

        .bar {
          color: #1890ff;
          font-weight: bold;
          margin-right: 8px;
          font-size: 16px;
        }

        .title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      }
    }

    .table-container {
      flex: 1;
    }

    :deep(.overdue-table) {
      .ant-table-thead > tr > th {
        background: #722ed1;
        color: #fff;
        font-weight: bold;
        text-align: center;
      }
      .ant-table-tbody > tr:nth-child(even) > td {
        background-color: #fafafa;
      }
      .ant-table-tbody > tr > td {
        padding: 8px;
      }
    }
  }
</style>
