<template>
  <div class="facility-panel">
    <div class="panel-left">
      <div class="panel-header">
        <span class="header-line"></span>
        <span class="header-title">各事业部设备设施状态统计</span>
      </div>
      <div class="panel-content">
        <a-table :columns="equipmentColumns" :data-source="equipmentData" :pagination="false" :loading="equipmentLoading" size="middle" bordered row-key="id">
          <template #bodyCell="{ column, text, record }">
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

    <div class="panel-right">
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
          row-key="id"
        >
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.key === 'rank'">
              <div class="rank-badge" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
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
  import { ref, onMounted, h } from 'vue';
  import { getEquipmentStatusStatistics, getEquipmentCheckStatistics } from '../api';

  const equipmentLoading = ref(false);
  const inspectionLoading = ref(false);
  const equipmentData = ref([]);
  const inspectionData = ref([]);

  /**
   * 获取用于排序的数值，'-' 视为 -1
   * @param rate 比率字符串
   */
  const getSortValue = (rate: string) => {
    if (rate === '-' || rate === null || rate === undefined) return -1;
    return parseFloat(rate);
  };

  // 左侧设备状态统计表头配置
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
        {
          title: '正常',
          dataIndex: 'count11',
          key: 'count11',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #52c41a' }, text),
        },
        {
          title: '超期未检',
          dataIndex: 'count12',
          key: 'count12',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #f5222d' }, text),
        },
        {
          title: '即将到期',
          dataIndex: 'count13',
          key: 'count13',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #fa8c16' }, text),
        },
        {
          title: '超期未检率',
          dataIndex: 'rate1',
          key: 'rate1',
          align: 'center' as const,
          sorter: (a: any, b: any) => getSortValue(a.rate1) - getSortValue(b.rate1),
        },
      ],
    },
    {
      title: '绝缘工具',
      children: [
        {
          title: '正常',
          dataIndex: 'count21',
          key: 'count21',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #52c41a' }, text),
        },
        {
          title: '超期未检',
          dataIndex: 'count22',
          key: 'count22',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #f5222d' }, text),
        },
        {
          title: '即将到期',
          dataIndex: 'count23',
          key: 'count23',
          align: 'center' as const,
          customRender: ({ text }: any) => h('span', { style: 'color: #fa8c16' }, text),
        },
        {
          title: '超期未检率',
          dataIndex: 'rate2',
          key: 'rate2',
          align: 'center' as const,
          sorter: (a: any, b: any) => getSortValue(a.rate2) - getSortValue(b.rate2),
        },
      ],
    },
  ];

  // 右侧点检完成率表头配置
  const inspectionColumns = [
    {
      title: '排名',
      key: 'index',
      dataIndex: 'index',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '事业部',
      dataIndex: 'org',
      key: 'org',
      align: 'center' as const,
    },
    {
      title: '点检完成率',
      dataIndex: 'rate',
      key: 'rate',
      align: 'center' as const,
    },
  ];

  /**
   * 获取超期未检率颜色
   * @param rate 比率字符串
   */
  const getRateColor = (rate: string) => {
    const val = parseFloat(rate);
    if (val > 10) return '#f5222d';
    if (val > 5) return '#fa8c16';
    return '#f5222d'; // 根据图示，大部分是有颜色的，这里统一用红色系，或者根据实际逻辑调整
  };

  /**
   * 获取排名徽章样式
   * @param rank 排名
   */
  const getRankClass = (rank: number) => {
    if (rank <= 3) return `rank-${rank}`;
    if (rank <= 9) return 'rank-blue';
    return 'rank-red';
  };

  /**
   * 获取设备状态统计数据
   */
  const fetchEquipmentData = async (params?: any) => {
    equipmentLoading.value = true;
    try {
      const res = await getEquipmentStatusStatistics(params);
      console.log('Equipment Status Statistics:', res);
      equipmentData.value = res || [];
    } catch (error) {
      console.error('Failed to fetch equipment data:', error);
    } finally {
      equipmentLoading.value = false;
    }
  };

  /**
   * 模拟获取点检完成率数据
   */
  const fetchInspectionData = async (params: any) => {
    inspectionLoading.value = true;
    try {
      const res = await getEquipmentCheckStatistics(params);
      console.log('Inspection Statistics:', res);
      inspectionData.value = res || [];
    } catch (error) {
      console.error('Failed to fetch inspection data:', error);
    } finally {
      inspectionLoading.value = false;
    }
  };

  /**
   * 初始化数据
   */
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

  const resize = () => {
    // 占位方法，适配父组件调用
  };
  defineExpose({
    init,
    resize,
  });
</script>

<style lang="less" scoped>
  .facility-panel {
    display: flex;
    gap: 16px;
    height: 100%;
    padding: 16px;
    background-color: #f0f2f5;

    .panel-left {
      flex: 2; // 约占 66%
      background: #fff;
      border-radius: 4px;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .panel-right {
      flex: 1; // 约占 33%
      background: #fff;
      border-radius: 4px;
      padding: 16px;
      display: flex;
      flex-direction: column;
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

    .panel-content {
      flex: 1;
      overflow: hidden;
    }

    // 排名徽章样式
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

      &.rank-1,
      &.rank-2,
      &.rank-3 {
        background-color: #ffd700; // 金色/橙色
      }

      &.rank-blue {
        background-color: #1890ff; // 蓝色
      }

      &.rank-red {
        background-color: #ff4d4f; // 红色
      }
    }
  }

  // 深度选择器修改表格样式以匹配图片
  :deep(.ant-table-thead > tr > th) {
    background-color: #5b6bd6 !important; // 紫色表头
    color: #fff !important;
    font-weight: 500;
  }

  :deep(.ant-table-thead > tr > th.ant-table-column-has-sorters:hover) {
    background-color: #4a5bc4 !important;
  }

  :deep(.ant-table-row:nth-child(even)) {
    background-color: #fafafa; // 斑马纹
  }

  .rate-success {
    color: #52c41a;
    font-weight: 500;
  }
</style>
