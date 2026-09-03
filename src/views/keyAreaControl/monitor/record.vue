<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="记录" @ok="onSubmit" width="1000px" :zIndex="99" destroyOnClose>
      <div class="position"> 位置：{{ parentData.subsidiaryName }}{{ parentData.process }}{{ parentData.line }}{{ parentData.position }} </div>
      <BasicForm @register="registerForm">
        <template #clearName="{ field, model }">
          <a @click="openRecord">{{ model.clearName }}</a>
        </template>
      </BasicForm>
    </BasicModal>
    <PlanModal @register="planModal" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { edit, getPlanById } from './monitor.api';
  import PlanModal from '/@/views/periodicClean/record/RecordModal.vue';

  const [planModal, { openModal }] = useModal();
  const emit = defineEmits(['success', 'register']);
  const parentData: any = ref({});
  const schemas: any = [
    {
      label: '清扫/检查记录',
      field: 'cleanCheckRecordType',
      required: true,
      component: 'RadioGroup',
      componentProps: ({ formActionType }) => {
        return {
          options: [
            { label: '有', value: '0' },
            { label: '无', value: '1' },
          ],
          onChange: (e) => {
            const { setFieldsValue, getFieldsValue } = formActionType;
            const { cleanCheckRecordType, maintenanceRecordId } = getFieldsValue;
            if (cleanCheckRecordType === '0' && maintenanceRecordId) {
              if (e.target.value === '0') {
                setFieldsValue({
                  cleanCheckRecord: '',
                });
              }
            } else {
              setFieldsValue({
                cleanCheckRecord: '',
              });
            }
          },
        };
      },
    },
    {
      label: '清扫/检查记录',
      field: 'maintenanceRecordId',
      ifShow: false,
    },
    {
      label: '文件',
      field: 'clearName',
      component: 'Input',
      ifShow: ({ values }) => {
        return values.cleanCheckRecordType === '0' && values.maintenanceRecordId;
      },
      slot: 'clearName',
    },
    {
      label: '文件',
      field: 'clearName',
      component: 'Input',
      ifShow: ({ values }) => {
        return values.cleanCheckRecordType === '0' && !values.maintenanceRecordId && values.clearName;
      },
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '内容',
      field: 'cleanCheckRecord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return !(values.cleanCheckRecordType === '0' && (values.maintenanceRecordId || (!values.maintenanceRecordId && values.clearName)));
      },
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '清扫/检查前后照片对比',
      field: 'cleanCheckPhotoType',
      required: true,
      component: 'RadioGroup',
      componentProps: ({ formActionType }) => {
        return {
          options: [
            { label: '有', value: '0' },
            { label: '无', value: '1' },
          ],
          onChange: () => {
            const { setFieldsValue } = formActionType;
            setFieldsValue({
              cleanCheckPhotoCompare: '',
            });
          },
        };
      },
    },
    {
      label: '内容',
      field: 'cleanCheckPhotoCompare',
      component: 'InputTextArea',
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '上次清扫/检查日期',
      field: 'lastCleanCheckTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          valueFormat: 'YYYY-MM-DD',
          style: {
            width: '100%',
          },
          disabledDate: (current) => {
            const today = new Date();
            const todayTimestamp = today.getTime();
            const currentTimestamp = current.valueOf();
            return currentTimestamp > todayTimestamp;
          },
        };
      },
    },
    {
      label: '下次清扫/检查日期',
      field: 'nextCleanCheckTime',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          const today = new Date();
          const todayTimestamp = today.getTime();
          const currentTimestamp = current.valueOf();
          return currentTimestamp < todayTimestamp;
        },
      },
    },
    {
      label: '检查照片',
      field: 'checkPhoto',
      component: 'JImageUpload',
      componentProps: {
        disabled: true,
      },
    },
    {
      label: '添加检查照片',
      field: 'newCheckPhoto',
      component: 'JImageUpload',
      componentProps: {
        fileMax: 30,
      },
    },
  ];
  const [registerForm, { validate, setFieldsValue, clearValidate }] = useForm({
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
    parentData.value = data.record;
    await setFieldsValue({
      ...data.record,
    });
    await clearValidate();
    setModalProps({
      confirmLoading: false,
    });
  });

  async function openRecord() {
    const res = await getPlanById({ id: parentData.value.maintenanceRecordId });
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record: res,
      type: '3', // 查看
    });
  }

  async function onSubmit() {
    const values = await validate();
    values.id = parentData.value.id;
    setModalProps({ confirmLoading: true });
    try {
      await edit(values);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .position {
    margin-bottom: 1em;
    font-size: 16px;
    font-family: 'PingFangSC-Regular', 'PingFang SC', sans-serif;
  }
</style>
