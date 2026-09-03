<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :canFullscreen="false" title="修改整改人" @ok="onSubmit" width="500px" :height="500">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getUserList, changeRepairPerson } from './account.api';
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  const showFooter = ref<Boolean>(true);
  const repairPersonOptions = ref([]);
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
        label: '整改人',
        field: 'repairPerson',
        component: 'Select',
        required: true,
        componentProps: ({ formActionType, formModel }) => {
          return {
            options: repairPersonOptions.value,
            placeholder: '请选择',
            showSearch: true,
            dropdownStyle: { maxHeight: '140px', overflow: 'auto' },
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          };
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
      sm: { span: 17 },
    },
  });
  async function onSubmit() {
    const values = await validate();
    const obj = JSON.parse(JSON.stringify(values));
    console.log('onSubmit', obj);
    await changeRepairPerson(obj);
    closeModal();
    emit('success');
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 下次点击弹窗的时候清空表单
    await resetFields();
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    showFooter.value = !!data?.showFooter;
    const obj = JSON.parse(JSON.stringify(data.record));
    // 获取车间责任人列表
    let params: any = {};
    if (data.record.org) {
      params.orgCode = data.record.org;
    }
    params.pageSize = 9999;
    params.pageNo = 1;
    await getUserList(params).then((res) => {
      if (res) {
        repairPersonOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
      }
    });
    //表单赋值
    setFieldsValue({
      ...obj,
    });
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
</script>
