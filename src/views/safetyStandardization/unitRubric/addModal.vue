<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      :width="700"
      :bodyStyle="{ padding: '10px 20px 0 0' }"
      title="新增评审"
      :maskClosable="false"
      destroyOnClose
    >
      <BasicForm @register="registerForm">
        <template #leaderId="{ model, field }">
          <JUserModal v-model:value="model[field]" @confirm="() => clearValidate(['leaderId'])" />
        </template>
        <template #memberId="{ model, field }">
          <JUserModal v-model:value="model[field]" type="checkbox" @confirm="() => clearValidate(['memberId'])" />
        </template>
      </BasicForm>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">开始评审</a-button>
        </div>
      </template>
    </basic-modal>
    <ScoreModal @register="registerScoreModal" @success="emit('success')" />
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { JUserModal } from '/@/components/Form';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import dayjs from 'dayjs';
  import ScoreModal from './scoreModal.vue';
  import { add } from './api';
  const [registerScoreModal, { openModal: openScoreModal }] = useModal();
  const emit = defineEmits(['success']);
  const orgOptions: any = ref([]);
  const loading = ref(false);
  const evaluateTimeStart = ref<string>('');
  const formSchema: FormSchema[] = [
    {
      label: '自评/评审单位',
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
          getPopupContainer: () => document.body,
        };
      },
    },
    {
      label: '单元类型',
      field: 'unitType',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          {
            label: '炼钢单元',
            value: '炼钢单元',
          },
          {
            label: '炼铁单元',
            value: '炼铁单元',
          },
          {
            label: '烧结单元',
            value: '烧结单元',
          },

          {
            label: '煤气单元',
            value: '煤气单元',
          },
          {
            label: '轧钢单元',
            value: '轧钢单元',
          },
          {
            label: '西柏坡新能源有限公司',
            value: '西柏坡新能源有限公司',
          },
        ],
      },
    },
    {
      label: '评审开始时间',
      field: 'evaluateTimeStart',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        getPopupContainer: () => document.body,
        onChange: (date: string) => {
          evaluateTimeStart.value = date;
          setFieldsValue({
            evaluateTimeEnd: '',
          });
        },
      },
    },
    {
      label: '评审结束时间',
      field: 'evaluateTimeEnd',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        getPopupContainer: () => document.body,
        disabledDate: (current: any) => {
          if (!evaluateTimeStart.value) return false;
          const startDate = dayjs(evaluateTimeStart.value);
          return current && !dayjs(current).isAfter(startDate, 'day');
        },
      },
    },
    {
      label: '评审组组长',
      field: 'leaderId',
      required: true,
      component: 'Input',
      slot: 'leaderId',
    },
    {
      label: '评审组主要成员',
      field: 'memberId',
      required: true,
      component: 'Input',
      slot: 'memberId',
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate, clearValidate }] = useForm({
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
  const initOrg = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'orgCode',
        componentProps: () => {
          return {
            options: orgOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            getPopupContainer: () => document.body,
          };
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
    });
  };
  const [registerModal, { closeModal }] = useModalInner(async () => {
    await resetFields();
    initOrg();
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    const values = await validate();
    loading.value = true;
    add({ ...values })
      .then((res) => {
        if (res) {
          openScoreModal(true, {
            title: `单元评分表-${res.orgName}（${res.unitType}）`,
            data: res,
          });
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
<style lang="less" scoped></style>
