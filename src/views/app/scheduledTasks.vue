<template>
  <div style="padding: 20px 10px; text-align: center">
    <div>
      <a-select ref="select" v-model:value="queryParams.type" placeholder="请选择" style="width: 100%; line-height: 40px" :options="orgOptions" />
    </div>
    <div style="margin-top: 20px">
      <a-input v-model:value="queryParams.date" placeholder="请输入" style="width: 100%; height: 40px" />
    </div>
    <a-button style="width: 90%; margin-top: 40px; border-radius: 8px" :loading="loading" size="large" @click="handleSubmit" type="primary"
      >提交</a-button
    >
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const task = (data) => {
    return defHttp.post({ url: `/hiddenDangerChecks/jnYhPlan/generateTask?type=${data.type}&date=${data.date}` });
  };
  const orgOptions = ref([
    {
      label: '每班任务白班',
      value: '1',
    },
    {
      label: '每班任务夜班',
      value: '2',
    },
    {
      label: '每日、每周、每月、临时任务',
      value: '3',
    },
  ]);
  const loading = ref(false);
  const queryParams = ref({
    type: undefined,
    date: '',
  });
  const handleSubmit = () => {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
    }, 1 * 60 * 1000);
    task({ ...queryParams.value }).then((res) => {
      if (res) {
        createMessage.success('提交成功！');
      }
    });
  };
</script>
<style lang="less" scoped>
  /deep/.ant-select-selector {
    height: 40px !important;
    text-align: left !important;
    line-height: 38px !important;
  }
  /deep/.ant-select-selection-search-input {
    height: 38px !important;
    text-align: left !important;
  }
  /deep/.ant-select-selection-placeholder,
  /deep/.ant-select-selection-item {
    line-height: 38px !important;
    text-align: left !important;
  }
</style>
