<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="onSubmit" width="1000px" destroyOnClose>
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { defHttp } from '/@/utils/http/axios';
  import { saveOrUpdate } from './train.api';
  import { message, Upload } from 'ant-design-vue';

  const emit = defineEmits(['success', 'register']);
  const getTitle = ref('查看');
  const isUpdate = ref<Boolean>(true);
  const trainId = ref('');
  const subsidiaryCode: any = ref([]);

  function getOrgList() {
    subsidiaryCode.value = [];
    defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
      res.map((item: any) => {
        subsidiaryCode.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    });
  }

  getOrgList();

  const schemas: any = [
    {
      label: '所属单位',
      field: 'subsidiaryCode',
      required: true,
      component: 'Select',
      componentProps: ({ formActionType }) => {
        const { setFieldsValue } = formActionType;
        if (subsidiaryCode.value.length === 1) {
          setFieldsValue({
            subsidiaryCode: subsidiaryCode.value[0]?.value,
          });
        }
        return {
          options: subsidiaryCode.value,
          placeholder: '请选择',
          disabled: subsidiaryCode.value.length === 1,
        };
      },
    },
    {
      label: '培训类型',
      field: 'trainType',
      required: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'train_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '培训时间',
      field: 'trainTime',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          const today = new Date();
          // 将当前日期转换为时间戳
          const todayTimestamp = today.getTime();
          // 将当前日期之前的日期转换为时间戳
          const currentTimestamp = current.valueOf();
          // 判断当前日期是否在当前日期之前
          return currentTimestamp > todayTimestamp;
        },
      },
      required: true,
    },
    {
      label: '培训名称',
      field: 'trainName',
      component: 'Input',
      componentProps: {
        showCount: true,
        maxLength: 50,
        suffix: '/50',
      },
      required: true,
    },
    {
      label: '培训签到表',
      field: 'signSheetPath',
      component: 'JUpload',
      componentProps: {
        text: '添加附件',
        maxCount: 1,
        beforeUpload: (file: File) => {
          const nameList = file.name?.split('.');
          const suffix = nameList[nameList.length - 1];
          const str = 'doc,docx,xls,xlsx,png,jpg,pdf';
          if (str.indexOf(suffix) < 0) {
            message.error(`文件格式错误，仅支持doc、docx、xls、xlsx、png、jpg、pdf格式!`);
            return false;
          }
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
      required: true,
    },
    {
      label: '培训记录表',
      field: 'recordSheetPath',
      component: 'JUpload',
      componentProps: {
        text: '添加附件',
        maxCount: 1,
        beforeUpload: (file: File) => {
          const nameList = file.name?.split('.');
          const suffix = nameList[nameList.length - 1];
          const str = 'doc,docx,xls,xlsx,png,jpg,pdf';
          if (str.indexOf(suffix) < 0) {
            message.error(`文件格式错误，仅支持doc、docx、xls、xlsx、png、jpg、pdf格式!`);
            return false;
          }
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
      required: true,
    },
    {
      label: '培训小结',
      field: 'resultPath',
      component: 'JUpload',
      componentProps: {
        text: '添加附件',
        maxCount: 1,
        beforeUpload: (file: File) => {
          const nameList = file.name?.split('.');
          const suffix = nameList[nameList.length - 1];
          const str = 'doc,docx,xls,xlsx,png,jpg,pdf';
          if (str.indexOf(suffix) < 0) {
            message.error(`文件格式错误，仅支持doc、docx、xls、xlsx、png、jpg、pdf格式!`);
            return false;
          }
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
      required: true,
    },
    {
      label: '培训照片',
      field: 'imagePath',
      component: 'JImageUpload',
      componentProps: {
        text: '添加附件',
        fileMax: 20,
        isFireWatermark: true,
      },
      required: true,
    },
    {
      label: '培训记录',
      field: 'recordPath',
      component: 'JUpload',
      componentProps: {
        text: '添加附件',
        maxCount: 1,
        beforeUpload: (file: File) => {
          const nameList = file.name?.split('.');
          const suffix = nameList[nameList.length - 1];
          const str = 'doc,docx,xls,xlsx,png,jpg,pdf';
          if (str.indexOf(suffix) < 0) {
            message.error(`文件格式错误，仅支持doc、docx、xls、xlsx、png、jpg、pdf格式!`);
            return false;
          }
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            message.error('文件过大，请不要超过300M！');
            return false || Upload.LIST_IGNORE;
          }
          return true;
        },
      },
      required: true,
    },
  ];
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, resetSchema }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    trainId.value = data.record?.id;
    isUpdate.value = !!data?.isUpdate;
    if (data.type === '0') {
      getTitle.value = '新增';
    } else if (data.type === '1') {
      getTitle.value = '查看';
    } else {
      getTitle.value = '编辑';
    }
    await resetSchema(schemas);
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter,
    });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
    setProps({ disabled: !data?.showFooter });
  });

  async function onSubmit() {
    const values = await validate();
    const orgArr = subsidiaryCode.value.filter((v) => v.value === values.subsidiaryCode);
    values.subsidiaryName = orgArr[0].label;
    if (unref(isUpdate)) {
      values.id = trainId.value;
    }
    setModalProps({ confirmLoading: true });
    try {
      await saveOrUpdate(values, isUpdate.value);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  :deep(.ant-input-suffix) {
    color: #999;
  }
</style>
