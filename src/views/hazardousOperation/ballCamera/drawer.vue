<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="600"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  const emit = defineEmits(['success']);
  const { BasicDrawer, registerDrawer, title, showFooter, showOkBtn, handleSubmit, registerForm, BasicForm } = useDrawer(emit);
</script>
<style lang="less" scoped></style>
