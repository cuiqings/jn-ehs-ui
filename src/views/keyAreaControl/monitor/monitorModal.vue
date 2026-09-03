<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="查看" width="1000px" :zIndex="99" destroyOnClose>
      <BasicForm @register="registerForm">
        <template #cleanCheckPhotoType="{ field, model }">
          {{ model.cleanCheckPhotoType === '0' ? '有' : '无' }}
        </template>
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
  import { defHttp } from '/@/utils/http/axios';
  import { getPlanById } from './monitor.api';
  import PlanModal from '/@/views/periodicClean/record/RecordModal.vue';

  const [planModal, { openModal }] = useModal();
  const parentData: any = ref({});
  const subsidiaryCode: any = ref([]);

  function getOrgList() {
    subsidiaryCode.value = [];
    defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
      res.map((item: any) => {
        subsidiaryCode.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    });
  }

  getOrgList();

  const schemas: any = [
    {
      label: '所属机构',
      field: 'subsidiaryCode',
      component: 'Select',
      componentProps: ({ formActionType }) => {
        const { setFieldsValue } = formActionType;
        if (subsidiaryCode.value.length === 1) {
          setFieldsValue({
            subsidiaryCode: subsidiaryCode.value[0]?.value,
          });
        }
        return {
          options: subsidiaryCode.value,
          placeholder: '请选择',
        };
      },
    },
    {
      label: '工序',
      field: 'process',
      component: 'Input',
    },
    {
      label: '产线',
      field: 'line',
      component: 'Input',
    },
    {
      label: '部位',
      field: 'position',
      component: 'Input',
    },
    {
      label: '数量',
      field: 'numbers',
      component: 'Input',
    },
    {
      label: '工作原理及用途',
      field: 'principlePurpose',
      component: 'InputTextArea',
    },
    {
      label: '风险点描述',
      field: 'riskDescription',
      component: 'InputTextArea',
      componentProps: {
        maxLength: 100,
      },
    },
    {
      label: '清扫/检查制度',
      field: 'cenType',
      ifShow: false,
    },
    {
      label: '清扫/检查制度',
      field: 'censorshipWord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return values.cenType === '0' || !values.cenType;
      },
    },
    {
      label: '清扫/检查制度',
      field: 'censorshipFile',
      ifShow: ({ values }) => {
        return values.cenType === '1';
      },
      component: 'JUpload',
    },
    {
      label: '清扫/检查标准',
      field: 'criType',
      ifShow: false,
    },
    {
      label: '清扫/检查标准',
      field: 'criterionWord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return values.criType === '0' || !values.criType;
      },
    },
    {
      label: '清扫/检查标准',
      field: 'criterionFile',
      ifShow: ({ values }) => {
        return values.criType === '1';
      },
      component: 'JUpload',
    },
    {
      label: '清扫/检查周期',
      field: 'checkCycle',
      component: 'Input',
    },
    {
      label: '清扫/检查记录',
      field: 'cleanCheckRecordType',
      ifShow: false,
    },
    {
      label: '清扫/检查记录',
      field: 'maintenanceRecordId',
      ifShow: false,
    },
    {
      label: '清扫/检查记录',
      field: 'clearName',
      component: 'JUpload',
      ifShow: ({ values }) => {
        return values.cleanCheckRecordType === '0' && values.maintenanceRecordId;
      },
      slot: 'clearName',
    },
    {
      label: '清扫/检查记录',
      field: 'cleanCheckRecord',
      component: 'InputTextArea',
      ifShow: ({ values }) => {
        return !(values.cleanCheckRecordType === '0' && values.maintenanceRecordId);
      },
    },
    {
      label: '清扫/检查前后照片对比',
      field: 'cleanCheckPhotoType',
      component: 'Input',
      render: (params) => {
        return params.values.cleanCheckPhotoType === '0' ? '有' : '无';
      },
    },
    {
      label: '上次清扫/检查日期',
      field: 'lastCleanCheckTime',
      component: 'Input',
    },
    {
      label: '下次清扫/检查日期',
      field: 'nextCleanCheckTime',
      component: 'Input',
    },
    {
      label: '检查照片',
      field: 'checkPhoto',
      component: 'JImageUpload',
    },
  ];
  const [registerForm, { setFieldsValue, resetFields, setProps, resetSchema }] = useForm({
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
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    parentData.value = data.record;
    await resetSchema(schemas);
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter,
    });
    await setFieldsValue({
      ...data.record,
    });
    setProps({ disabled: !data?.showFooter });
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
</script>

<style lang="less" scoped></style>
