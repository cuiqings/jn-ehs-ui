<template>
  <div class="composite-index-setting">
    <a-tabs v-model:activeKey="activeKey">
      <template #rightExtra>
        <a-button type="primary" :loading="refreshLoading" @click="handleRefreshCache">刷新缓存</a-button>
      </template>
      <a-tab-pane key="1" tab="模块权重">
        <ModuleWeight />
      </a-tab-pane>
      <a-tab-pane key="2" tab="等级与目标">
        <GradeTarget />
      </a-tab-pane>
      <a-tab-pane key="3" tab="扣分规则">
        <DeductionRule />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts" setup>
  import { ref, provide, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import ModuleWeight from './ModuleWeight.vue';
  import GradeTarget from './GradeTarget.vue';
  import DeductionRule from './DeductionRule.vue';
  import { getConfigList, refreshCache } from './api';

  const activeKey = ref('1');
  const configData = ref<Record<string, string>>({});
  const refreshLoading = ref(false);

  provide('configData', configData);

  onMounted(async () => {
    const res = await getConfigList();
    configData.value = res || {};
  });

  const handleRefreshCache = async () => {
    refreshLoading.value = true;
    try {
      await refreshCache();
      message.success('缓存刷新成功');
    } catch (e) {
      message.error('缓存刷新失败');
    } finally {
      refreshLoading.value = false;
    }
  };
</script>
<style lang="less" scoped>
  .composite-index-setting {
    width: 100%;
    height: 100%;
    padding: 16px;
    background-color: #ffffff;
  }
</style>
