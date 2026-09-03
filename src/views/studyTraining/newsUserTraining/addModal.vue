<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="700" :bodyStyle="{ padding: '10px 20px 0 0' }" :title="title" destroyOnClose>
      <BasicForm @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { getOrganizationNew, getDeptNew, add, edit } from './url/index';
  import { duplicateCheck } from '/@/views/system/user/user.api';
  const emit = defineEmits(['success']);
  const title = ref('新增');
  const showOkBtn = ref(true);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const loading = ref(false);
  const userId = ref('');
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      label: '车间/科室',
      field: 'departCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      label: '人员姓名',
      field: 'userName',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 10,
      },
    },
    {
      label: '工作证号',
      field: 'workNo',
      component: 'InputTextArea',
      dynamicRules: ({ schema }) => apiSys('work_no', schema),
      componentProps: {
        maxlength: 8,
        autoSize: true,
      },
    },
    {
      label: '职务/工种',
      field: 'duties',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 20,
      },
    },
    {
      label: '联系方式',
      field: 'phone',
      component: 'InputTextArea',
      dynamicRules: ({ schema }) => apiSys('phone', schema),
      componentProps: {
        maxlength: 11,
        autoSize: true,
      },
    },
    {
      label: '身份证号',
      field: 'idCard',
      component: 'InputTextArea',
      rules: [
        {
          pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          required: true,
          message: '请输入正确的身份证号！',
        },
      ],
      componentProps: {
        maxlength: 18,
        autoSize: true,
      },
    },
    {
      label: '用工方式',
      field: 'employmentType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '正式工', value: '1' },
          { label: '劳务派遣', value: '2' },
        ],
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  });
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res;
    });
  });
  const apiSys = (fieldName, schema) => {
    return [
      {
        required: true,
        trigger: 'change',
        validator: (_, value) => {
          if (!value) {
            return Promise.reject(`请输入${schema.label}！`);
          }
          if (value && fieldName === 'work_no') {
            if (!/^[\d]{8}$/.test(value)) {
              return Promise.reject(`工作证号为8位数字！！`);
            }
          }
          if (value && fieldName === 'phone') {
            if (!/^1[3456789]\d{9}$/.test(value)) {
              return Promise.reject(`请输入正确的联系方式！`);
            }
          }
          return new Promise<void>((resolve, reject) => {
            duplicateCheck({
              tableName: 'sys_user',
              fieldName,
              fieldVal: value,
              dataId: userId.value,
            })
              .then((res) => {
                res.success ? resolve() : reject(res.message || '校验失败');
              })
              .catch((err) => {
                reject(err.message || '验证失败');
              });
          });
        },
      },
    ];
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
        componentProps: () => {
          return {
            options: departOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          };
        },
      });
    });
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    showOkBtn.value = data.showOkBtn;
    await resetFields();
    userId.value = '';
    departOptions.value = [];
    updateSchema({
      field: 'orgCode',
      componentProps: {
        options: orgOptions.value,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        onChange: (value) => {
          updateSchema({
            field: 'departCode',
            componentProps: () => {
              return {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              };
            },
          });
          setFieldsValue({
            departCode: undefined,
          });
          if (value) {
            getDepartList(value);
          }
        },
      },
    });
    if (data.type !== 'add') {
      getDepartList(data.data.orgCode);
      const obj = JSON.parse(JSON.stringify(data.data));
      userId.value = obj.userId;
      //表单赋值
      await setFieldsValue({
        ...obj,
      });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const values = await validate();
    loading.value = true;
    if (title.value === '新增') {
      add({ ...values })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      edit({ ...values })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
</script>
<style lang="less" scoped></style>
