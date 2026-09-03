<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd" v-auth="'pollution:add'">新增</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <Modal @register="registerModal" @success="reload" />
    <StatusModal @register="registerStatus" @success="statusReload" />
    <BasicModal v-bind="$attrs" @register="registerChange" title="审核" width="1112px" :showOkBtn="false">
      <div class="apc-topo">
        <topo-preview v-if="curRecord.pageContentOne" ref="topoPagePreview" :showApv="false" />
        <span v-else class="nodata">未配置</span>
      </div>
      <div class="apc-main">
        <a-button type="primary" size="large" danger @click="handleNopass"> 审核退回 </a-button>
        <a-button type="primary" size="large" @click="handlePass">审核通过</a-button>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="pollutantNodes-pollPage" setup>
  import { ref, nextTick } from 'vue';
  import TopoPreview from '/@/components/AntdvTopo/preview.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal, BasicModal } from '/@/components/Modal';
  import Modal from './Modal.vue';
  import StatusModal from './StatusModal.vue';
  // import DetailModal from './DetailModal.vue';
  import { columns, searchFormSchema } from './data';
  import { getList, deleteRecord, postCheck } from './api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerStatus, { openModal: openStatusModal }] = useModal();
  const [registerChange, { closeModal, openModal: openChangeModal }] = useModal();
  import { useRouter } from 'vue-router';
  const router = useRouter();

  // const queryParam = ref({});
  let searchInfo = {};
  const curRecord: any = ref({});
  const topoPagePreview = ref();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'project-template',
    tableProps: {
      title: '排污节点配置',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      handleSearchInfoFn(info) {
        console.log('handleSearchInfoFn', info);
        searchInfo = Object.assign({}, info);
        console.log('handleSearchInfoFn param', searchInfo);
        return searchInfo;
      },
      showIndexColumn: true,
      actionColumn: {
        width: 310,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

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
  function handleSet(record) {
    router.push({
      path: '/screenSet/pageSet',
      query: {
        type: 'poll',
        id: record.id,
        name: record.process,
      },
    });
  }
  // 提交审核
  function handleSubmit(record) {
    createConfirm({
      iconType: 'warning',
      title: '提交审核',
      content: '确定要提交审核吗？',
      onOk: () => {
        postCheck({
          id: record.id,
          operateType: '1',
        }).then(() => {
          reload();
        });
      },
      onCancel() {},
    });
  }
  function handleAprove(record) {
    curRecord.value = record;
    openChangeModal(true, {});
    nextTick(() => {
      topoPagePreview.value.initGraph(JSON.parse(record.pageContentOne));
    });
  }
  // 审核通过
  function handlePass() {
    postCheck({
      id: curRecord.value.id,
      operateType: '3',
    }).then(() => {
      closeModal();
      reload();
    });
  }
  // 审核退回
  function handleNopass() {
    openStatusModal(true, {
      record: curRecord.value,
      type: '1',
    });
  }
  // 审核退回意见 确认
  function statusReload(val) {
    postCheck({
      checkInfo: val.checkInfo,
      id: curRecord.value.id,
      operateType: '2',
    }).then(() => {
      closeModal();
      reload();
    });
  }
  // 撤销发布
  function handleReset(record) {
    createConfirm({
      iconType: 'warning',
      title: '撤销发布',
      content: '确定要撤销发布吗？',
      onOk: () => {
        postCheck({
          id: record.id,
          operateType: '0',
        }).then(() => {
          reload();
        });
      },
      onCancel() {},
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
        ifShow: record.status != '3',
        auth: 'pollution:edit',
        // ifShow: record.status == 0,
      },
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
        auth: 'pollution:edit',
        // ifShow: record.status !== '3'
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
        auth: 'pollution:delete',
        ifShow: record.status != '3',
        // popConfirm: {
        //   title: '是否确认删除',
        //   confirm: handleDelete.bind(null, record),
        // },
      },
      {
        label: '页面配置',
        onClick: handleSet.bind(null, record),
        auth: 'pollution:config',
        ifShow: record.status != '3',
      },
      {
        label: '提交审核',
        onClick: handleSubmit.bind(null, record),
        ifShow: record.status == '0' || record.status == '2',
        auth: 'pollution:submit:check',
      },
      {
        label: '审核',
        onClick: handleAprove.bind(null, record),
        ifShow: record.status == '1',
        auth: 'pollution:check',
      },
      {
        label: '撤销发布',
        onClick: handleReset.bind(null, record),
        auth: 'pollution:cancel',
        ifShow: record.status == '3',
      },
    ];
  }
</script>

<style scoped lang="less">
  .apc-topo {
    width: 100%;
    min-height: 400px;
    line-height: 400px;
    background-color: #eee;
    text-align: center;
    .nodata {
      color: #999;
    }
  }
  .apc-main {
    text-align: center;
    display: flex;
    justify-content: space-around;
    padding: 20px 200px 0px;
  }
</style>
