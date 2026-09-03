<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="900"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="limitSpaceCard-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  const emit = defineEmits(['success']);
  const { BasicDrawer, registerDrawer, BasicForm, registerForm, handleSubmit, title, showFooter, showOkBtn } = useDrawer(emit);
</script>
<style lang="less" scoped>
  /deep/ .ant-input-affix-wrapper {
    textarea {
      padding: 4px 11px;
    }
  }
  /deep/.ant-input-group-compact:last-child {
    margin-bottom: 0 !important;
  }
</style>
