<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :searchInfo="searchInfo">
      <template #tableTitle>
        <a-button preIcon="ant-design:export-outlined" @click="handleExportXls" :loading="exportLoading"> 导出</a-button>
      </template>
      <template #photo="{ record }">
        <img v-if="record.maintenanceHzp" :src="fmtImg(record)" style="cursor: pointer;display: inline-block;width:40px;height:40px;" @click="openImg(record)" />
        <span v-if="!record.maintenanceHzp">无</span>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <RecordModal @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts" name="periodicClean-record" setup>
import { BasicTable, TableAction } from '/@/components/Table'
import RecordModal from './RecordModal.vue'
import { useModal } from '/@/components/Modal'
import { columns, searchFormSchema } from './record.data'
import { getList, getExportUrl, exportXlsRecord, getOrganizationNew } from './record.api'
import { useListPage } from '/@/hooks/system/useListPage'
import { getFileAccessHttpUrl,dateFormat } from '/@/utils/common/compUtils';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
import { ref } from 'vue';
import { createImgPreview } from '/@/components/Preview/index';
const [registerModal, { openModal }] = useModal()
// let queryParam = {}
// let dataSource = []
const exportLoading = ref(false)
let searchInfo = {}
let organizationCode = undefined
// 列表页面公共参数、方法
const { tableContext, onExportXls } = useListPage({
  designScope: 'periodic-template',
  tableProps: {
    title: '清理维护记录列表',
    api: getList,
    // dataSource: dataSource,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema
    },
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info)
      const {nextMaintenanceTime,thisMaintenanceTime} = info
      if(nextMaintenanceTime) {
        info.nextMaintenanceStartTime = nextMaintenanceTime.split(',')[0] + ' 00:00:00'
        info.nextMaintenanceEndTime = nextMaintenanceTime.split(',')[1] + ' 23:59:59'
      }
      if(thisMaintenanceTime) {
        info.thisMaintenanceStartTime = thisMaintenanceTime.split(',')[0] + ' 00:00:00'
        info.thisMaintenanceEndTime = thisMaintenanceTime.split(',')[1] + ' 23:59:59'
      }
      if(organizationCode) {
        info.organizationCode = organizationCode
        const searchForm = getForm();
        searchForm.setFieldsValue({
          organizationCode: organizationCode
        });
      }
      searchInfo = Object.assign({}, info)
      console.log('handleSearchInfoFn param', searchInfo)
      return searchInfo
    },
    beforeFetch: (info) => {
      const {nextMaintenanceTime,thisMaintenanceTime} = info
      if(nextMaintenanceTime) {
        info.nextMaintenanceStartTime = nextMaintenanceTime.split(',')[0] + ' 00:00:00'
        info.nextMaintenanceEndTime = nextMaintenanceTime.split(',')[1] + ' 23:59:59'
      }
      if(thisMaintenanceTime) {
        info.thisMaintenanceStartTime = thisMaintenanceTime.split(',')[0] + ' 00:00:00'
        info.thisMaintenanceEndTime = thisMaintenanceTime.split(',')[1] + ' 23:59:59'
      }
      return info
    },
    immediate: false,
    showIndexColumn: true,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right'
    }
  },
  exportConfig: {
    name: '清理维护记录-' + dateFormat(new Date(),'yyyy-MM-dd'),
    url: getExportUrl,
  }
})
const [registerTable, { reload, getForm }, { rowSelection }] = tableContext

async function getOrgList() {
  getOrganizationNew().then( async (res) => {
    const orgOptions = res.map((item:any) => {
      return {
        label: item.departName,
        value: item.orgCode
      }
    })
    const searchForm = await getForm();
    searchForm.updateSchema({
      field: 'organizationCode',
      componentProps: {
        options: orgOptions,
        placeholder: '请选择',
        disabled: orgOptions.length === 1,
      }
    })
    if(orgOptions.length === 1) {
      searchForm.setFieldsValue({
        organizationCode: orgOptions[0]?.value
      });
      organizationCode = orgOptions[0]?.value
    }
    reload()
 })
}
getOrgList()

function handleExportXls(){
  exportLoading.value = true
  onExportXls(searchInfo).then(() => {
    exportLoading.value = false
  })
}
// 详情
function handleDetail(record) {
  openModal(true, {
    isUpdate: true,
    showFooter: false,
    record: record,
    type: '3' // 查看
  })
}

// 操作列
function getActions(record) {
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record)
    },
    {
      label: '导出',
      onClick: handleWord.bind(null, record)
    }
  ]
}

function fmtImg(record:any){
  // console.log(record,'000---------')
  const firstImg = record.maintenanceHzp.split(',')[0]
  return getFileAccessHttpUrl(firstImg)
}
function openImg(record) {
  // const onImgLoad = ({ index, url, dom }) => {
  //   console.log(`第${index + 1}张图片已加载，URL为：${url}`, dom);
  // };
  let imageList = record.maintenanceHzp.split(',').map((i) => getFileAccessHttpUrl(i));
  createImgPreview({ 
    imageList: imageList, 
    defaultWidth: 600, 
    rememberState: true, 
    scaleStep: 10
    // onImgLoad 
  });
}

// 导出word
async function handleWord(record:any, isXlsx?) {
  const data = await exportXlsRecord({id: record.id})
  if (!data) {
    createMessage.warning('文件下载失败');
    return;
  }
  const name = record.clearEntryName + dateFormat(new Date(),'yyyy-MM-dd')
  let blobOptions = { type: 'application/vnd.ms-excel' };
  let fileSuffix = '.xls';
  if (isXlsx === true) {
    blobOptions['type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    fileSuffix = '.xlsx';
  }
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(new Blob([data], blobOptions), name + fileSuffix);
  } else {
    let url = window.URL.createObjectURL(new Blob([data], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  }
}
</script>

<style scoped></style>
