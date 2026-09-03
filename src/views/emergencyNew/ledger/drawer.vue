<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" width="1300px">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer" @submit="closeDrawer"></plan-form>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import planForm from './components/planForm.vue';
  import { ref } from 'vue';
  const title = ref('新增');
  const activeKey = ref('1');
  const disabled = ref(false);
  const detail = ref({});
  const [register, { closeDrawer }] = useDrawerInner((data) => {
    title.value = data.title;
  });
      
</script>
