<template>
  <div class="device-statistics">
    <!-- 统计表格 -->
    <div class="statistics-table">
      <a-table
        :columns="columns"
        :data-source="statisticsData"
        :loading="loading"
        :pagination="false"
        :row-class-name="getRowClassName"
        bordered
        size="middle"
      >
        <template #headerCell="{ column }">
          <div class="header-cell">
            <span>{{ column.title }}</span>
            <div v-if="column.sortable" class="sort-buttons" @click="handleSort(column.dataIndex)">
              <CaretUpOutlined :class="['sort-icon', { active: sortField === column.dataIndex && sortOrder === 'asc' }]" />
              <CaretDownOutlined :class="['sort-icon', { active: sortField === column.dataIndex && sortOrder === 'desc' }]" />
            </div>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'online'">
            <span class="status-number online">{{ record.online }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'offline'">
            <span :class="['status-number', record.offline > 0 ? 'offline' : 'normal']">
              {{ record.offline }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'total'">
            <span class="total-number">{{ record.total }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts" name="gasWarning-Statistics" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
  import { statistics } from './statistics.api';

  const loading = ref(false);
  const timer: any = ref(null);
  const statisticsData: any = ref([]);
  const sortField = ref<string>('');
  const sortOrder = ref<'asc' | 'desc'>('asc');
  const columns = [
    {
      title: '厂区',
      dataIndex: 'company',
      key: 'company',
      width: 200,
      align: 'center',
    },
    {
      title: '总设备',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'center',
      sortable: true,
    },
    {
      title: '在线数',
      dataIndex: 'online',
      key: 'online',
      width: 120,
      align: 'center',
      sortable: true,
    },
    {
      title: '离线数',
      dataIndex: 'offline',
      key: 'offline',
      width: 120,
      align: 'center',
      sortable: true,
    },
    {
      title: '故障数',
      dataIndex: 'fault',
      key: 'fault',
      width: 120,
      align: 'center',
      sortable: true,
    },
  ];
  // 添加获取行类名的方法
  const getRowClassName = (record: any) => {
    if (record.company === '统计') {
      return 'statistics-row';
    }
    return '';
  };
  // 处理排序
  const handleSort = (field: string) => {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortField.value = field;
      sortOrder.value = 'asc';
    }
    statisticsData.value.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (sortOrder.value === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };
  // 获取统计数据
  const fetchData = async () => {
    try {
      loading.value = true;
      const data = await statistics();
      // 计算统计合计
      const total = data.reduce((sum, item) => sum + Number(item.total), 0);
      const online = data.reduce((sum, item) => sum + Number(item.online), 0);
      const offline = data.reduce((sum, item) => sum + Number(item.offline), 0);
      const fault = data.reduce((sum, item) => sum + Number(item.fault), 0);
      // 添加统计行
      const statRow = {
        company: '统计',
        total,
        online,
        offline,
        fault,
      };
      statisticsData.value = [...data, statRow];
    } finally {
      loading.value = false;
    }
  };
  // 启动定时器
  const startTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
    }
    timer.value = setInterval(() => {
      fetchData();
    }, 60000);
  };
  // 清除定时器
  const clearTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  };
  onMounted(() => {
    fetchData();
    startTimer();
  });
  onUnmounted(() => {
    clearTimer();
  });
</script>

<style lang="less" scoped>
  .device-statistics {
    padding: 4px;
    background: #fff;
    border-radius: 8px;

    .statistics-header {
      margin-bottom: 24px;

      .statistics-title {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
        margin: 0;
        padding-bottom: 12px;
        border-bottom: 3px solid #1890ff;
        display: inline-block;
        min-width: 160px;
      }
    }

    .statistics-table {
      :deep(.ant-table) {
        font-size: 14px;

        .ant-table-thead > tr {
          background: linear-gradient(90deg, #6384f9 0%, #8e54e9 100%);
        }

        .ant-table-thead > tr > th {
          background: transparent;
          font-weight: 600;
          color: #ffffff;
          border-bottom: none;

          &::before {
            background-color: rgba(255, 255, 255, 0.2) !important;
          }

          .header-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;

            .sort-buttons {
              display: flex;
              flex-direction: column;
              cursor: pointer;

              .sort-icon {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                transition: color 0.3s;

                &:hover {
                  color: #ffffff;
                }

                &.active {
                  color: #ffffff;
                }
              }
            }
          }
        }

        .ant-table-tbody > tr > td {
          padding: 4px 16px;

          .status-number {
            font-weight: 600;
            font-size: 16px;

            &.online {
              color: #52c41a;
            }

            &.offline {
              color: #ff4d4f;
            }

            &.normal {
              color: #52c41a;
            }
          }

          .total-number {
            font-weight: 600;
            font-size: 16px;
            color: #1890ff;
          }
        }

        .statistics-row {
          background-color: #f0f8ff;

          > td {
            font-weight: 600;
            color: #1890ff;
          }
        }
      }
    }

    .refresh-section {
      margin-top: 24px;
      text-align: center;
    }
  }
</style>
