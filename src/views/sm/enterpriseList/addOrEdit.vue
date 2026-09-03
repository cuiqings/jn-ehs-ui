<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" okText="提交" destroyOnClose @ok="handleSubmit" width="600px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" name="enterprise-addOrEdit" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { ref } from 'vue';
  import { add, edit } from './url/index';
  const emit = defineEmits(['success']);
  const title = ref('');
  const schemas: any[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '企业名称',
      field: 'companyName',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 30,
        autoSize: true,
      },
      // dynamicDisabled: ({ values }) => {
      //   return !!values.id;
      // },
    },
    {
      label: '主要负责人',
      field: 'companyManager',
      required: true,
      component: 'Input',
      componentProps: {
        maxlength: 10,
      },
      // dynamicDisabled: ({ values }) => {
      //   return !!values.id;
      // },
    },
    {
      label: '主要负责人电话',
      field: 'projectPhone',
      component: 'Input',
      dynamicRules: () => {
        return [
          {
            required: true,
            pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
            message: '请输入正确的项目负责人电话',
          },
        ];
      },
      // dynamicDisabled: ({ values }) => {
      //   return !!values.id;
      // },
    },
    {
      label: '经营范围',
      field: 'businessScope',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 200,
        autoSize: true,
      },
    },
    {
      label: '企业档案备注',
      field: 'businessRemark',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 200,
      },
    },
    {
      label: '创建人',
      field: 'createUserName',
      component: 'Input',
      ifShow: false,
      componentProps: {
        maxlength: 200,
      },
    },
    {
      label: '创建人单位',
      field: 'createOrgName',
      component: 'Input',
      ifShow: false,
      componentProps: {
        maxlength: 200,
      },
    },
    {
      label: '列入黑名单原因',
      field: 'blackRemark',
      component: 'InputTextArea',
      ifShow: false,
      componentProps: {
        autoSize: true,
      },
    },
  ];
  const [registerForm, { validate, setFieldsValue, resetFields, updateSchema, setProps }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 6,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 17,
      },
    },
  });
  const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
    await resetFields();
    title.value = data.title;
    updateSchema({
      field: 'createUserName',
      ifShow: false,
    });
    updateSchema({
      field: 'createOrgName',
      ifShow: false,
    });
    updateSchema({
      field: 'blackRemark',
      ifShow: false,
    });
    setModalProps({ confirmLoading: false, showCancelBtn: true, showOkBtn: true });
    if (data.title !== '新增') {
      if (data.title === '查看') {
        updateSchema({
          field: 'createUserName',
          ifShow: true,
        });
        updateSchema({
          field: 'createOrgName',
          ifShow: true,
        });
        if (data.isBlacklist) {
          updateSchema({
            field: 'blackRemark',
            ifShow: true,
          });
        }
        setProps({ disabled: true });
        setModalProps({ showCancelBtn: true, showOkBtn: false });
      }
      setFieldsValue({ ...data.data });
    }
  });
  const handleSubmit = async () => {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    if (title.value === '新增') {
      await add(values)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          setModalProps({ confirmLoading: false });
        });
    } else {
      await edit(values)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          setModalProps({ confirmLoading: false });
        });
    }
  };
</script>
