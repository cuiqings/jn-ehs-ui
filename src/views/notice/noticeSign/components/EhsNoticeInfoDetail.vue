<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <BasicForm @register="registerForm"/>
  </BasicDrawer>
</template>

<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicForm, useForm} from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
import {formSchema} from '../EhsNoticeInfo.data';
import {saveOrUpdate} from '../EhsNoticeInfo.api';
// Emits声明
const emit = defineEmits(['register','success']);
const isUpdate = ref(true);
//表单配置
const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 24}
});
//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
  //重置表单
  await resetFields();
  setDrawerProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
  //表单赋值
  await setFieldsValue({
    ...data.record,
  });
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter })
});
//设置标题
const title = computed(() => ('详情'));
//表单提交事件
async function handleSubmit(v) {
  try {
    let values = await validate();
    setDrawerProps({confirmLoading: true});
    //提交表单
    await saveOrUpdate(values, isUpdate.value);
    //关闭弹窗
    closeDrawer();
    //刷新列表
    emit('success');
  } finally {
    setDrawerProps({confirmLoading: false});
  }
}
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number){
  width: 100%
}

:deep(.ant-calendar-picker){
  width: 100%
}
</style>
