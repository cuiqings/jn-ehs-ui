<template>
  <basic-table @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'meetingBeforeClassManage:add'" @click="handleAdd">新增</a-button>
      <a-button
        preIcon="ant-design:delete-outlined"
        v-auth="'meetingBeforeClassManage:del'"
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
  <manageModal @register="registerModal" @success="handleSuccess" />
</template>
<script setup name="teamManagement-meetingBeforeClassManage" lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref, onMounted, computed } from 'vue';
  import { list, del, batchDel } from './api';
  import { columns, searchFormSchema } from './data';
  import { selectDeptNew, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { useModal } from '/@/components/Modal';
  import manageModal from './manageModal.vue';
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const [registerModal, { openModal }] = useModal();
  const { tableContext, operateRequest } = useListPage({
    designScope: 'meetingBeforeClassManage-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
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
      immediate: false,
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
          params.departCode = userInfo.value.orgCode;
          getForm().setFieldsValue({
            departCode: userInfo.value.orgCode,
          });
        }
        return params;
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 160,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const init = () => {
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
          showSearch: true,
          disabled: orgOptions.value.length === 1,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            getForm().setFieldsValue({
              departCode: undefined,
            });
            getForm().updateSchema({
              field: 'departCode',
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
          orgCode: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0].value);
      }
      handleSuccess();
    });
  };
  onMounted(() => {
    init();
  });
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
          disabled: userInfo.value.orgCode.length > 9 && isSecuritySector !== '1',
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        },
      });
      if (userInfo.value.orgCode.length > 9 && isSecuritySector !== '1') {
        getForm().setFieldsValue({
          departCode: userInfo.value.orgCode,
        });
      }
    });
  };
  const [registerTable, { reload, getForm }, { selectedRowKeys, rowSelection }] = tableContext;
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['meetingBeforeClassManage:edit'],
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        auth: ['meetingBeforeClassManage:del'],
        onClick: handleDel.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      type: 'add',
      title: '新增',
    });
  };
  const handleView = (data) => {
    openModal(true, {
      type: 'view',
      title: '查看',
      data,
    });
  };
  const handleEdit = (data) => {
    openModal(true, {
      type: 'edit',
      title: '修改',
      data,
    });
  };
  // 批量删除
  const batchHandleDelete = () => {
    operateRequest(() => batchDel({ ids: selectedRowKeys.value.join(',') }), {
      confirm: true,
      isBatch: true,
    });
  };
  const handleDel = (data) => {
    operateRequest(() => del({ id: data.id }), {
      confirm: true,
      isBatch: false,
    });
  };
  const handleSuccess = () => {
    reload();
    selectedRowKeys.value = [];
  };
</script>
