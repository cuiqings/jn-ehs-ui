<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button preIcon="ant-design:plus-outlined" v-auth="'lnspectionReminder:add'" type="primary" @click="handleAdd"> 新增 </a-button>
      <a-button preIcon="ant-design:delete-outlined" v-auth="'lnspectionReminder:del'" v-if="selectedRowKeys.length > 0" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #remindType="{ record }">
      <a-tag :color="getReminderTypeColor(record.remindType)">
        {{ record.remindType === '1' ? '消防器材' : '绝缘工具' }}
      </a-tag>
    </template>
    <template #ifRemindPrincipal="{ record }">
      <a-tag :color="record.ifRemindPrincipal === '1' ? 'green' : 'red'">
        {{ record.ifRemindPrincipal === '1' ? '是' : '否' }}
      </a-tag>
    </template>
    <template #remindTime="{ record }">
      {{ remindTimeMap(record.remindTime) }}
    </template>
    <template #action="{ record }">
      <TableAction :actions="getActions(record)" />
    </template>
  </BasicTable>
  <!-- 新增/编辑弹框 -->
  <ReminderModal @register="registerModal" @success="handleSuccess" />
</template>

<script setup name="socialFacilitiesManage-lnspectionReminder" lang="ts">
  import { ref } from 'vue';
  import { BasicTable, TableAction, BasicColumn, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import ReminderModal from './ReminderModal.vue';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { list, del, batchDel } from './api';
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  // 表格列配置
  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
    },
    {
      title: '所属车间',
      dataIndex: 'departName',
    },
    {
      title: '提醒类型',
      dataIndex: 'remindType',
      width: 150,
      slots: { customRender: 'remindType' },
    },
    {
      title: '提醒人',
      dataIndex: 'remindPersonName',
    },
    {
      title: '是否通知责任人',
      dataIndex: 'ifRemindPrincipal',
      width: 150,
      slots: { customRender: 'ifRemindPrincipal' },
    },
    {
      title: '提醒时间',
      dataIndex: 'remindTime',
      slots: { customRender: 'remindTime' },
      width: 180,
    },
  ];

  // 搜索表单配置
  const searchFormSchema: FormSchema[] = [
    {
      field: 'org',
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
      label: '所属车间',
      field: 'depart',
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
      field: 'remindType',
      label: '提醒类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择提醒类型',
        options: [
          { label: '消防器材', value: '1' },
          { label: '绝缘工具', value: '2' },
        ],
      },
      colProps: { span: 6 },
    },
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '编辑',
        auth: ['lnspectionReminder:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '删除',
        auth: ['lnspectionReminder:del'],
        onClick: handleDelete.bind(null, record),
      },
    ];
  };
  // 弹框
  const [registerModal, { openModal }] = useModal();
  const { tableContext, operateRequest } = useListPage({
    tableProps: {
      api: list,
      columns,
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 120,
        resetFunc: () => {
          if (orgOptions.value.length !== 1) {
            getForm().updateSchema({
              field: 'depart',
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
      indexColumnProps: {
        fixed: 'left',
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.org = orgOptions.value[0].value;
          getForm().setFieldsValue({
            org: orgOptions.value[0].value,
          });
        }
        return params;
      },
      actionColumn: {
        width: 200,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, getForm }, { selectedRowKeys, rowSelection }] = tableContext;
  const init = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'org',
        componentProps: {
          options: orgOptions.value,
          disabled: orgOptions.value.length === 1,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              depart: undefined,
            });
            getForm().updateSchema({
              field: 'depart',
              componentProps: {
                options: [],
              },
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
      if (orgOptions.value.length === 1) {
        getForm().setFieldsValue({
          org: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
      reload();
    });
  };
  init();
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
        field: 'depart',
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

  // 获取提醒类型颜色
  const getReminderTypeColor = (type: string) => {
    const colorMap = {
      '1': 'red',
      '2': 'orange',
    };
    return colorMap[type] || 'blue';
  };

  // 新增
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  // 编辑
  function handleEdit(record: any) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  // 查看
  function handleView(record: any) {
    openModal(true, {
      record,
      isUpdate: false,
      isView: true,
    });
  }

  // 删除
  function handleDelete(data: any) {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  }
  const batchHandleDelete = () => {
    operateRequest(() => batchDel({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const remindTimeMap = (remindTime: string) => {
    switch (remindTime) {
      case '1':
        return '到期前3天';
      case '2':
        return '到期前5天';
      case '3':
        return '到期前7天';
      case '4':
        return '到期前10天';
      case '5':
        return '到期前15天';
      case '6':
        return '到期前30天';
    }
  };
  // 操作成功回调
  function handleSuccess() {
    reload();
    selectedRowKeys.value = [];
  }
</script>

<style scoped lang="less"></style>
