<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%">
    <a-tabs v-model:activeKey="activeKey" style="height: 100%; width: 100%" @change="tabChange">
      <a-tab-pane key="0" tab="审批中" forceRender>
        <PanelView ref="panelviewRef1" status="0" />
      </a-tab-pane>
      <a-tab-pane key="1" tab="审批通过" force-render>
        <PanelView ref="panelviewRef2" status="1" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup name="emergency-taskApproval" lang="ts">
  import { ref } from 'vue';
  import PanelView from './panel.vue';
  const activeKey = ref('0');
  const panelviewRef1 = ref();
  const panelviewRef2 = ref();
  const tabChange = () => {
    console.log(activeKey.value)
    if (activeKey.value == '0') {
      panelviewRef1.value.resetForm();
    } else {
      panelviewRef2.value.resetForm();
    }
  }
</script>

<style lang="scss" scoped></style>
