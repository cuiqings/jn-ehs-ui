<template>
  <a-card style="width: 90%; margin: 20px auto">
    <!-- 指标权重 -->
    <div class="index-weight">
      <div class="title">指标权重</div>
      <a-table size="small" bordered :data-source="dataSource" :columns="columns" :pagination="false">
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'weight'"> 权重 <span style="color: #999">（值为0-100的整数）</span> </template>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'weight'">
            <template v-if="weightEditable">
              <a-input-number :min="0" :max="100" :precision="0" v-model:value="record.weight" @change="handleWeightChange(record)" />
            </template>
            <div v-else style="height: 32px; line-height: 32px">{{ text }}</div>
          </template>
        </template>
      </a-table>
      <div class="btn">
        <div v-if="!weightEditable"><a-button type="primary" @click="editWeight">编辑</a-button></div>
        <div v-else>
          <a-button style="margin-right: 20px" @click="resetWeight">取消</a-button> <a-button type="primary" @click="saveWeight">保存</a-button></div
        >
      </div>
    </div>
    <!-- 指标项配置 -->
    <div class="item-config">
      <div class="title">指标项配置</div>
      <div v-for="item in itemsData" :key="item.name">
        <ConfigItem :itemName="item.name" :itemDataSource="item.data" />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { getList, saveConfig, getItemList } from '../api';
  import ConfigItem from './ConfigItem.vue';
  interface ItemData {
    name: string;
    data: Array<any>;
  }
  const itemsData = ref<ItemData[]>([]);
  const weightEditable = ref(false);
  const columns = [
    {
      title: '指标',
      dataIndex: 'indx',
      width: '33%',
      align: 'center',
    },
    {
      title: '权重占比',
      dataIndex: 'weightProportion',
      width: '33%',
      align: 'center',
      customRender: ({ text }) => {
        return (Number(text) * 100).toFixed(2) + '%';
      },
    },
    {
      title: '权重',
      dataIndex: 'weight',
      width: '33%',
      align: 'center',
    },
  ];
  const dataSource = ref([]);
  const originData = ref([]);
  getConfigList();
  // 获取配置列表数据
  function getConfigList() {
    getList().then((res) => {
      console.log('getConfigList', res);
      originData.value = JSON.parse(JSON.stringify(res));
      dataSource.value = res;
    });
  }
  getItemListData('');
  function getItemListData(indx) {
    console.log('getItemList');
    let params = {
      indx,
    };
    getItemList(params).then((res) => {
      console.log('getItemList', res);
      itemsData.value = [];
      // 遍历object对象
      for (let key in res) {
        if (res.hasOwnProperty(key)) {
          // 确保属性是对象自身的而不是从原型链继承的
          itemsData.value.push({
            name: key,
            data: res[key],
          });
        }
      }
      console.log('itemsData', itemsData.value);
    });
  }
  const handleWeightChange = (record) => {
    console.log('handleWeightChange', record);
    // 计算总权重
    const total = dataSource.value.reduce((prev, cur) => prev + cur.weight, 0);
    console.log('total', total);
    dataSource.value.forEach((item) => {
      item.weightProportion = parseFloat((item.weight / total).toFixed(4));
    });
    console.log('dataSource.value', dataSource.value);
  };
  const editWeight = () => {
    weightEditable.value = true;
  };
  const resetWeight = () => {
    dataSource.value = JSON.parse(JSON.stringify(originData.value));
    weightEditable.value = false;
  };
  const saveWeight = () => {
    console.log('保存权重', dataSource.value);
    weightEditable.value = false;
    saveConfig(dataSource.value).then(() => {
      originData.value = JSON.parse(JSON.stringify(dataSource.value));
    });
  };
</script>

<style lang="less" scoped>
  .editable-cell {
    position: relative;
    .editable-cell-input-wrapper,
    .editable-cell-text-wrapper {
      padding-right: 24px;
    }

    .editable-cell-text-wrapper {
      padding: 5px 24px 5px 5px;
    }

    .editable-cell-icon,
    .editable-cell-icon-check {
      position: absolute;
      right: 0;
      width: 20px;
      cursor: pointer;
    }

    .editable-cell-icon {
      margin-top: 4px;
      display: none;
    }

    .editable-cell-icon-check {
      line-height: 28px;
    }

    .editable-cell-icon:hover,
    .editable-cell-icon-check:hover {
      color: #108ee9;
    }

    .editable-add-btn {
      margin-bottom: 8px;
    }
  }
  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }
  .index-weight {
    .title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .btn {
      margin-top: 16px;
      text-align: right;
    }
  }
  .item-config {
    margin-top: 20px;
    .title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .item {
      .head {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f1f1f1;
      }
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
