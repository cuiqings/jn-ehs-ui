<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'questionPaper:add'" @click="handleAdd"> 新增</a-button>
      <a-button v-if="selectedRowKeys.length > 0" preIcon="ant-design:delete-outlined" v-auth="'questionPaper:delete'" @click="batchHandleDelete">
        批量删除</a-button
      >
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--编辑抽屉-->
  <PaperModal @register="registerModal" @success="reload" />
  <RandomDrawer @register="registerRandomDrawer" @success="reload" />
  <FixedDrawer @register="registerFixedDrawer" @success="reload" />
</template>
<script lang="ts" setup name="edu-exam-paper">
  import { ref, computed } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import PaperModal from './PaperModal.vue';
  import { columns, searchFormSchema } from './paper.data';
  import { list, batchDelete } from './paper.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import RandomDrawer from './RandomDrawer.vue';
  import FixedDrawer from './FixedDrawer.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  const { hasPermission } = usePermission();
  const showFooter = ref(true);
  const [registerModal, { openModal }] = useModal();
  const [registerRandomDrawer, { openDrawer: openRandomDrawer }] = useDrawer();
  const [registerFixedDrawer, { openDrawer: openFixedDrawer }] = useDrawer();
  const orgOptions: any = ref([]);
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      title: '题库列表',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      immediate: false,
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
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => hasPermission('questionPaper:edit'),
      },
      {
        label: '组卷',
        onClick: handleCreatePaper.bind(null, record),
        ifShow: () => hasPermission('questionPaper:compose'),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        ifShow: () => hasPermission('questionPaper:delete'),
      },
    ];
  }
  // 组卷
  function handleCreatePaper(record) {
    // 试卷类型(1固定试卷2.随机试卷)
    if (record.paperType == '1') {
      openFixedDrawer(true, record);
    }
    if (record.paperType == '2') {
      openRandomDrawer(true, record);
    }
  }
</script>
