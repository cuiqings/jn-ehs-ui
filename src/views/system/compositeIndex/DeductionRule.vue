<template>
  <div class="deduction-rule">
    <div class="section-header">
      <span class="section-num">3</span>
      <span class="section-title">各模块扣分幅度</span>
    </div>
    <div class="tip">下列扣分项均可后台调整，禁止硬编码。调整后自当日起重算得分。</div>

    <div class="rule-list">
      <div v-for="(item, index) in ruleData" :key="index" class="rule-item">
        <div class="rule-left">
          <div class="rule-name">{{ item.name }}</div>
          <div v-if="item.subTip" class="rule-sub-tip">{{ item.subTip }}</div>
        </div>
        <div class="rule-right">
          <a-input-number v-model:value="item.value" :min="0" :step="0.0001" :formatter="numFormatter" :parser="numParser" size="small" />
          <span class="unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>

    <div class="btn-row">
      <a-button @click="resetDefault">恢复默认扣分</a-button>
      <a-button type="primary" @click="save">保存扣分规则</a-button>
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
    // 最多保留4位小数，去除末尾多余的0
    return String(Math.round(num * 10000) / 10000);
  };
  const numParser = (value) => value;

  const ruleKeys = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'];

  const defaultRuleData = [
    { key: 'r1', name: '三项岗位人员·每名逾期人员扣分', value: 5, unit: '分 / 人', subTip: '' },
    { key: 'r2', name: '教育培训·每项超期完成扣分', value: 2, unit: '分 / 1%', subTip: '' },
    { key: 'r3', name: '应急管理·超期未演练（扣分 A）', value: 5, unit: '分 / 项', subTip: '' },
    { key: 'r4', name: '应急管理·超期演练（扣分 B）', value: 2, unit: '分 / 项', subTip: '' },
    { key: 'r5', name: '相关方·到期人数（每人扣分）', value: 1, unit: '分 / 人', subTip: '' },
    { key: 'r6', name: '相关方·违章次数（每次扣分）', value: 1, unit: '分 / 次', subTip: '' },
    { key: 'r7', name: '相关方·未及时进场（每人扣分）', value: 1, unit: '分 / 人', subTip: '' },
    { key: 'r8', name: '危险作业·安全部超均扣分系数', value: 5, unit: '分 / 1%', subTip: '超出平均比例每 1% 扣 N 分' },
    { key: 'r9', name: '职业健康·检测录入完成率', value: 0.3, unit: '分 / 1%', subTip: '' },
    { key: 'r10', name: '职业健康·体检完成率', value: 0.7, unit: '分 / 1%', subTip: '' },
  ];

  const ruleData = ref(JSON.parse(JSON.stringify(defaultRuleData)));

  const initFromConfig = (data) => {
    ruleData.value.forEach((item) => {
      if (data[item.key] !== undefined) {
        item.value = Number(data[item.key]);
      }
    });
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
    ruleData.value = JSON.parse(JSON.stringify(defaultRuleData));
  };

  const save = () => {
    const r9Val = ruleData.value.find((item) => item.key === 'r9')?.value || 0;
    const r10Val = ruleData.value.find((item) => item.key === 'r10')?.value || 0;
    if (Math.abs(r9Val + r10Val - 1) > 0.00005) {
      message.error('职业健康·检测录入完成率与体检完成率之和必须等于1');
      return;
    }
    const params: Record<string, string> = {};
    ruleData.value.forEach((item) => {
      params[item.key] = String(item.value);
    });
    batchSave(params).then(() => {
      message.success('保存成功');
    });
  };

  defineExpose({ initFromConfig });
</script>
<style lang="less" scoped>
  .deduction-rule {
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
    .tip {
      color: #1890ff;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .rule-list {
      .rule-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid #f0f0f0;
        .rule-left {
          .rule-name {
            font-size: 14px;
            color: #1890ff;
          }
          .rule-sub-tip {
            color: #999;
            font-size: 12px;
            margin-top: 2px;
          }
        }
        .rule-right {
          display: flex;
          align-items: center;
          gap: 8px;
          .unit { color: #666; font-size: 13px; }
        }
      }
    }
    .btn-row {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }
  }
</style>
