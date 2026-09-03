<template>
  <BasicDrawer @register="registerBaseDrawer" title="角色用户" width="1100" destroyOnClose>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" @click="handleSelect"> 已有用户</a-button>
        <a-button v-if="selectedRowKeys.length > 0" type="primary" @click="batchHandleDelete"> 取消关联</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
        <a-button type="primary" @click="download"> 下载导入模版 </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!--用户选择弹窗-->
    <UseSelectModal @register="registerModal" @select="selectOk" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import UseSelectModal from './UseSelectModal.vue';
  import { userList, deleteUserRole, batchDeleteUserRole, addUserRole } from '../role.api';
  import { userColumns, searchRoleFormSchema } from '../role.data';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { selectDeptNew, getDepart3List } from '/@/api/common/api';
  import { useMethods } from '/@/hooks/system/useMethods';
  const roleId = ref('');
  const roleName = ref('');
  const params: any = ref({});
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const [registerBaseDrawer] = useDrawerInner(async (data) => {
    roleId.value = data.id;
    roleName.value = data.roleName;
    params.value.roleId = data.id;
    setProps({ searchInfo: { roleId: data.id } });
    init();
    reload();
  });
  const init = () => {
    getDepart3List().then((res) => {
      orgOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      getForm().updateSchema({
        field: 'threeOrgCode',
        componentProps: {
          options: orgOptions.value,
          onChange: (value) => {
            getForm().updateSchema({
              field: 'fourOrgCode',
              componentProps: {
                options: [],
              },
            });
            getForm().setFieldsValue({
              fourOrgCode: undefined,
            });
            if (value) {
              getDepartList(value);
            }
          },
        },
      });
    });
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
        field: 'fourOrgCode',
        componentProps: {
          options: departOptions.value,
        },
      });
    });
  };
  //注册drawer
  const [registerModal, { openModal }] = useModal();
  const { tableContext, onImportXls, onExportXls } = useListPage({
    designScope: 'role-list',
    tableProps: {
      api: userList,
      columns: userColumns,
      formConfig: {
        schemas: searchRoleFormSchema,
        autoAdvancedCol: 2,
        resetFunc: () => {
          departOptions.value = [];
          getForm().updateSchema({
            field: 'fourOrgCode',
            componentProps: {
              options: departOptions.value,
            },
          });
        },
      },
      immediate: false,
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      url: '/sys/role/exportUser',
      name: () => {
        return `${roleName.value}角色-用户列表`;
      },
      params: params.value,
      suffix: 'xlsx',
    },
    importConfig: {
      url: '/sys/role/importUser',
      data: () => {
        return {
          roleId: roleId.value,
        };
      },
    },
  });
  const [registerTable, { reload, setProps, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteUserRole({ userId: record.id, roleId: roleId.value }, () => {
      reload();
      selectedRowKeys.value = [];
    });
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    batchDeleteUserRole({ userIds: selectedRowKeys.value.join(','), roleId: roleId.value }, () => {
      reload();
      selectedRowKeys.value = [];
    });
  }
  /**
   * 选择已有用户
   */
  function handleSelect() {
    openModal(true, {
      is: true,
    });
  }
  /**
   * 添加已有用户
   */
  async function selectOk(val) {
    await addUserRole({ roleId: roleId.value, userIdList: val }, () => {
      reload();
      selectedRowKeys.value = [];
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '取消关联',
        popConfirm: {
          title: '是否确认取消关联',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
  const download = () => {
    const { handleExportXls } = useMethods();
    handleExportXls('角色用户导入模版', '/sys/role/downloadImportTemplate');
  };
</script>
