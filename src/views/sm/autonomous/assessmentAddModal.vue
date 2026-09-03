<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="600"
    :title="title"
    :body-style="{ padding: '0 10px', maxHeight: '600px', overflow: 'auto' }"
    destroyOnClose
    :canFullscreen="false"
  >
    <BasicForm @register="registerForm">
      <template #personId="{ model, field }">
        <JUserModal
          v-model:value="model[field]"
          url="/xgf/xgfPerson/findByCompany"
          :params="{
            companyId: model.companyId,
          }"
          :fieldKeys="{
            realname: 'name',
          }"
          :userStyle="{ width: '100%' }"
          :isInit="model.companyId !== undefined && model.companyId !== ''"
          :curColumns="curColumns"
          isSerchId
          :disabled="type === 'edit'"
          @confirm="userConfirm"
        />
      </template>
    </BasicForm>
    <template #footer>
      <div style="text-align: right">
        <a-button @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="add-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { getDetailList } from '../admissionApplication/url/index';
  import { getPopupContainer } from '/@/utils';
  import { JUserModal } from '/@/components/Form';
  import { examine } from '../personnelList/url/index';
  import { editExamine } from './url/index';
  import { useUserStore } from '/@/store/modules/user';
  const emit = defineEmits(['success']);
  const userStore: any = useUserStore();
  const loading = ref(false);
  const title = ref('');
  const type = ref('');
  const orgOptions: any = ref([]);
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '相关方名称',
      field: 'companyId',
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
          getPopupContainer: getPopupContainer,
          allowClear: true,
        };
      },
    },
    {
      label: '人员',
      field: 'personId',
      component: 'Input',
      required: true,
      slot: 'personId',
    },
    {
      label: '考核减分分值',
      field: 'score',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: {
          width: '100%',
        },
        disabled: true,
        min: 1,
        max: 100,
        precision: 0,
        controls: false,
        addonAfter: '当前人员分数：',
      },
    },
    {
      label: '考核原因',
      field: 'remark',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 200,
      },
    },
  ];
  const curColumns = ref([
    {
      title: '用户账号',
      align: 'center' as const,
      dataIndex: 'username',
    },
    {
      title: '人员姓名',
      align: 'center' as const,
      dataIndex: 'name',
    },
    {
      title: '分数',
      align: 'center' as const,
      dataIndex: 'score',
    },
  ]);
  //表单配置
  const [registerForm, { resetFields, validate, updateSchema, clearValidate, setFieldsValue }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await resetFields();
    title.value = data.title;
    type.value = data.type;
    await getDetailList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.companyName,
          value: item.id,
          key: item.orgCode,
        };
      });
      updateSchema({
        field: 'companyId',
        componentProps: ({ formModel }) => {
          return {
            options: orgOptions.value,
            placeholder: '请选择',
            disabled: userStore.userInfo.orgCode.includes('A04B12'),
            onChange: () => {
              formModel.personId = undefined;
              formModel.score = undefined;
              updateSchema({
                field: 'score',
                componentProps: {
                  disabled: true,
                },
              });
            },
          };
        },
      });
    });
    if (data.type === 'add') {
      updateSchema({
        field: 'score',
        componentProps: {
          disabled: true,
          addonAfter: '当前人员分数：',
        },
      });
      if (userStore.userInfo.orgCode.includes('A04B12')) {
        setFieldsValue({
          companyId: orgOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.key))[0].value,
        });
      } else {
        setFieldsValue({
          companyId: undefined,
        });
        clearValidate(['companyId']);
      }
    } else {
      updateSchema({
        field: 'companyId',
        componentProps: {
          disabled: true,
          options: orgOptions.value,
        },
      });
      const res = JSON.parse(JSON.stringify(data.data));
      updateSchema({
        field: 'score',
        componentProps: {
          disabled: false,
          max: Number(data.data.totalScore) + Number(res.score),
          addonAfter: `当前人员分数：${Number(data.data.totalScore)}`,
        },
      });
      setFieldsValue({ ...res });
    }
  });
  const userConfirm = (_name, _nameWorkNo, _orgCode, resultList) => {
    clearValidate(['personId']);
    updateSchema({
      field: 'score',
      componentProps: {
        disabled: false,
        max: resultList[0].score,
        addonAfter: `当前人员分数：${resultList[0].score}`,
      },
    });
  };
  const confirmClose = async () => {
    const values = await validate();
    const data = JSON.parse(JSON.stringify(values));
    loading.value = true;
    try {
      let res = null;
      if (type.value === 'add') {
        res = await examine(data);
      } else {
        res = await editExamine(data);
      }
      if (res) {
        //关闭弹窗
        closeModal();
        loading.value = false;
        //刷新列表
        emit('success');
      }
    } catch {
      loading.value = false;
    }
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less" scoped>
  .record-container {
    padding: 10px;
  }

  .record-section {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    color: #1890ff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .record-item {
    border: 1px solid #d9d9d9;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 6px;
    .record-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      margin: 6px 16px 12px;
      .record-person {
        font-weight: 500;
        color: #333;
      }

      .record-time {
        color: #666;
        font-size: 13px;
        margin-left: 10px;
      }
    }

    .record-content {
      padding-left: 16px;

      .record-label {
        color: #666;
        font-weight: 500;
        margin-right: 4px;
      }

      .record-detail {
        margin-top: 8px;
        color: #333;
        line-height: 1.6;
      }

      .text-success {
        color: #52c41a;
      }

      .text-danger {
        color: #ff4d4f;
      }

      .record-images {
        margin-top: 12px;

        .image-list {
          margin-top: 8px;
        }
      }

      .record-files {
        margin-top: 12px;

        .file-list {
          margin-top: 8px;
        }
      }
    }
  }
</style>
