<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看',
              onClick: handleView.bind(null, record),
            },
            {
              label: '处理',
              ifShow: record.alarmStatus !== '1' && record.status === '0',
              auth: ['gasWarning-task:process'],
              onClick: handleProcess.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <!-- 处理弹窗 -->
    <BasicModal @register="registerModal" title="报警任务" :width="1000" @ok="handleOk">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
<script setup name="gaswarning-task" lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { pageList, handle, detail } from './task.api';
  import { columns, searchFormSchema, processFormSchema, orgOptions, getOrgList, getWorkshopList, workshopOptions, isDisabled } from './task.data';
  import { dateFormat } from '/@/utils/common/compUtils';
  const id = ref('');
  const { tableContext, onExportXls } = useListPage({
    tableProps: {
      title: '',
      api: pageList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 90,
        fieldMapToTime: [['alarmTime', ['startTime', 'endTime'], 'YYYY-MM-DD HH:mm:ss']],
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            workshopOptions.value = [];
          }
        },
      },
      useSearchForm: true,
      showTableSetting: true,
      bordered: true,
      immediate: false,
      size: 'small',
      actionColumn: {
        width: 140,
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
    },
    exportConfig: {
      name: '煤气报警任务-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/alarmRecordTask/exportXls',
      suffix: 'xlsx',
    },
  });

  const [registerTable, { getForm, reload }] = tableContext;
  onMounted(async () => {
    await getOrgList();
    if (orgOptions.value.length === 1) {
      getForm().setFieldsValue({
        orgCode: orgOptions.value[0].value,
      });
      getWorkshopList(orgOptions.value[0].value);
    }
    reload();
  });
  // 处理弹窗
  const [registerModal, { openModal, closeModal, setModalProps }] = useModal();
  const [registerForm, { setFieldsValue, validate, resetFields, clearValidate }] = useForm({
    labelWidth: 140,
    schemas: processFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    labelCol: {
      span: 8,
    },
  });
  // 查看
  const handleView = (record) => {
    isDisabled.value = true;
    openModal(true);
    setModalProps({
      showOkBtn: false,
    });
    nextTick(() => {
      detail({ id: record.id }).then((res) => {
        if (res) {
          res.alarmStatus = res.alarmStatus === '1' ? '报警中' : '已结束';
          if (res.startTime && res.endTime) {
            res.alarmTime = `${res.startTime} / ${res.endTime}`;
          } else if (res.startTime && !res.endTime) {
            res.alarmTime = `${res.startTime} / 还未结束`;
          }
          setFieldsValue({
            ...res,
          });
        }
      });
    });
  };
  // 处理
  const handleProcess = async (record) => {
    isDisabled.value = false;
    openModal(true);
    setModalProps({
      showOkBtn: true,
    });
    await resetFields();
    nextTick(() => {
      id.value = record.id;
      detail({ id: record.id }).then((res) => {
        if (res) {
          res.alarmStatus = res.alarmStatus === '1' ? '报警中' : '已结束';
          if (res.startTime && res.endTime) {
            res.alarmTime = `${res.startTime} / ${res.endTime}`;
          } else if (res.startTime && !res.endTime) {
            res.alarmTime = `${res.startTime} / 还未结束`;
          }
          setFieldsValue({
            ...res,
          });
          clearValidate();
        }
      });
    });
  };
  // 确认处理
  const handleOk = async () => {
    try {
      const values = await validate();
      setModalProps({
        confirmLoading: true,
      });
      await handle({
        description: values.description,
        fileUrl: values.fileUrl,
        processingType: values.processingType,
        result: values.result,
        id: id.value,
      });
      setModalProps({
        confirmLoading: false,
      });
      closeModal();
      reload();
    } catch (error) {
      setModalProps({
        confirmLoading: false,
      });
    }
  };
</script>
<style lang="less" scoped>
  // :deep(.ant-table-title) {
  //   display: none;
  // }
  :deep(.ant-col-xs-24) {
    max-width: 100% !important;
  }
</style>
