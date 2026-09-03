<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'staffCertificationsRemind:add'" @click="handleAdd">新增 </a-button>
        <a-button
          preIcon="ant-design:delete-outlined"
          v-if="selectedRowKeys.length > 0"
          v-auth="'staffCertificationsRemind:del'"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <config-drawer @register="registerDrawer" @success="onSuccess" />
  </div>
</template>

<script lang="ts" name="safetyProductionSystem-config" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList, deleteRecord, batchDeleteRecord } from './config.api';
  import { columns, searchFormSchema } from './config.data';
  import { useDrawer } from '/@/components/Drawer';
  import ConfigDrawer from './configDrawer.vue';
  import { getDepart3ListWithSecurity } from '../certificate/certificate.api';
  import { ref, onMounted } from 'vue';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const { tableContext, operateRequest } = useListPage({
    designScope: 'periodic-template',
    tableProps: {
      title: '证书提醒配置',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.organizationCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            organizationCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      immediate: false,
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 220,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const init = () => {
    getDepart3ListWithSecurity().then(async (res) => {
      orgOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'organizationCode',
        componentProps: {
          options: orgOptions.value,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          organizationCode: orgOptions.value[0]?.value,
        });
      }
      reload();
    });
  };
  onMounted(() => {
    init();
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  // 新增
  const handleAdd = () => {
    openDrawer(true, {
      showOkBtn: true,
      showFooter: true,
      title: '新增', // 新增
      type: 'add',
    });
  };
  // 操作列
  const getActions = (record) => {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'staffCertificationsRemind:edit',
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'staffCertificationsRemind:del',
      },
    ];
  };
  // 查看
  const handleDetail = (record) => {
    openDrawer(true, {
      showOkBtn: false,
      showFooter: true,
      record: record,
      title: '查看', // 查看
      type: 'view',
    });
  };
  // 编辑
  const handleEdit = (record) => {
    openDrawer(true, {
      record,
      showOkBtn: true,
      showFooter: true,
      title: '编辑', // 编辑
      type: 'edit',
    });
  };
  // 删除
  const handleDelete = (record) => {
    operateRequest(() => deleteRecord({ id: record.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => batchDeleteRecord({ ids: selectedRowKeys.value }), {
      confirm: true,
      isBatch: true,
    });
  };
  const onSuccess = () => {
    reload();
    selectedRowKeys.value = [];
  };
</script>

<style lang="less" scoped></style>
