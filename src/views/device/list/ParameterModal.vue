<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="title" @ok="onSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
  
<script lang="ts" setup>
import { ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate } from './list.api';
const emit = defineEmits(['select', 'register']);
const isUpdate = ref<Boolean>(true);
const showFooter = ref<Boolean>(true);
const title = ref('');
const currentIndex = ref(0);
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  currentIndex.value = data?.currentIndex;
  isUpdate.value = data?.isUpdate;
  title.value = data?.title;
  // 下次点击弹窗的时候清空表单
  await resetFields();
  if (data?.isUpdate) {
    await setFieldsValue(data.record);
  }
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter, title: data.title });
  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
// 注册表单
const [registerForm, { validate, getFieldsValue, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
  schemas: [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '参数名称',
      field: 'paramName',
      component: 'Input',
      required: true,
      componentProps: {
        maxLength: 30,
      },
    },
    {
      label: '参数值',
      field: 'value',
      component: 'Input',
      required: true,
      componentProps: {
        maxLength: 30,
      },
    },
    {
      label: '参数类型',
      field: 'type',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'point_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '参数单位',
      field: 'unit',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'point_unit',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
  ],
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
async function onSubmit() {
  const values = await validate();
  console.log('validate value', values);
  if(!isUpdate.value) {
    delete values.id;
  }
  emit('select', values);
  closeModal();
}
</script>
<style scoped lang="less">
</style>