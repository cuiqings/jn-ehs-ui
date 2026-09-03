<template>
  <div>
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <j-upload-button preIcon="ant-design:import-outlined" type="primary" v-auth="'equipmentManage-configuration:import'" @click="onImportXls">
          导入</j-upload-button
        >
        <a-button type="primary" preIcon="ant-design:export-outlined" v-auth="'equipmentManage-configuration:export'" @click="onExportXls">
          导出</a-button
        >
        <a-button preIcon="ant-design:download-outlined" type="primary" v-auth="'equipmentManage-configuration:download'" @click="onDownload">
          导入模版下载</a-button
        >
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
  <equipment-manage-configuration-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="equipmentManage-configuration" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import equipmentManageConfigurationDrawer from './drawer.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicColumn, FormSchema } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { list } from './api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { onMounted, h, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgName = ref('');
  const searchFormSchema: FormSchema[] = [
    {
      field: 'orgCode',
      label: '所属单位',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        allowClear: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      field: 'departCode',
      label: '所属车间',
      component: 'Select',
      componentProps: {
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      colProps: { span: 6 },
    },
    {
      label: '岗位',
      field: 'postName',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '姓名',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '完成',
            value: '1',
          },
          {
            label: '未完成',
            value: '0',
          },
        ],
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
      title: '所属车间',
      align: 'center',
      dataIndex: 'departName',
    },
    {
      title: '岗位',
      width: 200,
      align: 'center',
      dataIndex: 'postName',
    },
    {
      title: '姓名',
      width: 200,
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '工号',
      width: 200,
      align: 'center',
      dataIndex: 'workNo',
    },
    {
      title: '状态',
      width: 120,
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return text === '1' ? h('span', { style: { color: '#52c41a' } }, '完成') : h('span', { style: { color: '#f5222d' } }, '未完成');
      },
    },
  ];
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const handleSuccess = () => {
    (selectedRowKeys.value = []) && reload();
  };
  // 列表页面公共参数、方法
  const { tableContext, onImportXls, onExportXls } = useListPage({
    designScope: 'equipmentManage-configuration-list',
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
      immediate: false,
      rowKey: 'workNo',
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          orgName.value = orgOptions.value[0].label;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    importConfig: {
      url: '/lb/lbDistributeConfig/importExcel',
      success: handleSuccess,
    },
    exportConfig: {
      name: '劳保发放配置-' + dateFormat(new Date(), 'yyyy-MM-dd'),
      url: '/lb/lbDistributeConfig/exportXls',
      suffix: 'xlsx',
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
      init();
    });
  });
  const init = () => {
    getForm().updateSchema({
      field: 'orgCode',
      componentProps: {
        options: orgOptions.value,
        disabled: orgOptions.value.length === 1,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        onChange: (value, option) => {
          getForm().setFieldsValue({
            departCode: undefined,
          });
          getForm().updateSchema({
            field: 'departCode',
            componentProps: {
              options: [],
            },
          });
          orgName.value = '';
          if (value) {
            getDepartList(value);
            orgName.value = option.label;
          }
        },
      },
    });
    if (orgOptions.value.length === 1) {
      getForm().setFieldsValue({
        orgCode: orgOptions.value[0]?.value,
      });
      orgName.value = orgOptions.value[0].label;
      getDepartList(orgOptions.value[0].value);
    }
    reload();
  };
  // 车间
  const getDepartList = (orgCode) => {
    selectDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
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
        label: '配置',
        auth: ['equipmentManage-configuration:config'],
        ifShow: () => record.orgName && record.postName,
        onClick: handleConfig.bind(null, record),
      },
      {
        label: '查看',
        ifShow: () => record.orgName && record.postName,
        onClick: handleView.bind(null, record),
      },
    ];
  };
  const handleConfig = (data: any) => {
    openDrawer(true, {
      type: 'config',
      title: '配置',
      showOkBtn: true,
      showFooter: true,
      data,
    });
  };
  const handleView = (data: any) => {
    openDrawer(true, {
      type: 'view',
      title: '查看',
      showOkBtn: false,
      showFooter: true,
      data,
    });
  };
  const onDownload = () => {
    const { handleExportXlsx } = useMethods();
    const form = getForm().getFieldsValue();
    if (form.orgCode && form.orgCode !== '') {
      handleExportXlsx(`劳保发放配置(${orgName.value})-模板`, '/lb/lbDistributeConfig/downloadImportTemplate', {
        orgCode: form.orgCode,
      });
    } else {
      return createMessage.info('请先选择所属单位！');
    }
  };
</script>
<style lang="less" scoped></style>
