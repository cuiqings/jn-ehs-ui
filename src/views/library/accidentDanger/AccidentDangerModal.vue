<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="onSubmit" width="680px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, getDetailById } from './accidentDanger.api';
  import { useUserStore } from '/@/store/modules/user';
  import { message, Upload } from 'ant-design-vue';
  import dayjs from 'dayjs';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(false);
  const userStore = useUserStore();
  const title = ref('新增');
  console.log('userStore', userStore);
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '事故名称',
      field: 'accidentTitle',
      component: 'Input',
    },
    {
      field: 'accidentCategory',
      label: '事故类型',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_accident_category',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        // mode: 'multiple',
      },
    },
    {
      label: '事故等级',
      field: 'accidentLevel',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'bs_accident_level',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      field: 'occurTime',
      label: '事故发生时间',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        showTime: true,
        style: { width: '100%' },
        // 可以选择今天之前的日期
        disabledDate: (current) => {
          return current > dayjs().endOf('day');
        },
      },
    },
    {
      label: '事故报告',
      field: 'attachment',
      component: 'JUpload',
      componentProps: {
        // maxCount: 1,
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('useDrawerInner', data);
    if (!data?.showFooter) {
      title.value = '查看';
    } else if (data?.isUpdate) {
      title.value = '编辑';
    } else {
      title.value = '新增';
    }
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    //重置表单
    await resetFields();
    if (unref(isUpdate)) {
      await setFieldsValue({
        ...data.record,
      });
    }
    // 禁用表单
    setProps({ disabled: !data?.showFooter });
  });
  //表单提交事件
  async function onSubmit() {
    try {
      let values = await validate();
      console.log('values', values);
      setModalProps({ confirmLoading: true });
      // 提交表单
      await saveOrUpdate(values, isUpdate.value);
      // 关闭弹窗
      closeModal();
      // 刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
<style lang="less" scoped>
  .red-require {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
</style>
