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
    <Modal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="system-notice" setup>
// import { ref } from 'vue';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import Modal from './Modal.vue';
// import DetailModal from './DetailModal.vue';
import { columns, searchFormSchema } from './data';
import { getList, deleteRecord} from './api';
import { useListPage } from '/@/hooks/system/useListPage';
import { useMessage } from '/@/hooks/web/useMessage';
import { getOrgCodeList } from '/@/api/common/api';
const { createConfirm } = useMessage();
const [registerModal, { openModal }] = useModal();
import { useRouter } from 'vue-router';
const router = useRouter();
// const queryParam = ref({});
let searchInfo = {};
async function getOrgList() {
  getOrgCodeList().then( async (res) => {
    const orgOptions = res.map((item:any) => {
      return {
        label: item.departName,
        value: item.orgCode
      }
    })
    const searchForm = await getForm();
    searchForm.updateSchema({
      field: 'orgCode',
      componentProps: {
        options: orgOptions,
        placeholder: '请选择',
      }
    })
    reload()
 })
}
getOrgList()
// 列表页面公共参数、方法
const { tableContext } = useListPage({
  designScope: 'project-template',
  tableProps: {
    title: '大屏页面配置',
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
      width: 240,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  }
});

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
function handleSet(record) {
  router.push({ path: '/technical/screenSet/pageSet', query: {
    id:record.id,
    pageName:record.pageName,
    deviceId:record.deviceId,
  }})
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
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      onClick: handleDelete.bind(null, record),
      ifShow: record.configStatus != '1',
    },
    {
      label: '页面配置',
      onClick: handleSet.bind(null, record),
    },
  ];
}


</script>