<template>
  <div class="module-weight">
    <div class="section-header">
      <span class="section-num">1</span>
      <span class="section-title">9 模块权重配置</span>
    </div>
    <div class="formula">
      综合得分 = Σ(模块得分 × 模块权重)，Σ权重必须 = 100% ± 容差，否则保存被拒。
    </div>

    <a-table
      size="small"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'weight'">
          <div class="weight-cell">
            <a-input-number
              v-model:value="record.weight"
              :min="0"
              :max="100"
              :precision="0"
              size="small"
              @change="calcTotal"
            />
            <span class="unit">%</span>
          </div>
        </template>
      </template>
      <template #summary>
        <a-table-summary fixed>
          <a-table-summary-row class="summary-row">
            <a-table-summary-cell :index="0" />
            <a-table-summary-cell :index="1" align="right">合计</a-table-summary-cell>
            <a-table-summary-cell :index="2">
              <span :class="['total-value', totalValid ? 'valid' : 'invalid']">{{ total.toFixed(1) }}%</span>
            </a-table-summary-cell>
          </a-table-summary-row>
        </a-table-summary>
      </template>
    </a-table>

    <div class="tip-row">
      <span class="tip-text">ⓘ 直接在权重值与应得分栏修改，右侧仪表盘和明细实时刷新。</span>
      <a class="compliance-link" :class="{ valid: totalValid }">权重合规</a>
    </div>

    <div class="btn-row">
      <a-space>
        <a-button @click="resetDefault">恢复默认权重</a-button>
        <a-button @click="equalWeight">均分权重</a-button>
      </a-space>
      <a-button type="primary" @click="save">保存模块权重</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, inject, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { batchSave } from './api';

  const configData = inject<any>('configData');

  const columns = [
    { title: '#', dataIndex: 'index', width: 60, align: 'center' },
    { title: '模块名称', dataIndex: 'name' },
    { title: '权重值', dataIndex: 'weight', width: 200, align: 'center' },
  ];

  const moduleKeys = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'];
  const moduleNames = ['三项岗位人员', '教育培训', '双控管理', '危险作业', '相关方管理', '应急管理', '职业健康', '安全生产标准化', '煤气预警平台'];
  const defaultWeights = [10, 10, 15, 15, 10, 5, 10, 15, 10];

  const tableData = ref(moduleNames.map((name, i) => ({
    key: moduleKeys[i],
    name,
    weight: defaultWeights[i],
  })));

  const initFromConfig = (data) => {
    tableData.value.forEach((item) => {
      if (data[item.key] !== undefined) {
        item.weight = Number(data[item.key]);
      }
    });
  };

  watch(configData, (val) => {
    if (val && Object.keys(val).length > 0) {
      initFromConfig(val);
    }
  }, { immediate: true });

  const total = computed(() => {
    return tableData.value.reduce((sum, item) => sum + (item.weight || 0), 0);
  });

  const totalValid = computed(() => {
    return Math.abs(total.value - 100) <= 0.1;
  });

  const calcTotal = () => {};

  const resetDefault = () => {
    tableData.value.forEach((item, i) => {
      item.weight = defaultWeights[i];
    });
  };

  const equalWeight = () => {
    const avg = Math.floor(100 / tableData.value.length);
    tableData.value.forEach((item) => {
      item.weight = avg;
    });
  };

  const save = () => {
    if (!totalValid.value) {
      message.error('权重合计必须等于100%，请调整后再保存');
      return;
    }
    const params: Record<string, string> = {};
    tableData.value.forEach((item) => {
      params[item.key] = String(item.weight);
    });
    batchSave(params).then(() => {
      message.success('保存成功');
    });
  };

  defineExpose({ initFromConfig });
</script>
<style lang="less" scoped>
  .module-weight {
    padding: 0 400px;
    .section-header {
      margin-bottom: 8px;
      .section-num {
        display: inline-block;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        background: #1890ff;
        color: #fff;
        border-radius: 50%;
        font-size: 12px;
        margin-right: 8px;
      }
      .section-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    .formula {
      color: #1890ff;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .weight-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      .unit {
        color: #666;
      }
    }
    .summary-row {
      background: #e6f7ff;
    }
    .total-value {
      font-weight: 600;
      font-size: 14px;
      &.valid { color: #52c41a; }
      &.invalid { color: #ff4d4f; }
    }
    .tip-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      .tip-text { color: #999; font-size: 13px; }
      .compliance-link {
        color: #1890ff;
        &.valid { color: #52c41a; }
      }
    }
    .btn-row {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  }
</style>
