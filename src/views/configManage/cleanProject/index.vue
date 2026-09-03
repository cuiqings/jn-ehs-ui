<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'cleanProject:add'">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <ProjectModal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="system-notice" setup>
  // import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import ProjectModal from './ProjectModal.vue';
  // import DetailModal from './DetailModal.vue';
  import { columns, searchFormSchema } from './plan.data';
  import { getList, deleteRecord } from './plan.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { defHttp } from '/@/utils/http/axios';
  import { ref } from 'vue';
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  // const queryParam = ref({});
  let searchInfo = {};
  const orgOptions: any = ref([]);
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'project-template',
    tableProps: {
      title: '清理项目列表',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
      handleSearchInfoFn(params) {
        if (orgOptions.value.length === 1) {
          params.organizationCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            organizationCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const init = () => {
    defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
      res.map((item: any) => {
        orgOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
      getForm().updateSchema({
        field: 'organizationCode',
        componentProps: {
          options: orgOptions,
          placeholder: '请选择',
          disabled: orgOptions.value.length === 1,
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
  init();

  const [registerTable, { reload, getForm }] = tableContext;

  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }

  /**
   * 删除事件
   */
  function handleDelete(record) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        deleteRecord({ id: record.id }, reload);
      },
      onCancel() {},
    });
  }

  /**
   * 查看
   */
  function handleDetail(record) {
    openModal(true, {
      isUpdate: true,
      showFooter: false,
      record: record,
    });
  }
  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'cleanProject:edit',
        // ifShow: record.sendStatus == 0,
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'cleanProject:del',
        // popConfirm: {
        //   title: '是否确认删除',
        //   confirm: handleDelete.bind(null, record),
        // },
      },
    ];
  }
</script>
