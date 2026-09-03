<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="600px">
    <BasicForm @register="registerForm">
      <template #remindPerson="{ model, field }">
        <JUserModal
          v-model:value="model[field]"
          :isInit="model.depart ? true : false"
          :orgCode="model.depart"
          :disabled="isView"
          @confirm="cbConfirm1"
        />
      </template>
      <template #principal="{ model, field }">
        <JUserModal v-model:value="model[field]" :isInit="model.org ? true : false" :orgCode="model.org" :disabled="isView" @confirm="cbConfirm" />
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script setup lang="ts">
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { JUserModal } from '/@/components/Form';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { add, edit } from './api';
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const emit = defineEmits(['success']);
  const isUpdate = ref(true);
  const isView = ref(false);
  const getTitle = computed(() => {
    if (unref(isView)) {
      return '查看提醒记录';
    }
    return unref(isUpdate) ? '编辑提醒记录' : '新增提醒记录';
  });
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'org',
      label: '所属单位',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    },
    {
      field: 'depart',
      label: '所属车间',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
    },
    {
      field: 'remindType',
      label: '提醒类型',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '消防器材', value: '1' },
          { label: '绝缘工具', value: '2' },
        ],
        onChange: (value) => {
          if (value === '1') {
            setFieldsValue({
              principal: '',
              principalName: '',
            });
            clearValidate(['principal']);
          }
        },
      },
    },
    {
      field: 'remindPerson',
      label: '提醒人',
      component: 'Input',
      required: true,
      slot: 'remindPerson',
    },
    {
      label: '',
      field: 'remindPersonName',
      component: 'Input',
      show: false,
    },
    {
      field: 'principal',
      label: '责任人',
      component: 'Input',
      required: true,
      ifShow: ({ values }) => {
        return values.remindType === '2';
      },
      slot: 'principal',
    },
    {
      label: '',
      field: 'principalName',
      component: 'Input',
      show: false,
    },
    {
      field: 'ifRemindPrincipal',
      label: '是否通知责任人',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '2' },
        ],
      },
    },
    {
      field: 'remindTime',
      label: '提醒时间',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择提醒时间',
        options: [
          { label: '到期前3天', value: '1' },
          { label: '到期前5天', value: '2' },
          { label: '到期前7天', value: '3' },
          { label: '到期前10天', value: '4' },
          { label: '到期前15天', value: '5' },
          { label: '到期前30天', value: '6' },
        ],
      },
    },
  ];
  const [registerForm, { resetFields, setFieldsValue, validate, setProps, updateSchema, clearValidate }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    setModalProps({ confirmLoading: false, showCancelBtn: true, showOkBtn: true });
    isUpdate.value = !!data?.isUpdate;
    isView.value = !!data?.isView;
    init();
    departOptions.value = [];
    updateSchema({
      field: 'depart',
      componentProps: {
        options: [],
      },
    });
    setProps({ disabled: false });
    if (unref(isUpdate) || unref(isView)) {
      getDepartList(data.record.org);
      setFieldsValue({
        ...data.record,
      });
    }
    // 如果是查看模式，禁用表单
    if (unref(isView)) {
      setProps({ disabled: true });
      setModalProps({ showCancelBtn: true, showOkBtn: false });
    }
  });
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            setFieldsValue({
              depart: undefined,
              remindPerson: '',
              principal: '',
            });
            clearValidate(['depart', 'remindPerson', 'principal']);
            updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
              },
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          org: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
    });
  };
  // 车间
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'depart',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: () => {
            setFieldsValue({
              remindPerson: '',
            });
            clearValidate(['remindPerson']);
          },
        },
      });
    });
  };
  async function handleSubmit() {
    const values = await validate();
    if (unref(isUpdate)) {
      edit(values)
        .then(() => {
          closeModal();
          emit('success');
        })
        .finally(() => {
          setModalProps({ confirmLoading: false });
        });
    } else {
      add(values)
        .then(() => {
          closeModal();
          emit('success');
        })
        .finally(() => {
          setModalProps({ confirmLoading: false });
        });
    }
  }
  const cbConfirm1 = (_name, nameWorkNo) => {
    clearValidate('remindPerson');
    setFieldsValue({
      remindPersonName: nameWorkNo,
    });
  };
  const cbConfirm = (_name, nameWorkNo) => {
    clearValidate('principal');
    setFieldsValue({
      principalName: nameWorkNo,
    });
  };
</script>
