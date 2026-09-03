<template>
  <BasicModal :width="600" :minHeight="300" v-bind="$attrs" @register="registerModal" :title="title" okText="提交" destroyOnClose @ok="handleSubmit" width="600px">
    <BasicForm @register="registerForm" />
    <a-row><a-col span="6"></a-col><a-col span="18" style="color: #1890ff;">支持PDF、DOC、DOCX、PNG、JPG、JPEG格式，最多10个文件</a-col></a-row>
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
      label: '检查时间',
      field: 'checkDate',
      required: true,
      component: 'DatePicker',
      componentProps: {
        format:'YYYY-MM-DD',
        //返回值格式化（绑定值的格式）
        valueFormat:'YYYY-MM-DD',
        style: { width: '100%' },
        disabledDate: (val) => { 
          return val > new Date();
        },
        getPopupContainer: () => document.getElementById('app'),
      },
    },
    {
      label: '检查级别',
      field: 'checkLevel',
      required: true,
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '国家',
            value: '国家',
          },
          {
            label: '省',
            value: '省',
          },
          {
            label: '市',
            value: '市',
          },
          {
            label: '县级',
            value: '县级',
          },
        ],
      },
    },
    {
      label: '名称',
      field: 'name',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        maxlength: 30,
        autoSize: true,
      },
    },
    {
      label: '相关文件',
      field: 'file',
      component: 'JUpload',
      required: true,
      maxCount: 10,
      componentProps: {
        fileMax: 10,
        text: '请上传',
        isWatermark: true,
        accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
      },
    }
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
    if (data.title !== '新增检查记录') {
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
    if (title.value === '编辑') {
      await edit(values)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          setModalProps({ confirmLoading: false });
        });
      
    } else {
      await add(values)
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
