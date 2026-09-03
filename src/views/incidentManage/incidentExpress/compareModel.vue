<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="900" :bodyStyle="{ padding: '0 20px 20px 20px' }" title="重复上报">
      <div class="pane">
        <div>
          <h3>当前上报</h3>
          <div class="pane-container" ref="currentReportingRef"> </div>
        </div>
        <div>vs</div>
        <div>
          <h3>与此重复</h3>
          <div class="pane-container" ref="repeatWithThisRef"> </div> </div
      ></div>
      <template #footer>
        <div class="compareModel-footer">
          <a-button type="primary" :loading="confirmDuplicateLoading" @click="confirmDuplicate">确认重复</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="compare-model" setup>
  import { useCompareModal } from './hooks/useCompareModal';
  import { ref } from 'vue';
  const currentReportingRef = ref(null);
  const repeatWithThisRef = ref(null);
  const emit = defineEmits(['success']);
  const { registerModal, BasicModal, confirmDuplicate, confirmDuplicateLoading } = useCompareModal(emit, currentReportingRef, repeatWithThisRef);
</script>
<style lang="less" scoped>
  .compareModel-footer {
    text-align: center;
  }
  .pane {
    display: flex;
    justify-content: space-evenly;
    & > div {
      width: calc(100% / 3);
      h3 {
        font-weight: bold;
      }
    }
    & > div:nth-child(2) {
      font-size: 30px;
      font-weight: bold;
      margin-top: 150px;
      width: 60px;
      text-align: center;
    }
    .pane-container {
      border-radius: 5px;
      border: 1px solid #666666;
      & > div {
        padding: 10px 10px 0 10px;
      }
    }
  }
</style>
