<template>
  <div class="p-2">
    <basic-table @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="onAdd" v-auth="'WorkRequisition:add'">作业申请</a-button>
        <!-- <a-button preIcon="ant-design:delete-outlined" v-if="selectedRowKeys.length > 0" @click="batchDel"> 批量删除 </a-button> -->
      </template>
      <template #id="{ index }"> {{ index + 1 }}</template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
  </div>
</template>

<script setup lang="ts">
  import { Modal, message } from 'ant-design-vue';
  import type { ColumnType } from 'ant-design-vue/lib/list';
  import type { ColumnGroupType } from 'ant-design-vue/lib/table';
  import { h, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { deleteManage, deleteWork, getWorkApplyList, contractorList } from '../api';
  import { BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useUserStore } from '/@/store/modules/user';
  import { getOrgToWork34, userListByOrg } from '/@/api/common/api';

  const route = useRoute();
  const emit = defineEmits(['viewEdit', 'applyFor', 'viewCopy', 'changePersonClick']);
  const userStore = useUserStore();
  const option = ref<any[]>([]);
  console.log('route', route);
  const { name: routeName } = route;

  //@ts-ignore
  const columns: (ColumnGroupType<any> | ColumnType<any>)[] = [
    {
      title: '审批状态',
      dataIndex: 'stateName',
      customRender: ({ record }) => {
        return record.state == '3' ? h('span', { style: { color: 'red' } }, record.stateName) : record.stateName;
      },
    },
    {
      title: '作业类型',
      dataIndex: 'workTypeName',
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
    },
    {
      title: '作业等级',
      dataIndex: 'highWorkLevel'
    },
    {
      title: '编号',
      dataIndex: 'workApplyCode',
    },
    {
      title: '申请单位',
      dataIndex: 'applicationUnitName',
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
    },
    {
      title: '申请时间',
      dataIndex: 'applicationTimeStr',
    },
  ];
  if (routeName === 'UnhazardousWork-WorkRequisition') {
    columns.splice(3, 1);
  }
  //@ts-ignore
  const searchFormSchema: FormSchema[] = [
    {
      label: '审批状态',
      field: 'state',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '待提交', value: '1' },
          { label: '审批中', value: '2' },
          { label: '审批退回', value: '3' },
          { label: '审批通过', value: '0' },
        ],
        mode: 'multiple',
        class: 'work-apply-select',
      },
      colProps: {
        span: 5,
      },
    },
    {
      label: '作业内容',
      field: 'workContent',
      component: 'Input',
      componentProps: {
        placeholder: '请输入关键字',
      },
      colProps: { span: 5 },
    },
    {
      label: '作业类型',
      field: 'workType',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        mode: 'multiple',
        class: 'work-apply-select',
        options: userStore.getAllDictItems.work_type,
      },
      show: routeName !== 'UnhazardousWork-WorkRequisition',
      colProps: { span: 5 },
    },
    {
      label: '编号',
      field: 'workApplyCode',
      component: 'Input',
      componentProps: {
        placeholder: '请输入关键字',
      },
      colProps: { span: 5 },
    },
    {
      label: '申请单位',
      field: 'applicationUnit',
      component: 'TreeSelect',
      componentProps: {
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        fieldNames: { label: 'name', value: 'code', children: 'children' },
        onChange: (val) => {
          getUser(val);
        },
      },
      colProps: { span: 5 },
    },
    {
      label: '申请人',
      field: 'applicant',
      component: 'Select',
      componentProps: {
        placeholder: '请输入关键字',
        fieldNames: { label: 'title', value: 'id' },
        showSearch: true,
        filterOption: (input, option) => option.realname.includes(input) || option.id.includes(input),
      },
      colProps: { span: 5 },
    },
    {
      label: '申请时间',
      field: 'start',
      component: 'RangePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        placeholder: ['开始日期', '结束日期'],
        style: {
          width: '100%',
        },
      },
      colProps: { span: 5 },
    },
  ];

  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: view.bind(null, record),
      },
      {
        label: '复用',
        color: '#1890ff',
        auth: ['WorkRequisition:add'],
        onClick: copy.bind(null, record),
      },
      {
        label: '编辑',
        ifShow: (record.state == '1' || record.state == '3') && userStore.getUserInfo.username == record.createBy ? true : false,
        auth: ['WorkRequisition:edit'],
        onClick: edit.bind(null, record),
      },
      {
        label: '添加人员',
        ifShow: (record.state == '2' || record.state == '0') && record.sceneHead && record.sceneHead.includes(userStore.getUserInfo.id) ? true : false,
        auth: ['WorkRequisition:updateGuardian'],
        onClick: changePersonClick.bind(null, record),
      },
      {
        label: '删除',
        color: 'error',
        ifShow:
          userStore.getUserInfo.username == record.createBy ||
          userStore.getUserInfo.username == 'admin' ||
          userStore.getUserInfo.orgCode == 'A04B01C11'
            ? true
            : false,
        auth: ['WorkRequisition:del'],
        onClick: del.bind(null, record),
      },
    ];
  };
  // 新增表格数据
  const onAdd = () => {
    emit('applyFor');
  };
  // 删除表格数据
  const del = (value: any) => {
    Modal.confirm({
      title: '删除',
      content: '确认删除吗？',
      onOk: () => {
        deleteManage({ id: value.id }).then((_res) => {
          reload();
        });
      },
      onCancel: () => {},
    });
  };
  // 批量删除
  const batchDel = () => {
    const arr = selectedRows.value.filter((value) => value.state == '0' || value.state == '2') || [];
    if (arr.length !== 0) {
      message.error('审批中/审批通过的数据不允许删除！');
    } else {
      const id = selectedRows.value.map((value) => {
        return value.id;
      });
      Modal.confirm({
        title: '删除',
        content: `是否确认删除已选中的 ${id.length} 项？`,
        onOk: async () => {
          const res = await deleteWork({ ids: id.join(',') });
          if (res) {
            // message.success('删除成功！');
            reload();
          } else {
            message.error('删除失败！');
          }
        },
        onCancel() {},
      });
    }
  };
  // 编辑表格数据
  const edit = (value: any) => {
    emit('viewEdit', { workApplyId: value.id, readonly: false, workTypeName: value.workTypeName });
  };
  // 复制表格数据
  const copy = (value: any) => {
    emit('viewCopy', { workApplyId: value.id, readonly: false, workTypeName: value.workTypeName });
  };
  // 查看表格数据
  const view = (value: any) => {
    emit('viewEdit', { workApplyId: value.id, readonly: true, workTypeName: value.workTypeName });
  };
  const changePersonClick = (value: any) => {
    emit('changePersonClick', value);
  };
  const { tableContext } = useListPage({
    designScope: 'WorkRequisition-list',
    tableProps: {
      immediate: false,
      api: getWorkApplyList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: () => {
          init();
        },
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      beforeFetch: (params) => {
        if (params.start) {
          const time = params.start.split(',');
          params['startTime'] = time[0] + ' 00:00:00';
          params['endTime'] = time[1] + ' 23:59:59';
          delete params['start'];
        }
        params['type'] = routeName !== 'UnhazardousWork-WorkRequisition' ? 1 : 2;
        return params;
      },
      handleSearchInfoFn: (params) => {
        if (option.value.length === 1) {
          params.applicationUnit = option.value[0].orgCode;
          getForm().setFieldsValue({
            applicationUnit: option.value[0].orgCode,
          });
        }
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 230,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const init = async () => {
    let res = await getOrgToWork34();
    const orgCode = await defaultCompany();
    getForm().updateSchema({
      field: 'applicationUnit',
      componentProps: {
        treeData: res,
        placeholder: '请选择',
        allowClear: res.length == 1 && res[0].children && res[0].children.length > 0 ? true : false,
        onchange: (val) => {
          getUser(val);
        },
      },
    });
    if (res && res.length == 1) {
      getForm().setFieldsValue({
        applicationUnit: res[0].code,
      });
      getUser(res[0].code);
    }
    if (orgCode) {
      getForm().setFieldsValue({
        applicationUnit: orgCode,
      });
      getUser(orgCode);
    }
    if (routeName === 'UnhazardousWork-WorkRequisition') {
      getForm().setFieldsValue({
        workType: ['8'],
      });
    }
    reload();
  };
  init();
  async function defaultCompany() {
    const res = await contractorList();
    let code = '';
    res.map((item) => {
      if (item.user && item.user.includes(userStore.getUserInfo.id)) {
        code = item.orgCode;
      }
    });
    return code;
  }
  async function getUser(code) {
    getForm().setFieldsValue({
      applicant: undefined,
    });
    let res = await userListByOrg({ orgCode: code, pageSize: 100000 });
    res.records.map((item) => {
      item.title = item.realname + '-' + item.workNo + '-' + item.org3Name;
    });
    getForm().updateSchema({
      field: 'applicant',
      componentProps: {
        options: res.records,
      },
    });
  }
  const [registerTable, { reload, getForm, getDataSource }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

  defineExpose({
    reload,
    batchDel,
  });
</script>

<style lang="less">
  .work-apply-select .ant-select-selection-overflow {
    flex-wrap: nowrap !important;
    overflow: auto !important;
  }
</style>
