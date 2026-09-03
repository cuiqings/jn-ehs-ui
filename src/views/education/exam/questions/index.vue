<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'questionBank:add'" @click="handleAdd"> 新增</a-button>
      <a-button v-if="selectedRowKeys.length > 0" preIcon="ant-design:delete-outlined" v-auth="'questionBank:delete'" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #name="{ record }">
      <a-tooltip placement="topLeft" :title="record.name" arrow-point-at-center>
        <a class="bank-name" @click="goDetailPage(record)">{{ record.name }}</a>
      </a-tooltip>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--编辑抽屉-->
  <QuestionsModal @register="registerModal" @success="reload" />
  <DetailTableDrawer @register="detailTableDrawer" @success="reload" />
</template>
<script lang="ts" setup name="edu-exam-questions">
  import { ref, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import QuestionsModal from './QuestionsModal.vue';
  import { columns, searchFormSchema } from './questions.data';
  import { list, batchDelete } from './questions.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import DetailTableDrawer from './DetailTableDrawer.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  const { hasPermission } = usePermission();
  const showFooter = ref(true);
  const [registerModal, { openModal }] = useModal();
  const [detailTableDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const isSecuritySector = loginInfo.value.departs[0]?.isSecuritySector;
  const orgOptions = ref<any[]>([]);
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onImportXls, onExportXls } = useListPage({
    tableProps: {
      title: '题库列表',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if (orgOptions.value.length === 1) {
          params.orgCode = orgOptions.value[0].value;
          getForm().setFieldsValue({
            orgCode: orgOptions.value[0].value,
          });
        }
        return params;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 120,
      },
      //自定义默认排序
      defSort: {
        column: 'id',
        order: 'desc',
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
  const init = async () => {
    await getDepart3ListWithSecurity().then((res) => {
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
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
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
  /**
   * 新增
   */
  function handleAdd() {
    showFooter.value = true;
    openModal(true, {
      isUpdate: false,
    });
  }
  /**
   * 编辑
   */
  function handleEdit(record) {
    showFooter.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }
  /**
   * 详情
   */
  function handleDetail(record) {}
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await batchDelete({ ids: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value.join(',') }, reload);
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '创建试题',
        auth: ['questionBank:create'],
        onClick: goDetailPage.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => hasPermission('questionBank:edit'),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        ifShow: () => hasPermission('questionBank:delete'),
      },
    ];
  }
  // 跳转详情页面
  function goDetailPage(record) {
    console.log('record', record);
    openDetailDrawer(true, record);
  }
</script>
<style lang="less" scoped>
  .bank-name {
    color: #1890ff;
    cursor: pointer;
    // 超过一行显示省略号
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
</style>
