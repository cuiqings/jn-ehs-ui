<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="500px" destroyOnClose>
    <BasicForm @register="registerForm" />
    <RandomDrawer @register="registerRandomDrawer" @success="handleRandomSuccess" />
    <FixedDrawer @register="registerFixedDrawer" @success="handleFixedSuccess" />
  </BasicModal>
</template>
  <script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useDrawer } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema } from './paper.data';
import { saveOrUpdateBank } from './paper.api';
import RandomDrawer from './RandomDrawer.vue';
import FixedDrawer from './FixedDrawer.vue';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const [registerRandomDrawer, { openDrawer: openRandomDrawer }] = useDrawer();
const [registerFixedDrawer, { openDrawer: openFixedDrawer }] = useDrawer();
//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({ confirmLoading: true });
    if (isUpdate.value) {
      await saveOrUpdateBank(values, isUpdate.value);
      closeModal();
      //刷新列表
      emit('success');
    } else {
      if (values.paperType == '2') {
        openRandomDrawer(true, values);
      } else {
        openFixedDrawer(true, values);
      }
    }
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
//随机组卷成功
async function handleRandomSuccess(values) {
  console.log('handleRandomSuccess', values);
  await saveOrUpdateBank(values, isUpdate.value);
  closeModal();
  //刷新列表
  emit('success');
}
//固定组卷成功
async function handleFixedSuccess(values) {
  console.log('handleFixedSuccess', values);
  await saveOrUpdateBank(values, isUpdate.value);
  closeModal();
  //刷新列表
  emit('success');
}
</script>
  