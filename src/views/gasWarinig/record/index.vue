<template>
  <div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script setup name="gaswarning-record" lang="ts">
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getGasWarningRecordList } from './record.api';
  import { columns, searchFormSchema, orgOptions, getOrgList, getWorkshopList, workshopOptions } from './record.data';
  import { onMounted } from 'vue';
  const { tableContext } = useListPage({
    tableProps: {
      title: '',
      api: getGasWarningRecordList,
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
      size: 'small',
      immediate: false,
      showActionColumn: false,
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
</script>
<style lang="less" scoped>
  :deep(.ant-table-title) {
    display: none;
  }
</style>
