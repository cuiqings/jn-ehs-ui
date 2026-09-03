<template>
  <a-card :bordered="false" style="height: 100%">
    <a-tabs v-model:activeKey="activeKey" type="card" size="large">
      <a-tab-pane tab="我的证书" key="1">
        <MyCertificateInfoTab :currentKey="activeKey" />
      </a-tab-pane>
      <a-tab-pane tab="最近学习" key="2">
        <RecentStudyInfoTab :currentKey="activeKey" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import MyCertificateInfoTab from './components/MyCertificateInfoTab.vue';
import RecentStudyInfoTab from './components/RecentStudyInfoTab.vue';
const activeKey = ref('1');
</script>
<style lang="less" scoped>
</style>
