<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :canFullscreen="false"
    title="修改信息"
    @ok="onSubmit"
    width="500px"
    :bodyStyle="{ height: '350px' }"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getUserList, editInfo } from './account.api';
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  const showFooter = ref<Boolean>(true);
  const personOptions = ref([]);
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
        label: '隐患分类',
        field: 'yhType',
        required: true,
        component: 'JDictSelectTag',
        componentProps: ({ formModel, formActionType }) => {
          return {
            dictCode: 'sk_yh_type',
            placeholder: '请选择',
            stringToNumber: false,
            showChooseOption: false,
          };
        },
      },
      {
        label: '子类',
        field: 'yhTypeSub',
        required: true,
        component: 'JDictSelectTag',
        componentProps: {
          dictCode: 'sk_yh_type_sub',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
          dropdownStyle: {
            maxHeight: '120px',
            overflow: 'auto',
          },
        },
      },
      {
        label: '车间责任人',
        field: 'departDutyPerson',
        component: 'JSelectMultiple',
        componentProps: () => {
          return {
            showSearch: true,
            options: personOptions.value,
            placeholder: '请选择',
            mode: 'multiple',
            focus: true,
            onChange: (e: any) => {
              console.log('departDutyPerson multiple', e);
              // 最多不超过五个
              if (e && e.split(',').length > 5) {
                createMessage.error('最多选择五个责任人');
                e = e.split(',').slice(0, 5).join(',');
                setFieldsValue({ departDutyPerson: e });
              }
            },
          };
        },
      },
      {
        label: '班组责任人',
        field: 'teamDutyPerson',
        component: 'JSelectMultiple',
        componentProps: () => {
          return {
            showSearch: true,
            options: personOptions.value,
            placeholder: '请选择',
            mode: 'multiple',
            focus: true,
            onChange: (e: any) => {
              console.log('teamDutyPerson multiple', e);
              // 最多不超过五个
              if (e && e.split(',').length > 5) {
                createMessage.error('最多选择五个责任人');
                e = e.split(',').slice(0, 5).join(',');
                setFieldsValue({ teamDutyPerson: e });
              }
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
    await editInfo(obj);
    closeModal();
    emit('success');
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('data', data);
    // 下次点击弹窗的时候清空表单
    await resetFields();
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    showFooter.value = !!data?.showFooter;
    if (!data.record.departDutyPerson) {
      data.record.departDutyPerson = '';
    }
    if (!data.record.teamDutyPerson) {
      data.record.teamDutyPerson = '';
    }
    // 获取车间责任人列表
    let params: any = {};
    if (data.record.org) {
      params.orgCode = data.record.org;
    }
    params.pageSize = 9999;
    params.pageNo = 1;
    await getUserList(params).then((res) => {
      if (res) {
        personOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
      }
    });
    //表单赋值
    setFieldsValue({
      ...data.record,
    });
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
</script>
<style lang="less" scoped>
  :deep(.ant-select-dropdown) {
    height: 105px;
  }
  :deep(.ant-select-multiple .ant-select-selection-search) {
    position: relative;
    max-width: none;
    margin-inline-start: 7px;
  }
</style>
