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
    <BasicForm @register="registerForm">
      <template #userIdSlot="{ model, field }">
        <JUserModal v-model:value="model[field]" type="checkbox" :disabled="type === 'view'" />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts" name="riskPointManagement-drawer" setup>
  const emit = defineEmits(['success']);
  import { useDrawer } from './hooks/useDrawer';
  import { JUserModal } from '/@/components/Form';
  const { BasicDrawer, registerDrawer, BasicForm, registerForm, handleSubmit, title, showFooter, showOkBtn, type } = useDrawer(emit);
</script>
<style lang="less" scoped></style>
