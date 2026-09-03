<template>
  <div class="statistics" v-loading="loading">
    <div class="hd">
      <span>各单位高危人员统计表</span>
      
      <div class="hd-right">
        <a-select
          v-model:value="selectedUnit"
          placeholder="请选择单位"
          style="width: 200px; margin-right: 12px;"
          allow-clear
          @change="onUnitChange"
        >
          <a-select-option v-for="item in unitList" :key="item.value" :value="item.value">
            {{ item.text }}
          </a-select-option>
        </a-select>
        <a-button type="primary" v-auth="'highRiskLedger:statistics:import'" preIcon="ant-design:download-outlined" @click="download"
          >导出统计</a-button
        >
      </div>
    </div>
    <a-table bordered size="small" :pagination="false" :dataSource="dataSource" :columns="columns" />
  </div>
</template>
<script name="highRisk-statistics" setup>
  import { ref, onMounted } from 'vue';
  import { downloadFileAll, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { statistics } from '../api';
  import dayjs from 'dayjs';

  const dataSource = ref([]);
  const selectedUnit = ref(undefined);
  const unitList = ref([]);
  const columns = [
    {
      title: '单位',
      dataIndex: 'departName',
      align: 'center',
      key: 'departName',
      width: 180,
    },
    {
      title: '疾病及指标超标情况',
      dataIndex: 'age',
      key: 'age',
      children: [
        {
          title: '癫痫',
          dataIndex: 'diarrhoea',
          width: 80,
          key: 'diarrhoea',
        },
        {
          title: '心脏疾病(冠心病、心绞痛、心脏支架、心脏搭桥等)',
          dataIndex: 'heartDisease',
          width: 200,
          key: 'heartDisease',
        },
        {
          title: '同型半胱氨酸≥40um ol/L',
          dataIndex: 'hematuria',
          key: 'hematuria',
          width: 100,
        },
        {
          title: '血压异常(1、2、3级高血压)',
          dataIndex: 'hypertension',
          key: 'hypertension',
          width: 100,
        },
        {
          title: '血糖异常(餐前、后均低于3.9毫摩尔/升)',
          dataIndex: 'hypoglycemia',
          key: 'hypoglycemia',
          width: 100,
        },
        {
          title: '重度贫血(血红蛋白测定值30-50g/L)、极重度贫血(血红蛋白测定值小于30g/L)',
          width: 200,
          dataIndex: 'anemia',
          key: 'anemia',
        },
        {
          title: '脑部疾病(脑梗、脑出血等)',
          dataIndex: 'brainDisease',
          key: 'brainDisease',
          width: 100,
        },
        {
          title: '尿毒症等肾病',
          dataIndex: 'kidneyDisease',
          key: 'kidneyDisease',
          width: 100,
        },
        {
          title: '肝硬化',
          dataIndex: 'leukemia',
          key: 'leukemia',
          width: 100,
        },
        {
          title: '先天性脊柱侧弯',
          dataIndex: 'lumbarSpine',
          key: 'lumbarSpine',
          width: 100,
        },
        {
          title: '耳聋',
          dataIndex: 'meningitis',
          key: 'meningitis',
          width: 100,
        },
        {
          title: '股骨头坏死',
          dataIndex: 'meniscusTear',
          key: 'meniscusTear',
          width: 100,
        },
        {
          title: '其他',
          dataIndex: 'other',
          key: 'other',
          width: 100,
        },
      ],
    },
    {
      title: '疾病合计',
      dataIndex: 'total',
      key: 'total',
      width: 100,
    },
    {
      title: '患病人数合计',
      dataIndex: 'totalCount',
      key: 'totalCount',
      width: 100,
    },
  ];
  const loading = ref(false);
  onMounted(() => {
    getStatistics();
    loadUnits();
  });
  function loadUnits() {
    getDepart3ListWithSecurity().then((res) => {
      unitList.value = res.map((item) => ({
        text: item.departName,
        value: item.orgCode,
      }));
    });
  }
  function onUnitChange(value) {
    selectedUnit.value = value;
    getStatistics();
  }
  function getStatistics() {
    loading.value = true;
    const params = {};
    if (selectedUnit.value) {
      params.parentOrgCode = selectedUnit.value;
    }
    statistics(params)
      .then((res) => {
        dataSource.value = res;
      })
      .finally(() => {
        loading.value = false;
      });
  }
  function download() {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
    }, 2000);
    const params = {};
    if (selectedUnit.value) {
      params.parentOrgCode = selectedUnit.value;
    }
    downloadFileAll(`/riskPersonTent/statistics/download`, dayjs(new Date()).format('YYYYMMDD') + '各单位高危人员统计表.xlsx', params);
  }
</script>
<style lang="less" scoped>
  .statistics {
    width: 100%;
    height: 100%;
    padding: 10px;
  }
  .hd {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    padding: 0 10px;
    span {
      font-size: 16px;
      font-weight: 600;
    }
    .hd-right {
      display: flex;
      align-items: center;
    }
  }
</style>
