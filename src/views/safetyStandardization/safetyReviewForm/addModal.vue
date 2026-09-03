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
        <template #reviewPersonId="{ model, field }">
          <JUserModal v-model:value="model[field]" type="checkbox" @confirm="() => clearValidate(['reviewPersonId'])" />
        </template>
      </BasicForm>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">开始评审</a-button>
        </div>
      </template>
    </basic-modal>
    <ReviewModal @register="registerReviewModal" @success="emit('success')" />
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { JUserModal } from '/@/components/Form';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useModal } from '/@/components/Modal';
  import ReviewModal from './review.vue';
  import { add } from './api';
  const emit = defineEmits(['success']);
  const orgOptions: any = ref([]);
  const loading = ref(false);
  const [registerReviewModal, { openModal: openReviewModal }] = useModal();
  const formSchema: FormSchema[] = [
    {
      label: '评审单位',
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
      label: '内审员',
      field: 'reviewPersonId',
      component: 'Input',
      slot: 'reviewPersonId',
    },
    {
      label: '评审时间',
      field: 'time',
      component: 'RangeDate',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        getPopupContainer: () => document.body,
      },
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
    const obj = JSON.parse(JSON.stringify(values));
    const time = obj.time.split(',');
    obj.reviewTimeStart = time[0];
    obj.reviewTimeEnd = time[1];
    delete obj.time;
    loading.value = true;
    add(obj)
      .then((res) => {
        if (res) {
          openReviewModal(true, {
            title: '安全生产标准化内审表 - ' + res.orgName,
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
