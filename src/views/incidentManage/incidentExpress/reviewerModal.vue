<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="600" :bodyStyle="{ padding: '0 20px 20px 20px' }" title="提交审核">
      <basic-form @register="registerForm" />
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="submitReviewLoading" @click="confirmClose">确认</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="reviewer-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { submitCheck, reviewUser } from './url/index';
  import { reactive } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  let jnEventReport = reactive({});
  let jnEventSurveyFile = reactive({});
  const submitReviewLoading = ref(false);
  const formSchema: FormSchema[] = [
    {
      label: '下一节点审核人',
      field: 'checkerId',
      component: 'ApiSelect',
      defaultValue: [],
      componentProps: {
        api: reviewUser,
        resultField: 'records',
        labelField: 'realname',
        valueField: 'id',
        getPopupContainer: () => document.body,
      },
    },
  ];
  //表单配置
  const [registerForm, { validate, resetFields }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  const [registerModal, { closeModal }] = useModalInner(async ({ record, investigationReport, surveyInformation }) => {
    await resetFields();
    jnEventReport = investigationReport;
    jnEventSurveyFile = surveyInformation;
    investigationReport.eventId = record.id;
    surveyInformation.eventId = record.id;
  });
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    try {
      const values = await validate();
      submitReviewLoading.value = true;
      await submitCheck({ ...values, jnEventReport, jnEventSurveyFile })
        .then((res) => {
          if (res.success) {
            createMessage.success('上报成功！');
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success', values.checkerId === '' ? 8 : 6);
          } else {
            createMessage.error(res.message);
          }
        })
        .finally(() => {
          submitReviewLoading.value = false;
        });
    } catch (e) {}
  };
</script>
