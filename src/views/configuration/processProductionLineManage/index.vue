<template>
  <basic-table @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" v-auth="'processProductionLineManage:add'" preIcon="ant-design:plus-outlined" @click="handleAdd"> 新增工序</a-button>
      <a-button type="primary" preIcon="ic:round-expand" @click="expandAll">展开全部</a-button>
      <a-button type="primary" preIcon="ic:round-compress" @click="collapseAll">折叠全部</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getActions(record)" />
    </template>
  </basic-table>
  <process-production-line-drawer @register="registerDrawer" @success="handleSuccess" />
</template>
<script setup name="processProductionLineManage" lang="ts">
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { BasicTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import processProductionLineDrawer from './drawer.vue';
  import { ref, createVNode } from 'vue';
  import { list, getOrganizationNew, del } from './url/index';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '所属机构',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        options: [],
      },
      colProps: { span: 6 },
    },
    {
      label: '工序/子工序/产线名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]> [
    {
      title: '工序/子工序/产线名称',
      align: 'left',
      dataIndex: 'name',
    },
    {
      title: '所属机构',
      align: 'center',
      dataIndex: 'orgName',
    },
    {
      title: '描述',
      align: 'center',
      dataIndex: 'description',
    },
    {
      title: '排序',
      align: 'center',
      dataIndex: 'sortNum',
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      title: '工序列表',
      api: list,
      columns: columns,
      immediate: false,
      size: 'large',
      pagination: false,
      isTreeTable: true,
      striped: true,
      useSearchForm: true,
      showTableSetting: true,
      bordered: true,
      showIndexColumn: false,
      tableSetting: { fullScreen: true },
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 140,
      },
      handleSearchInfoFn: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 250,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  //注册table数据
  const [registerTable, { reload, expandAll, collapseAll, getForm }] = tableContext;
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['processProductionLineManage:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['processProductionLineManage:del'],
        onClick: handleDelete.bind(null, record),
      },
      {
        label: '添加子工序',
        onClick: handleAdd.bind(null, record),
        ifShow: record.type === '工序',
      },
      {
        label: '添加产线',
        onClick: handleAdd.bind(null, record),
        ifShow: record.type === '子工序',
      },
    ];
  };
  const init = () => {
    getOrganizationNew().then((res) => {
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
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
      reload();
    });
  };
  init();
  const handleAdd = (data) => {
    openDrawer(true, {
      type: 'add',
      title: data.type === '工序' ? '新增子工序' : data.type === '子工序' ? '新增产线' : '新增工序',
      processType: data.type !== 'click' ? data.type : null,
      showOkBtn: true,
      showFooter: true,
      data: data.type !== 'click' ? data : null,
    });
  };
  const handleEdit = (data) => {
    openDrawer(true, {
      type: 'edit',
      title: data.type === '子工序' ? '编辑子工序' : data.type === '子工序' ? '编辑产线' : '编辑工序',
      showOkBtn: true,
      showFooter: true,
      processType: data.type,
      data,
    });
  };
  const handleDelete = (data) => {
    let delText = '';
    switch (data.type) {
      case '工序':
        delText = '删除后对应的子工序及产线将同步删除，是否删除该项？';
        break;
      case '子工序':
        delText = '删除后对应的产线将同步删除，是否删除该项？';
        break;
      default:
        delText = '是否删除该项？';
        break;
    }
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: delText,
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: data.id })
            .then((res) => {
              if (res) {
                reload();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };
  const handleSuccess = () => {
    reload();
  };
</script>
<style lang="less" scoped></style>
