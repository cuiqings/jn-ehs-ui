<template>
  <div class="grade-target">
    <div class="section-header">
      <span class="section-num">2</span>
      <span class="section-title">等级与目标</span>
    </div>

    <div class="target-row">
      <div class="target-item">
        <div class="label">目标分</div>
        <div class="input-group">
          <a-input-number v-model:value="targetScore" :min="0.1" :max="100" :step="0.1" :formatter="numFormatter" :parser="numParser" size="small" />
          <span class="suffix">分</span>
          <span class="desc">≥ 此值视为达标</span>
        </div>
        <div class="sub-desc">显示在仪表盘右侧（默认 ≥ 90）</div>
      </div>
      <div class="target-item">
        <div class="label">达标提示语</div>
        <div class="input-group">
          <a-input v-model:value="targetMessage" placeholder="请输入达标提示语" style="width: 280px" />
        </div>
        <div class="sub-desc">综合得分 ≥ 目标分时显示</div>
      </div>
    </div>

    <div class="threshold-section">
      <div class="threshold-title">等级阈值</div>
      <a-table
        size="small"
        :columns="columns"
        :data-source="gradeData"
        :pagination="false"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <a-input v-model:value="record.name" size="small" style="width: 80px" />
          </template>
          <template v-if="column.dataIndex === 'operator'">
            <a-select v-model:value="record.operator" size="small" style="width: 70px">
              <a-select-option value=">=">≥</a-select-option>
              <a-select-option value="<">&lt;</a-select-option>
            </a-select>
          </template>
          <template v-if="column.dataIndex === 'threshold'">
            <a-input-number v-model:value="record.threshold" :min="0.1" :max="100" :step="0.1" :formatter="numFormatter" :parser="numParser" size="small" />
          </template>
          <template v-if="column.dataIndex === 'color'">
            <div class="color-cell">
              <a-input type="color" v-model:value="record.color" class="color-picker" />
              <span :style="{ color: record.color }">■ {{ record.label }}</span>
            </div>
          </template>
        </template>
      </a-table>
      <div class="threshold-tip">阈值之间不能交叉；保存时按上下限校验。</div>
    </div>

    <div class="btn-row">
      <a-button @click="resetDefault">恢复默认等级</a-button>
      <a-button type="primary" @click="save">保存等级与目标</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, inject, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { batchSave } from './api';

  const configData = inject<any>('configData');

  const numFormatter = (value) => {
    if (value === '' || value === undefined || value === null) return '';
    const num = Number(value);
    if (Number.isInteger(num)) return String(num);
    return String(Math.round(num * 10) / 10);
  };
  const numParser = (value) => value;

  const targetScore = ref(90);
  const targetMessage = ref('优·已达成今日安全目标');

  const columns = [
    { title: '等级名称', dataIndex: 'name', width: 120 },
    { title: '比较符', dataIndex: 'operator', width: 100, align: 'center' },
    { title: '阈值', dataIndex: 'threshold', width: 120, align: 'center' },
    { title: '仪表盘色带颜色', dataIndex: 'color', width: 200 },
  ];

  const defaultGradeData = [
    { key: '1', name: '优', operator: '>=', threshold: 90, color: '#52c41a', label: '优示例' },
    { key: '2', name: '良', operator: '>=', threshold: 80, color: '#1890ff', label: '良示例' },
    { key: '3', name: '中', operator: '>=', threshold: 70, color: '#faad14', label: '中示例' },
    { key: '4', name: '差', operator: '<', threshold: 70, color: '#ff4d4f', label: '差示例' },
  ];

  const gradeData = ref(JSON.parse(JSON.stringify(defaultGradeData)));

  const initFromConfig = (data) => {
    if (data.target_score !== undefined) targetScore.value = Number(data.target_score);
    if (data.reach_tip !== undefined) targetMessage.value = data.reach_tip;
    for (let i = 0; i < 4; i++) {
      const idx = i + 1;
      if (data[`name${idx}`] !== undefined) gradeData.value[i].name = data[`name${idx}`];
      if (data[`symbol${idx}`] !== undefined) gradeData.value[i].operator = data[`symbol${idx}`];
      if (data[`threshold${idx}`] !== undefined) gradeData.value[i].threshold = Number(data[`threshold${idx}`]);
      if (data[`color${idx}`] !== undefined) gradeData.value[i].color = data[`color${idx}`];
    }
  };

  if (configData?.value) {
    initFromConfig(configData.value);
  }

  watch(configData, (val) => {
    if (val && Object.keys(val).length > 0) {
      initFromConfig(val);
    }
  });

  const resetDefault = () => {
    targetScore.value = 90;
    targetMessage.value = '优·已达成今日安全目标';
    gradeData.value = JSON.parse(JSON.stringify(defaultGradeData));
  };

  const save = () => {
    const params: Record<string, string> = {
      target_score: String(targetScore.value),
      reach_tip: targetMessage.value,
    };
    gradeData.value.forEach((item, i) => {
      const idx = i + 1;
      params[`name${idx}`] = item.name;
      params[`symbol${idx}`] = item.operator;
      params[`threshold${idx}`] = String(item.threshold);
      params[`color${idx}`] = item.color;
    });
    batchSave(params).then(() => {
      message.success('保存成功');
    });
  };

  defineExpose({ initFromConfig });
</script>
<style lang="less" scoped>
  .grade-target {
    padding: 0 400px;
    .section-header {
      margin-bottom: 12px;
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
    .target-row {
      display: flex;
      gap: 80px;
      margin-bottom: 24px;
      .target-item {
        .label { font-weight: 500; margin-bottom: 8px; }
        .input-group {
          display: flex;
          align-items: center;
          gap: 8px;
          .suffix { color: #666; }
          .desc { color: #999; font-size: 12px; }
        }
        .sub-desc { color: #999; font-size: 12px; margin-top: 4px; }
      }
    }
    .threshold-section {
      .threshold-title { font-weight: 500; margin-bottom: 8px; }
      .threshold-tip { color: #1890ff; font-size: 12px; margin-top: 8px; }
    }
    .color-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      .color-picker {
        width: 32px;
        height: 24px;
        padding: 0;
        border: 1px solid #d9d9d9;
        cursor: pointer;
      }
    }
    .btn-row {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  }
</style>
