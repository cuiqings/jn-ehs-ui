<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'safetyStandardization-performanceMonitoring:add'" @click="handleAdd"
          >新增</a-button
        >
        <a-button
          preIcon="ant-design:delete-outlined"
          v-auth="'safetyStandardization-performanceMonitoring:del'"
          v-if="selectedRowKeys.length > 0"
          @click="batchHandleDelete"
        >
          批量删除</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <AddModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script setup name="safetyStandardization-performanceMonitoring" lang="ts">
  import { ref, onMounted } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { list, del, deleteBatch } from './api';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import AddModal from './addModal.vue';
  import { useModal } from '/@/components/Modal';
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const [registerModal, { openModal }] = useModal();
  const searchFormSchema: FormSchema[] = [
    {
      label: '监测年度',
      field: 'year',
      component: 'DatePicker',
      defaultValue: new Date().getFullYear().toString(),
      componentProps: {
        valueFormat: 'YYYY',
        picker: 'year',
        style: {
          width: '100%',
        },
        getPopupContainer: () => document.body,
      },
      colProps: { span: 6 },
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '所属部门',
      field: 'departCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '所属部门',
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '监测年度',
      align: 'center',
      dataIndex: 'year',
    },
    {
      title: '最后更新',
      align: 'center',
      dataIndex: 'updateTime',
    },
    {
      title: '记录人',
      dataIndex: 'createByName',
    },
  ];
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, operateRequest } = useListPage({
    designScope: 'equipmentManage-ledger-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
          }
        },
      },
      showIndexColumn: true,
      rowSelection: {
        fixed: 'left',
      },
      immediate: false,
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'orgCode',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            departOptions.value = [];
            getForm().setFieldsValue({
              departCode: undefined,
            });
            getForm().updateSchema({
              field: 'departCode',
              componentProps: {
                options: [],
                showSearch: true,
                filterOption: (input: string, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                },
              },
            });
            if (value) {
              initDepart(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
        initDepart(orgOptions.value[0]?.value);
      }
      reload();
    });
  });
  const initDepart = (orgCode) => {
    selectDeptNew({ orgCode }).then((res) => {
      departOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'departCode',
        componentProps: {
          options: departOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
    });
  };
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['safetyStandardization-performanceMonitoring:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['safetyStandardization-performanceMonitoring:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      title: '新增',
      showOkBtn: true,
    });
  };
  const handleView = (data: any) => {
    openModal(true, {
      title: '查看',
      data,
      showOkBtn: false,
    });
  };
  const handleEdit = (data: any) => {
    openModal(true, {
      title: '编辑',
      data,
      showOkBtn: true,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(
      () => deleteBatch({ ids: selectedRowKeys.value.join(',') }),
      {
        confirm: true,
        isBatch: true,
      },
      handleSuccess
    );
  };
  const handleDelete = (data: any) => {
    operateRequest(
      () => del({ id: data.id }),
      {
        confirm: true,
        isBatch: false,
      },
      handleSuccess
    );
  };
</script>
<style lang="less" scoped></style>
