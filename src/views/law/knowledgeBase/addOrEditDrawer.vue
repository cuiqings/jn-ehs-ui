<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="900"
    @ok="handleSubmit"
    :show-footer="showFooter"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="law-addOrEdit-drawer" setup>
  import { useAddOrEditDrawer } from './hooks/useAddOrEditDrawer';
  const emit = defineEmits(['success']);
  const { BasicDrawer, registerDrawer, handleSubmit, BasicForm, registerForm, title, showFooter } = useAddOrEditDrawer(emit);
</script>
<style lang="less" scoped>
  :deep(.ant-select-selection-placeholder) {
    color: #bfbfbf !important;
  }
</style>
