<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%">
    <a-tabs v-model:activeKey="activeKey" style="height: 100%; width: 100%">
      <a-tab-pane key="1" tab="待处理" forceRender>
        <Job-pending ref="jobPending" :show="false" />
      </a-tab-pane>
      <!-- <a-tab-pane key="2" tab="已处理" force-render>
        <Job-pending ref="jobPending" :show="true" />
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>
<script setup name="HazardousOperation-JobApproval" lang="ts">
  import JobPending from './JobPending.vue';
  import { provide, ref, watch } from 'vue';
  const activeKey = ref('1');
  const jobPending = ref();
  watch(activeKey, (newVal) => {
    jobPending.value.getList({ state: newVal });
  });
  provide('state', activeKey);
</script>

<style lang="scss" scoped></style>
