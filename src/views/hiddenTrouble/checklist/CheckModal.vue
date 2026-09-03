<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" @ok="onSubmit" width="600px">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { saveOrUpdate } from './check.api';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref<Boolean>(true);
const showFooter = ref<Boolean>(true);
// 注册表单
const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema }] = useForm({
  schemas: [
  {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '风险ID',
      field: 'riskId',
      component: 'Input',
     dynamicDisabled: true,
    },
    {
      field: 'checkContent',
      label: '排查内容',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        showCount: true,
        maxlength: 100,
        rows: 3,
        suffix: '/100',
      },
    },
    {
      label: '排查方法',
      field: 'checkMethod',
      required: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'ht_check_type',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      componentProps: {
        showCount: true,
        maxlength: 100,
        rows: 3,
        suffix: '/100',
      },
    },
  ],
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
async function onSubmit() {
  const values = await validate();
  const obj = JSON.parse(JSON.stringify(values));
  if (unref(isUpdate)) {
    await saveOrUpdate(obj, isUpdate.value);
    closeModal();
    emit('success');
  }
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  // 下次点击弹窗的时候清空表单
  await resetFields();
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter, title: data.title });
  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  // title.value = data.title;
  if (unref(isUpdate)) {
    const obj = JSON.parse(JSON.stringify(data.record));
    //表单赋值
    setFieldsValue({
      ...obj,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
</script>

<style></style>
