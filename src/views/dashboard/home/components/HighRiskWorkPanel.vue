<template>
  <a-spin :spinning="spinning" tip="加载中...">
    <div class="high-risk-panel">
      <div class="panel-card">
        <div class="card-header">
          <div class="card-title">高危作业总量</div>
          <div class="card-icon">
            <Icon icon="ant-design:bar-chart-outlined" :size="30" color="#1890ff" />
          </div>
        </div>
        <div class="total-count">{{ gwData.total }}<span class="unit">项</span></div>
        <div class="work-list">
          <div class="work-group">
            <div class="group-title">一级高危({{ gwData.oneWork }}项)</div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全部</div>
                <div class="value">检查完成率{{ gwData.oneWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.oneWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">副部长</div>
                <div class="value">检查完成率{{ gwData.oneFbzWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.oneFbzWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全科长</div>
                <div class="value">检查完成率{{ gwData.oneAqkzWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.oneAqkzWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全科</div>
                <div class="value">检查完成率{{ gwData.oneAqkWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.oneAqkWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">车间主任</div>
                <div class="value">检查完成率{{ gwData.oneCjZrWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.oneCjZrWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
          </div>
          <div class="work-group">
            <div class="group-title">二级高危({{ gwData.twoWork }}项)</div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全部</div>
                <div class="value">检查完成率{{ gwData.twoWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.twoWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">副部长</div>
                <div class="value">检查完成率{{ gwData.twoFbzWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.twoFbzWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>

            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全科长</div>
                <div class="value">检查完成率{{ gwData.twoAqkzWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.twoAqkzWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">安全科</div>
                <div class="value">检查完成率{{ gwData.twoAqkWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.twoAqkWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <div class="label">车间主任</div>
                <div class="value">检查完成率{{ gwData.twoCjZrWorkRate }}%</div>
              </div>
              <div class="progress-wrapper">
                <a-progress :percent="gwData.twoCjZrWorkRate" :show-info="false" stroke-color="#52c41a" :stroke-width="6" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel-card">
        <div class="card-header">
          <div class="card-title">问题整改情况</div>
          <div class="card-icon">
            <Icon icon="ant-design:warning-outlined" :size="30" color="#faad14" />
          </div>
        </div>
        <div class="total-count">{{ gwData.problem }}<span class="unit">个问题</span></div>
        <div class="rectification-status">
          <div class="status-row">
            <div class="status-label">已整改 ({{ gwData.rectify }}个)</div>
            <div class="status-value">{{ calculatePercentage(gwData.problem, gwData.rectify) }}%</div>
          </div>
          <a-progress :percent="calculatePercentage(gwData.problem, gwData.rectify)" :show-info="false" stroke-color="#389e0d" :stroke-width="10" />
          <div class="status-row" style="margin-top: 12px">
            <div class="status-label">未整改 ({{ gwData.unComplete }}个)</div>
            <div class="status-value status-error">{{ calculateRemainderPercentage(gwData.problem, gwData.rectify) }}%</div>
          </div>
          <a-progress
            :percent="calculateRemainderPercentage(gwData.problem, gwData.rectify)"
            :show-info="false"
            stroke-color="#ff4d4f"
            :stroke-width="10"
          />
        </div>
        <div class="chart-container">
          <div ref="rectificationChartRef" style="width: 100%; height: 100%"></div>
        </div>
      </div>
      <div class="panel-card">
        <div class="card-header">
          <div class="card-title">带布控球作业</div>
          <div style="cursor: pointer" class="card-icon" @click="handleZyModal">
            <Icon icon="ant-design:video-camera-outlined" :size="30" color="#52c41a" />
          </div>
        </div>
        <div class="total-count">{{ gwData.totalBkq }}<span class="unit">项</span></div>
        <div class="rectification-status">
          <div class="status-row">
            <div class="status-label">待作业 ({{ gwData.waitWork }}项)</div>
            <div class="status-value">{{ calculatePercentage(gwData.totalBkq, gwData.waitWork) }}%</div>
          </div>
          <a-progress :percent="calculatePercentage(gwData.totalBkq, gwData.waitWork)" :show-info="false" stroke-color="#faad14" :stroke-width="10" />
          <div class="status-row" style="margin-top: 12px">
            <div class="status-label">作业中 ({{ gwData.working }}项)</div>
            <div class="status-value">{{ calculateRemainderPercentage(gwData.totalBkq, gwData.waitWork) }}%</div>
          </div>
          <a-progress
            :percent="calculateRemainderPercentage(gwData.totalBkq, gwData.waitWork)"
            :show-info="false"
            stroke-color="#1890ff"
            :stroke-width="10"
          />
        </div>
        <div class="chart-container">
          <div ref="controlBallChartRef" style="width: 100%; height: 100%"></div>
        </div>
      </div>
    </div>
  </a-spin>
  <ControlBallDetailModal ref="controlBallDetailModalRef" />
  <ReportRateTable ref="reportRateRef" :dateRange="currentDateRange" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Icon from '/@/components/Icon';
  import { useECharts } from '/@/hooks/web/useECharts';
  import ControlBallDetailModal from './ControlBallDetailModal.vue';
  import ReportRateTable from './ReportRateTable.vue';
  import { getDangerousWorkStatistics } from '../api';
  const rectificationChartRef = ref<HTMLDivElement | null>(null);
  const controlBallChartRef = ref<HTMLDivElement | null>(null);
  const { setOptions: setRectificationOptions, getInstance: getRectificationInstance } = useECharts(rectificationChartRef as any);
  const { setOptions: setControlBallOptions, getInstance: getControlBallInstance } = useECharts(controlBallChartRef as any);
  const controlBallDetailModalRef = ref();
  const gwData: any = ref({});
  const spinning = ref(false);
  const currentDateRange = ref<any[]>([]);
  const reportRateRef = ref();
  const init = (date) => {
    currentDateRange.value = date;
    spinning.value = true;
    getDangerousWorkStatistics({
      startDate: date[0].format('YYYY-MM-DD'),
      endDate: date[1].format('YYYY-MM-DD'),
    })
      .then((res) => {
        if (res.success) {
          initRectificationChart([
            { value: res.result.rectify, name: '已整改', itemStyle: { color: '#389e0d' } },
            { value: res.result.unComplete, name: '未整改', itemStyle: { color: '#ff4d4f' } },
          ]);
          initControlBallChart([
            { value: res.result.waitWork, name: '待作业', itemStyle: { color: '#faad14' } },
            { value: res.result.working, name: '作业中', itemStyle: { color: '#1890ff' } },
          ]);
          gwData.value = res.result;
        } else {
          gwData.value = {};
          initRectificationChart([]);
          initControlBallChart([]);
        }
        window.addEventListener('resize', onResize);
        spinning.value = false;
      })
      .catch(() => {
        spinning.value = false;
      });
  };
  const onResize = () => {
    getRectificationInstance()?.resize();
    getControlBallInstance()?.resize();
  };
  const initRectificationChart = (data) => {
    setRectificationOptions({
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c}（{d}%） ',
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
          },
          label: {
            show: true,
            formatter: '{b}：{d}% ',
          },
          data,
        },
      ],
    });
  };
  const initControlBallChart = (data) => {
    setControlBallOptions({
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c}（{d}%） ',
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
          },
          label: {
            show: true,
            formatter: '{b}：{d}% ',
          },
          data,
        },
      ],
    });
  };
  const handleZyModal = () => {
    controlBallDetailModalRef.value.open();
  };
  const calculatePercentage = (total: number, count: number) => {
    if (!total || total === 0) return 0;
    const percent = (count / total) * 100;
    return Math.round(percent * 100) / 100;
  };
  const calculateRemainderPercentage = (total: number, excludeCount: number) => {
    if (!total || total === 0) return 0;
    const excludePercent = calculatePercentage(total, excludeCount);
    return parseFloat((100 - excludePercent).toFixed(2));
  };
  defineExpose({
    init,
  });
</script>

<style scoped lang="less">
  .high-risk-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0;
  }

  .panel-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .card-title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }

  .total-count {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    line-height: 1;

    .unit {
      font-size: 14px;
      font-weight: normal;
      color: #888;
      margin-left: 6px;
    }
  }

  .work-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .work-group {
    .group-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 500;
    }
  }

  .progress-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 6px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 13px;
    }

    .label {
      color: #333;
      font-weight: 500;
    }

    .progress-wrapper {
      width: 100%;
    }

    .value {
      text-align: right;
      color: #666;
    }
  }

  .rectification-status {
    margin-bottom: 24px;

    .status-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;

      .status-label {
        color: #333;
        font-weight: 500;
      }

      .status-value {
        color: #666;
        &.status-error {
          color: #ff4d4f;
        }
      }
    }
  }

  .chart-container {
    align-items: center;
    justify-content: center;
    height: 300px;
    width: 100%;
  }
</style>
