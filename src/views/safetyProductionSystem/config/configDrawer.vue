<template>
  <div>
    <BasicDrawer
      @register="registerDrawer"
      :title="getTitle"
      :show-footer="showFooter"
      :show-ok-btn="showOkBtn"
      @ok="onSubmit"
      width="900px"
      destroyOnClose
    >
      <BasicForm @register="registerForm">
        <template #userIdSlot="{ model, field }">
          <JUserModal v-model:value="model[field]" :disabled="!showOkBtn" type="checkbox" @confirm="cbConfirm" />
        </template>
      </BasicForm>
    </BasicDrawer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdate, messageTemplate, noticeRole } from './config.api';
  import { getDepart3ListWithSecurity, getDeptNew } from '../certificate/certificate.api';
  import { JUserModal } from '/@/components/Form';
  const emit = defineEmits(['success', 'register']);
  const getTitle = ref('查看');
  const orgOptions: any = ref([]);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const departOptions: any = ref([]);
  const templateOptions: any = ref([]);
  const timeOptions: any = ref([]);
  const roleOptions: any = ref([]);
  onMounted(() => {
    // 所属单位
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    getTime();
    getTemplateList();
    getRoleList();
  });
  const schemas: any = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属单位',
      field: 'organizationCode',
      required: true,
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      label: '',
      field: 'organizationName',
      component: 'Input',
      show: false,
    },
    {
      label: '车间',
      field: 'departCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      label: '',
      field: 'departName',
      component: 'Input',
      show: false,
    },
    {
      label: '证书类型',
      field: 'certificationsType',
      required: true,
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: 'pq_certificate_type',
          placeholder: '请选择',
          stringToNumber: false,
          showChooseOption: false,
          onChange: (value) => {
            formModel.workType = undefined;
            formModel.actionItems = undefined;
            if (value === '1' || value === '2') {
              clearValidate(['certificationsName']);
            } else {
              clearValidate(['workType', 'actionItems']);
            }
          },
        };
      },
    },
    {
      label: '作业类别',
      field: 'workType',
      ifShow: ({ values }) => {
        return values.certificationsType === '1' || values.certificationsType === '2';
      },
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: formModel.certificationsType === '1' ? 'special_work_operate_type' : 'equipment_list_work_type',
          stringToNumber: false,
          showChooseOption: false,
          onChange: () => {
            formModel.actionItems = undefined;
          },
        };
      },
    },
    {
      label: '操作项目',
      field: 'actionItems',
      ifShow: ({ values }) => {
        return values.certificationsType === '1' || values.certificationsType === '2';
      },
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: formModel.workType,
          stringToNumber: false,
          showChooseOption: false,
        };
      },
    },
    {
      label: '消息模版',
      field: 'sysSmsTemplateId',
      component: 'Select',
      required: true,
      componentProps: {
        options: [],
      },
    },
    {
      label: '通知人',
      field: 'userId',
      component: 'Input',
      required: true,
      slot: 'userIdSlot',
    },
    {
      label: '',
      field: 'userName',
      component: 'Input',
      show: false,
    },
    {
      label: '通知渠道',
      field: 'warnNotice',
      component: 'JCheckbox',
      componentProps: {
        dictCode: 'warn_notice',
        placeholder: '请选择',
        stringToNumber: false,
      },
      required: true,
    },
    {
      label: '是否通知持证人',
      field: 'whetherRemindOwner',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
      },
    },
    {
      label: '提醒设置',
      field: 'beforeExpirationDay',
      helpMessage: '未设置复审/换证日期的按有效期进行提醒',
      rules: [{ required: true, message: '请输入正确的提醒设置', pattern: /^[1-9]\d*$/ }],
      component: 'Input',
      componentProps: {
        addonAfter: '天',
        addonBefore: '到期前',
        maxLength: 3,
      },
    },
    {
      label: '频度',
      field: 'remindLevelOneFrequency',
      rules: [{ required: true, message: '请输入正确的频度', pattern: /^[1-9]\d*$/ }],
      component: 'Input',
      componentProps: {
        addonAfter: '天 1次',
        addonBefore: '每',
        maxLength: 3,
      },
    },
    {
      label: '时间',
      field: 'remindTimePoint',
      component: 'Select',
      required: true,
      componentProps: {
        options: timeOptions.value,
      },
    },
  ];
  const [registerForm, { validate, setFieldsValue, resetFields, setProps, updateSchema, clearValidate }] = useForm({
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
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    getTitle.value = data.title;
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    updateSchema({
      field: 'organizationCode',
      componentProps: ({ formModel }) => {
        return {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value, extra) => {
            formModel.departCode = undefined;
            formModel.departName = '';
            formModel.organizationName = '';
            updateSchema({
              field: 'departCode',
              componentProps: () => {
                return {
                  options: [],
                };
              },
            });
            if (value) {
              formModel.organizationName = extra.label;
              getDepartList(value);
            }
          },
        };
      },
    });
    updateSchema({
      field: 'sysSmsTemplateId',
      componentProps: {
        options: templateOptions.value,
      },
    });
    // updateSchema({
    //   field: 'roleId',
    //   componentProps: ({ formModel }) => {
    //     return {
    //       options: roleOptions.value,
    //       showSearch: true,
    //       mode: 'multiple',
    //       filterOption: (input: string, option: any) => {
    //         return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    //       },
    //       onChange: (value, extra) => {
    //         formModel.roleName = undefined;
    //         if (value) {
    //           formModel.roleName = extra.map((item) => item.label).join(',');
    //         }
    //       },
    //     };
    //   },
    // });
    updateSchema({
      field: 'remindTimePoint',
      componentProps: {
        options: timeOptions.value,
      },
    });
    if (data.type === 'add') {
      if (orgOptions.value?.length === 1) {
        setFieldsValue({
          organizationCode: orgOptions.value[0]?.value,
          organizationName: orgOptions.value[0]?.label,
        });
        getDepartList(orgOptions.value[0]?.value);
      }
    }
    if (data.type !== 'add') {
      const obj = JSON.parse(JSON.stringify(data.record));
      getDepartList(obj.organizationCode);
      // obj.roleId = obj.roleId.split(',');
      //表单赋值
      await setFieldsValue({
        ...obj,
      });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  // 消息模版
  const getTemplateList = () => {
    templateOptions.value = [];
    messageTemplate().then((res) => {
      templateOptions.value = res.records.map((item) => {
        return {
          label: item.templateName,
          value: item.id,
        };
      });
    });
  };
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'departCode',
        componentProps: ({ formModel }) => {
          return {
            options: departOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            onChange: (value, extra) => {
              formModel.departName = '';
              if (value) {
                formModel.departName = extra.label;
              }
            },
          };
        },
      });
    });
  };
  // 通知角色
  const getRoleList = () => {
    roleOptions.value = [];
    noticeRole().then((res) => {
      roleOptions.value = res.records.map((item: any) => {
        return {
          label: item.roleName,
          value: item.id,
        };
      });
    });
  };
  // 时间
  const getTime = () => {
    timeOptions.value = [];
    for (let i = 7; i < 24; i++) {
      timeOptions.value.push({
        label: i < 10 ? `0${i}:00` : `${i}:00`,
        value: i < 10 ? `0${i}` : i,
      });
    }
    for (let i = 0; i < 7; i++) {
      timeOptions.value.push({
        label: `0${i}:00`,
        value: `0${i}`,
      });
    }
  };
  const onSubmit = async () => {
    const values = await validate();
    setDrawerProps({ confirmLoading: true });
    try {
      await saveOrUpdate(values, getTitle.value === '编辑');
      closeDrawer();
      emit('success');
      setDrawerProps({ confirmLoading: false });
    } catch {
      setDrawerProps({ confirmLoading: false });
    }
  };
  const cbConfirm = (name) => {
    setFieldsValue({
      userName: name,
    });
  };
</script>

<style lang="less" scoped></style>
