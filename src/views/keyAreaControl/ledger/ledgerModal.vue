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
  import { saveOrUpdate } from './ledger.api';
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

  const planOptions: any = ref([]);

  function getPlanList(subsidiaryCode) {
    planOptions.value = [];
    defHttp
      .get({
        url: '/fireManagement/jnFireKeyLedger/getClearName',
        params: { subsidiaryCode },
      })
      .then((res) => {
        planOptions.value = res;
      });
  }

  const schemas: any = [
    {
      label: '所属机构',
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
          onChange: (e: any) => {
            const { setFieldsValue } = formActionType;
            setFieldsValue({
              clearId: undefined,
            });
            getPlanList(e);
          },
        };
      },
    },
    {
      label: '工序',
      field: 'process',
      required: true,
      component: 'Input',
      componentProps: {
        showCount: true,
        maxLength: 20,
        suffix: '/20',
      },
    },
    {
      label: '产线',
      field: 'line',
      required: true,
      component: 'Input',
      componentProps: {
        showCount: true,
        maxLength: 20,
        suffix: '/20',
      },
    },
    {
      label: '部位',
      field: 'position',
      required: true,
      component: 'Input',
      componentProps: {
        showCount: true,
        maxLength: 50,
        suffix: '/50',
      },
    },
    {
      label: '数量',
      field: 'numbers',
      component: 'Input',
      componentProps: {
        showCount: true,
        maxLength: 20,
        suffix: '/20',
      },
    },
    {
      label: '工作原理及用途',
      field: 'principlePurpose',
      component: 'InputTextArea',
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '风险点描述',
      field: 'riskDescription',
      component: 'InputTextArea',
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '清扫/检查制度',
      field: 'cenType',
      component: 'RadioGroup',
      componentProps: ({ formActionType }) => {
        return {
          options: [
            { label: '文字', value: '0' },
            { label: '文件', value: '1' },
          ],
          onChange: (e: any) => {
            const { setFieldsValue } = formActionType;
            if (e.target.value === '0') {
              setFieldsValue({
                censorshipFile: '',
              });
            } else {
              setFieldsValue({
                censorshipWord: '',
              });
            }
          },
        };
      },
    },
    {
      label: '内容',
      field: 'censorshipWord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return values.cenType === '0';
      },
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '文件上传',
      field: 'censorshipFile',
      ifShow: ({ values }) => {
        return values.cenType === '1';
      },
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
    },
    {
      label: '清扫/检查标准',
      field: 'criType',
      component: 'RadioGroup',
      componentProps: ({ formActionType }) => {
        return {
          options: [
            { label: '文字', value: '0' },
            { label: '文件', value: '1' },
          ],
          onChange: (e: any) => {
            const { setFieldsValue } = formActionType;
            if (e.target.value === '0') {
              setFieldsValue({
                criterionFile: '',
              });
            } else {
              setFieldsValue({
                criterionWord: '',
              });
            }
          },
        };
      },
    },
    {
      label: '内容',
      field: 'criterionWord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return values.criType === '0';
      },
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '文件上传',
      field: 'criterionFile',
      ifShow: ({ values }) => {
        return values.criType === '1';
      },
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
    },
    {
      label: '清扫/检查周期',
      field: 'checkCycle',
      required: true,
      component: 'Input',
      componentProps: {
        autosize: true,
        minRows: 2,
        maxLength: 20,
      },
    },
    {
      label: '关联清理计划',
      field: 'clearId',
      component: 'Select',
      componentProps: () => {
        return {
          options: planOptions.value,
          placeholder: '请选择',
        };
      },
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
      sm: { span: 19 },
    },
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    trainId.value = data.record?.id;
    isUpdate.value = !!data?.isUpdate;
    const params = {
      0: '新增',
      1: '查看',
      2: '编辑',
    };
    getTitle.value = params[data.type];
    if (data.type !== '0') {
      getPlanList(data.record.subsidiaryCode);
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
      data.record.clearId = data.record.clearId?.replace(/\s+/g, '') === '' || !data.record.clearId ? undefined : data.record.clearId;
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
      if (values.clearId == undefined) {
        values.clearId = '';
      }
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
