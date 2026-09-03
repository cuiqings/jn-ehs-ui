<template>
  <BasicModal @register="register" @cancel="resetFields" @ok="handleSubmit" :bodyStyle="{height: '300px'}" v-bind="$attrs" title="合规说明">
    <BasicForm @register="registerForm" @submit="handleSubmit" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useForm, BasicForm, FormSchema } from '/@/components/Form';
  import { getAllUser } from '../url/index'
  import dayjs, { Dayjs } from 'dayjs';

  const emits = defineEmits(['ok']);

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };
  const formSchemas: FormSchema[] = [
    {
      label: '整改说明',
      field: 'description',
      component: 'Input',
      componentProps:{
        maxLength: 100,
        placeholder: '请输入',
      },
    },
    {
      label: '整改人名称',
      field: 'rectifyPeopleName',
      component: 'Input',
      show: false,
      componentProps:{
        type: 'hidden'
      },
    },
    {
      label: '整改人',
      field: 'rectifyPeople',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: { label: 'title', value: 'id' },
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        getPopupContainer: _ => document.body,
        options: [],
        onChange: (o, v) => {
          console.log(o, v);
          setFieldsValue({
            rectifyPeopleName: v.title
          })
        }
      },
    },
    {
      label: '整改时间',
      field: 'rectifyTime',
      component: 'DatePicker',
      componentProps: {
        style: { width: '100%' },
        valueFormat: "YYYY-MM-DD",
        disabledDate: disabledDate,
        getCalendarContainer: trigger => document.body
      }
    },
  ];

  const [register, { closeModal }] = useModalInner((data) => {
    init();
  })

  function init () {
    getAllUser().then(res => {
      updateSchema({
        field: 'rectifyPeople',
        componentProps: {
          options: res
        }
      })
    })
  }

  const [registerForm, { getFieldsValue, updateSchema, resetFields, setFieldsValue }] = useForm({
    //注册表单列
    schemas: formSchemas,
    showActionButtonGroup: false,
  });
  
  function handleSubmit(values: any) {
    emits('ok', getFieldsValue());
    resetFields();
  }

</script>
<style lang="less" scoped></style>
