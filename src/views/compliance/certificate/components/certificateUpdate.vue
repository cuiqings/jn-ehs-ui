<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="500"
              @ok="handleSubmit">
      <BasicForm @register="registerForm"></BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import {ref, computed, unref} from 'vue';
  import {BasicModal, useModal, useModalInner} from '/@/components/Modal';
  import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
  import {update} from '../certificate.api';
  import {message, Upload, UploadProps} from "ant-design-vue";
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage, createConfirm } = useMessage();
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {Rule} from "ant-design-vue/es/form";
  import {bool} from "vue-types";
  import {previewFile} from "/@/api/common/api";
  import dayjs, {Dayjs} from "dayjs";
  import {fileGetValue} from "/@/components/jeecg/JVxeTable/src/hooks/cells/useJVxeUploadCell";
  import {rules} from "/@/utils/helper/validator";
    
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  const isRemindBool = ref<boolean>(false);
  const [registerUserModal, { openModal }] = useModal();
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    previewFile(file.name).then((res) => {
      window.open(res, '_blank');
    });
  };
  //表单数据
  const formSchema: FormSchema[] = [
    {
      label: '证件编号',
      field: 'certificateNo',
      component: 'Input',
      rules: [{ required: true, message: '请填写证件编号！'}],
      dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('ehs_ecm_certificate', 'certificate_no', model, schema, true),
      componentProps:{
        maxLength: 50,
      },
    },
    {
      label: '证件有效起始日期',
      field: 'certificateValidateStart',
      component: 'DatePicker',
      rules: [{ required: true, message: '请选择证件有效起始日期！'}],
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {width: '100%'}
      },
    },
    {
      label: '证件有效结束日期',
      field: 'certificateValidateEnd',
      component: 'DatePicker',
      dynamicRules: ({ model }) => {
        return [
          {
            validator: (_, value) => {
              let fieldsValue = getFieldsValue();
              let certificateValidateStart = fieldsValue.certificateValidateStart;
              if(certificateValidateStart != undefined && certificateValidateStart != null){
                if(dayjs(certificateValidateStart) > dayjs(value)){
                  return new Promise((resolve, reject) => {
                    reject('证件有效开始日期不可大于证件有效结束日期！');
                  });
                }else{
                  return new Promise((resolve, reject) => {
                    resolve();
                  });
                }
              }else{
                return new Promise((resolve, reject) => {
                  resolve();
                });
              }

            },
          },
        ];
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {width: '100%'},
        disabledDate: (current: Dayjs)=>{
          let fieldsValue = getFieldsValue();
          if(fieldsValue.certificateValidateStart != undefined && fieldsValue.certificateValidateStart != null){
            return current < dayjs(fieldsValue.certificateValidateStart).startOf('day');
          }
        },
        onChange: (time, timeString)=>{
          let fieldsValue = getFieldsValue();
          if(time == null && fieldsValue.isRemind == '1'){
            // createConfirm({
            //   iconType: 'warning',
            //   title: '是否关闭提醒',
            //   content: '未设置到期时间，当前证书的提醒设置将不再生效，是否继续?',
            //   onOk: async () => {
            //     setFieldsValue({isRemind: "0"});
            //     isRemindBool.value = false;
            //   },
            // });
          }
        }
      },
    },
    {
      label: '证件原件',
      field: 'certificatePath',
      component: 'JUpload',
      rules: [{ required: true, message: '请上传证件原件！'}],
      componentProps: {
        bizPath: 'certificate',
        maxCount: 1,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isPdf = file.type === 'application/pdf';
          const isDoc = file.type === 'application/msword';
          const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          } else if (!isPdf && !isDoc && !isDocx) {
            message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
        showUploadList:{
          showDownloadIcon: true,
          showRemoveIcon: true,
        },
        previewFile: (file: File) => {
          handlePreview(file);
        }
      },
    },
    // TODO 主键隐藏字段，目前写死为ID
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false
    },
    {
      label: '提醒设置',
      field: 'isRemind',
      component: 'Switch',
      componentProps: {
        checked: false,
        checkedValue: "1",
        unCheckedValue: "0",
        onChange: (checked, event)=>{
        }
      },
      show: false,
      defaultValue: "0"
    },
  ];

  //表单配置
  const [registerForm, {setProps, getProps, resetFields, setFieldsValue, getFieldsValue, validate}] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 24},
  });

  //表单赋值
  const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter
    });
    isUpdate.value = !!data?.isUpdate;
    if (data.record.isRemind == '1') {
      isRemindBool.value = true;
    } else {
      isRemindBool.value = false;
    }
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
    // 隐藏底部时禁用整个表单
    setProps({disabled: !data?.showFooter})
  });
  //设置标题
  const title = computed(() => ("更新"));

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      let fieldsValue = getFieldsValue();
      console.log(values);
      if(fieldsValue.certificateValidateEnd == null) {
        createConfirm({
          iconType: 'warning',
          title: '是否关闭提醒',
          content: '未设置到期时间，当前证书的提醒设置将不再生效，是否继续?',
          onOk: async () => {
            values.isRemind="0";
            values.certificateValidateEnd="";
            console.log(getFieldsValue());
            setModalProps({confirmLoading: true});
            //提交表单
            await update(values);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          },
          // onCancel: async ()=>{
          //   return;
          // }
        });
      }else{
        setModalProps({confirmLoading: true});
        //提交表单
        await update(values);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      }

    } finally {
      setModalProps({confirmLoading: false});
    }
  }
</script>
