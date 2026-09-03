<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @cancel="close"
      @close="close"
      @register="registerModal"
      :width="700"
      :bodyStyle="{ padding: '10px 20px 0 0' }"
      :title="title"
      destroyOnClose
      :maskClosable="false"
    >
      <BasicForm @register="registerForm" />
      <template #footer>
        <div style="text-align: center; padding-top: 13px">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { add, edit } from './url/index';
  import { userListByOrg, getEduOrgList } from '/@/api/common/api';

  const emit = defineEmits(['success']);
  const title = ref('新增');
  const showOkBtn = ref(true);
  const orgOptions: any = ref([]);
  const loading = ref(false);
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
      component: 'TreeSelect',
      required: true,
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
        };
      },
    },
    {
      label: '所属单位',
      field: 'orgName',
      component: 'Input',
      show: false,
    },
    {
      label: '讲师姓名',
      field: 'userId',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          getPopupContainer: () => document.body,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      label: '讲师姓名',
      field: 'userName',
      component: 'Input',
      show: false,
    },
    {
      label: '讲师介绍',
      field: 'describes',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
        autoSize: true,
        maxlength: 50,
      },
    },
  ];
  const detailInfo = ref({});

  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, getFieldsValue, updateSchema, validate }] = useForm({
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
    getEduOrgList({ level: 3 }).then((res) => {
      orgOptions.value = setOrgOptions(res);
    });
  });
  function setOrgOptions(list) {
    list.forEach((item) => {
      item.label = item.title;
      item.value = item.key;
      item.id = item.id;
      if(item.key.length < 9){
        item.selectable = false;
      }
      delete item.key;
      if (item.children) {
        item.children = setOrgOptions(item.children);
      }
    });
    return list;
  }

  // 选择证书
  const certName = ref('');
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    showOkBtn.value = data.showOkBtn;
    detailInfo.value = {};
    await resetFields();
    updateSchema({
      field: 'orgCode',
      componentProps: {
        treeData: orgOptions.value,
        disabled: data.type === 'edit',
        showSearch: true,
        getPopupContainer: () => document.body,
        treeNodeFilterProp: 'label',
        onChange: (value, item) => {
          setFieldsValue({
            orgName: item.label,
          });
          getUserList(value);
        },
      },
    });
    if (data.type === 'add') {
      orgList.value = [];
      userArrList.value = [];
      getUserList(orgOptions.value[0].value)
    }
    if (data.type !== 'add') {
      getUserList(data.data.orgCode)
      setFieldsValue({
        ...data.data,
      });
    }
  });
  const getUserList = (value) => {
    userListByOrg({ orgCode: value, pageSize: 100000 }).then(({ records }) => {
      const users = records.map((user) => {
        return {
          label: `${user.realname}-${user.workNo}-${user.org3Name}`,
          text: user.realname,
          value: user.id,
        };
      });
      updateSchema({
        field: 'userId',
        componentProps: () => {
          return {
            options: users,
            showSearch: true,
            getPopupContainer: () => document.body,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            onChange: (value, item) => {
              setFieldsValue({
                userName: item.text,
              });
            },
          };
        },
      });
    });
  }
  const close = () => {
    closeModal();
    resetFields();
    examConfig.value = {
      smsFlag: '1',
      questionsSort: '1',
      optionsSort: '1',
      examNum: '1',
      score: '0',
    };
    certName.value = '';
  };
  const confirmClose = async () => {
    const formData = getFieldsValue();
    loading.value = true;
    if (title.value === '新增') {
      add({ ...formData })
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
      edit({ ...formData })
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

  // 部门
  const orgList: any = ref([]);
  // 人员
  const userArrList: any = ref([]);
</script>
<style lang="less" scoped>
  .examconfig {
    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }
</style>
