<template>
  <div class="appCheckPlan">
    <div class="list">
      <div class="list_label">计划名称：</div>
      <div class="list_value">{{ info.checkPlanName }}</div>
    </div>
    <div class="list">
      <div class="list_label">检查频率：</div>
      <div class="list_value">{{ renderDict(info.checkFrequency, 'check_frequency') }}</div>
    </div>
    <div class="list" style="margin-bottom: 10px">
      <div class="list_label">检查单位：</div>
      <div class="list_value">{{ info.organizationName }}</div>
    </div>
    <a-table :columns="columns" :data-source="info.jnEnvironmentalCheckPlanSubList" bordered :pagination="false" :scroll="{ x: 600 }" />
    <div class="btn">
      <a-button type="primary" @click="onExamine"> 开始检查 </a-button>
    </div>
  </div>
</template>
<script lang="ts" name="app-checkPlan-task" setup>
  import { ref, onMounted } from 'vue';
  import { appQueryById } from '../url/index';
  import { useRoute, useRouter } from 'vue-router';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  const route = useRoute();
  const router = useRouter();
  const columns = [
    { title: '工序', dataIndex: 'processes', align: 'center' },
    { title: '检查项目', dataIndex: 'checkEntry', align: 'center' },
    { title: '检查要求', dataIndex: 'checkRecord', align: 'center' },
  ];
  const info = ref<any>({});
  onMounted(() => {
    if (route.query.recordId) {
      appQueryById({ recordId: route.query.recordId }).then((res) => {
        info.value = res;
      });
    }
  });
  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  const onExamine = () => {
    router.push({
      path: '/app/checkPlan/examine',
      query: {
        recordId: info.value.recordId,
        planId: info.value.id,
        subTaskCode: route.query.subTaskCode,
      },
    });
  };
</script>
<style lang="less" scoped>
  .appCheckPlan {
    padding: 20px 15px 0 15px;
    height: calc(100% - 60px);
    overflow-y: auto;
    .list {
      display: flex;
      line-height: 30px;
      .list_label {
        width: 100px;
        text-align: left;
        color: rgb(127, 127, 127);
      }
    }
    .btn {
      position: fixed;
      width: 100%;
      bottom: 0;
      left: 0;
      height: 60px;
      text-align: center;
      line-height: 60px;
      button {
        height: 40px;
        width: 150px;
      }
    }
  }
</style>
