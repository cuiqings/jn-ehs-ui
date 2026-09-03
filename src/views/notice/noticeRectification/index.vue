<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable">
      <!-- 整改期限回显样式 -->
      <template #endDt="{ record }">
        <div v-if="dateCompare(record.endDt) < 0 && record.status!='5'"><div class="status-point" style=" background-color:#d9001b"/><label style="color:#d9001b">{{ record.endDt }}</label></div>
        <div v-else-if="dateCompare(record.endDt) <= 3 && record.status!='5' "><div class="status-point" style=" background-color:#f59a23"/><label style="color:#f59a23">{{ record.endDt }}</label></div>
        <div v-else><div class="status-point"/><label>{{ record.endDt }}</label></div>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #viewModal="{ record }">
        <TableAction :actions="getViewModal(record)"/>
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <template #fileSlot="{text}">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined"
                  size="small" @click="downloadFile(text)">下载
        </a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <EhsNoticeInfoModal @register="registerModal" @success="reload" :showFooter="showFooter"></EhsNoticeInfoModal>
    <EhsNoticeInfoDetail @register="registerDesc" @success="reload" :showFooter="showFooter"></EhsNoticeInfoDetail>
    <EhsNoticeInfoExtension @register="registerExtension" @success="reload" :showFooter="showFooter"></EhsNoticeInfoExtension>
    <EhsNoticeInfoExtensionAgree @register="registerExtensionAgree" @success="reload" :showFooter="showFooter"></EhsNoticeInfoExtensionAgree>
    <EhsNoticeInfoPreview @register="registerEhsNoticeInfoPreview" @success="reload" :showFooter="showFooter"></EhsNoticeInfoPreview>
  </div>
</template>


<script lang="ts" name="notice-ehsNoticeInfo" setup>
import {ref, computed, unref} from 'vue';
import {BasicTable, useTable, TableAction} from '/@/components/Table';
import {useDrawer} from '/src/views/notice/components/Drawer';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import EhsNoticeInfoModal from './components/EhsNoticeInfoModal.vue'
import EhsNoticeInfoDetail from './components/EhsNoticeInfoDetail.vue'
import EhsNoticeInfoExtension from './components/EhsNoticeInfoExtension.vue'
import EhsNoticeInfoExtensionAgree from './components/EhsNoticeInfoExtensionAgree.vue'
import EhsNoticeInfoPreview from './components/EhsNoticeInfoPreview.vue'
import {columns, searchFormSchema} from './EhsNoticeInfo.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl} from './EhsNoticeInfo.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import dayjs from 'dayjs';
import {useUserStore} from "/@/store/modules/user";
import {usePermission} from "/@/hooks/web/usePermission";
import {previewFile} from "/@/api/common/api";
const { hasPermission } = usePermission();
let searchInfo = {};
const showFooter = ref(true);
const checkedKeys = ref<Array<string | number>>([]);
//注册model
const [registerModal, { openDrawer }] = useDrawer();
const [registerExtension, {openModal}] = useModal();
const [registerExtensionAgree, {openModal: openExtensionAgree}] = useModal();
const [registerDesc, { openDrawer: openDesc }] = useDrawer();
const [registerEhsNoticeInfoPreview, { openModal: openPreview }] = useModal();
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
//注册table数据

const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    api: list,
    columns,
    canResize: false,
    showIndexColumn: true,
    // handleSearchInfoFn(info) {
    //   console.log('handleSearchInfoFn', info);
    //   searchInfo = Object.assign({}, info);
    //   if (info.createTime1) {
    //     console.log('createTime1', info.createTime, info.createTime1.split(','));
    //     let time = info.createTime1.split(',');
    //     searchInfo['startTime'] = time[0];
    //     searchInfo['endTime'] = time[1];
    //     delete searchInfo['createTime1'];
    //   }
    //   console.log('handleSearchInfoFn param', searchInfo);
    //   return searchInfo;
    // },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 250,
      fixed: 'right'
    },
  },
  exportConfig: {
    name: "ehs_notice_info",
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
});

const [registerTable, {reload}, {rowSelection, selectedRowKeys}] = tableContext;

/**
 * 新增事件
 */
function handleAdd() {
  showFooter.value = true;
  openDrawer(true, {
    isUpdate: false,
    showFooter: showFooter.value
  });
}

/**
 * 操作栏 -> 整改反馈
 */
function handleCorrectiveFeedback(record: Recordable,titleCode) {
  showFooter.value = true;
  openDrawer(true, {
    record,
    isUpdate: true,
    showFooter: showFooter.value,
    titleCode: titleCode  //1-整改反馈 2-延期申请 3-延期审核 4-复查 5-查看
  });
}

/**
 * 操作栏 -> 延期申请
 */
function handlerExtension(record: Recordable,titleCode) {
  showFooter.value = true;
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: showFooter.value,
    titleCode: titleCode  //1-整改反馈 2-延期申请 3-延期审核 4-复查 5-查看
  });
}
/**
 * 操作栏 -> 延期审核
 */
function handlerExtensionAgree(record: Recordable,titleCode) {
  showFooter.value = true;
  openExtensionAgree(true, {
    record,
    isUpdate: true,
    showFooter: showFooter.value,
    titleCode: titleCode  //1-整改反馈 2-延期申请 3-延期审核 4-复查 5-查看
  });
}
/**
 * 详情
 */
function handleDetail(record: Recordable) {
  showFooter.value = false;
  openDesc(true, {
    record,
    showFooter: showFooter.value,
    titleCode: '5'  //1-整改反馈 2-延期申请 3-延期审核 4-复查 5-查看
  });
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

function getViewModal(record: Recordable) {

  if(record.entryMethod==1){
    return [
      {
        label: record.noticeNo,
        onClick: noticePreview.bind(null, record),
      },
    ]
  }else{
    return [
      {
        label: record.noticeNo,
        onClick: getAttachment.bind(null, record),
      },
    ]
  }
}
async function noticePreview(record: Recordable) {
  showFooter.value = false;
  openPreview(true, record);
}
async function getAttachment(record: Recordable) {
  previewFile(record.attachment).then((res) => {
    window.open(res, '_blank');
  });
}

/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '整改反馈',
      onClick: handleCorrectiveFeedback.bind(null, record,'1'),
      ifShow: () => {
        return hasPermission('noticeRectification:feedback') && record.status == '3' && record.isExtension!='2' && userinfo.value.id == record.correctorId;
      },
    },
    {
      label: '延期申请',
      onClick: handlerExtension.bind(null, record,'2'),
      ifShow: () => {
        return hasPermission('noticeRectification:extension') && record.status == '3' && record.isExtension!='2' && userinfo.value.id == record.correctorId;
      },
    },
    {
      label: '延期审核',
      onClick: handlerExtensionAgree.bind(null, record,'3'),
      ifShow: () => {
        return hasPermission('noticeRectification:review') && record.isExtension == '2' && userinfo.value.id == record.signUserid;
      },
    },
    {
      label: '复查',
      onClick: handleCorrectiveFeedback.bind(null, record,'4'),
      ifShow: () => {
        return hasPermission('noticeRectification:audit') && record.status == '4' && record.isExtension!='2' && userinfo.value.id == record.signUserid;
      },
    },
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    }
  ]
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '详情',
      onClick: handleDetail.bind(null, record),
    }, {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
      }
    }
  ]
}

function dateCompare(endDt) {
  const date1 = dayjs(endDt);
  const date2 = dayjs(dayjs().format('YYYY-MM-DD'));
  var day = date1.diff(date2,'day');
  return day;
}
</script>
<style scoped>

  .status-point {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 10px;
    border-radius: 50%;
  }

</style>
