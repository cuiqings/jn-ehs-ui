<template>
  <div class="item">
    <div class="head">
      <div class="left">
        <span class="head1">{{ props.itemName }}</span> <span class="head2">（应得分：100分）</span></div
      >
      <div class="right">
        <div v-if="!editable"><a-button type="primary" @click="editItem()">编辑</a-button></div>
        <div v-else>
          <a-button style="margin-right: 20px" @click="resetItem()">取消</a-button>
          <a-button type="primary" @click="saveItem()">保存</a-button></div
        >
      </div>
    </div>
    <a-table size="small" bordered :data-source="dataSource" :columns="itemColumns" :pagination="false">
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'weight'"> 指标项权重 <span style="color: #999">（值为0-100的整数）</span> </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'weight'">
          <template v-if="editable">
            <a-input-number
              :min="0"
              :max="100"
              placeholder="请输入"
              :precision="0"
              v-model:value="record.weight"
              @change="handleItemWeightChange(record)"
            />
          </template>
          <div v-else style="height: 32px; line-height: 32px">{{ text }}</div>
        </template>
        <template v-if="column.dataIndex === 'evaluateMethod'">
          <template v-if="editable">
            <a-select :disabled="record.changeFlag == '2'" placeholder="请选择" v-model:value="record.evaluateMethod" style="width: 120px">
              <a-select-option value="1">系统</a-select-option>
              <a-select-option value="2">自评</a-select-option>
            </a-select>
          </template>
          <div v-else style="height: 32px; line-height: 32px">
            <span v-if="record.evaluateMethod == '1'">系统</span>
            <span v-if="record.evaluateMethod == '2'">自评</span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { cloneDeep } from 'lodash-es';
  import { ref, onMounted } from 'vue';
  import { saveItemConfig } from '../api';
  const dataSource = ref([]);
  const editable = ref(false);
  const originData = ref([]);
  const itemColumns = ref([
    {
      title: '指标项',
      dataIndex: 'item',
      width: '25%',
      align: 'center',
    },
    {
      title: '权重占比',
      dataIndex: 'weightProportion',
      width: '25%',
      align: 'center',
      customRender: ({ text }) => {
        return (Number(text) * 100).toFixed(2) + '%';
      },
    },
    {
      title: '指标项权重',
      dataIndex: 'weight',
      width: '25%',
      align: 'center',
    },
    {
      title: '评估方式',
      dataIndex: 'evaluateMethod',
      width: '25%',
      align: 'center',
    },
  ]);
  // 接收父组件的参数
  const props = defineProps({
    itemName: {
      type: String,
      default: '人员因素',
    },
    itemDataSource: {
      type: Array,
      default: () => [],
    },
  });
  onMounted(() => {
    console.log('onMounted', props.itemDataSource);
    originData.value = JSON.parse(JSON.stringify(props.itemDataSource));
    console.log('originData', originData.value);
    dataSource.value = cloneDeep(props.itemDataSource);
  });
  const editItem = () => {
    editable.value = true;
  };
  const resetItem = () => {
    editable.value = false;
    console.log('重置指标项', originData.value);

    dataSource.value = JSON.parse(JSON.stringify(originData.value));
  };
  const saveItem = () => {
    console.log('保存指标项', props.itemDataSource, dataSource.value);
    editable.value = false;
    saveItemConfig(dataSource.value).then(() => {
      originData.value = JSON.parse(JSON.stringify(dataSource.value));
    });
  };
  const handleItemWeightChange = (record) => {
    // 计算总权重
    const total = dataSource.value.reduce((prev, cur) => prev + cur.weight, 0);
    dataSource.value.forEach((item) => {
      item.weightProportion = (item.weight / total).toFixed(4);
    });
    console.log('props.itemDataSource', props.itemDataSource, dataSource.value);
  };
</script>

<style lang="less" scoped>
  .item {
    margin-bottom: 30px;
    .head {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f1f1f1;
    }
  }
  .head1 {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
  }
  .head2 {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
  }
</style>
