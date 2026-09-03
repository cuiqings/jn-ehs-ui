<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #chartContent>
        <div class="chart">
          <div style="padding-right:4px;">
            <a-row :gutter="8">
              <a-col :lg="5">
                <div class="card">
                  <div class="title">计划执行情况</div>
                  <div ref="executeChart" :style="{ height:'218px', width:'100%' }"></div>
                </div>
              </a-col>
              <a-col :lg="5">
                <div class="card">
                  <div class="title">各工序完成情况</div>
                  <div ref="completeChart" :style="{ height:'218px', width:'100%' }"></div>
                </div>
              </a-col>
              <a-col :lg="5">
                <div class="card">
                  <div class="title">各工序异常次数</div>
                  <div ref="abnormalChart" :style="{ height:'218px', width:'100%' }"></div>
                </div>
              </a-col>
              <a-col :lg="9" style="padding-right: 0px;">
                <div class="card">
                  <div class="title flex">
                    <span>异常情况提醒</span>
                    <a-button 
                      v-auth="'periodicCleanStatistics:abnormal'"
                      type="primary" 
                      size="small" 
                      :loading="reminderLoading"
                      @click="oneReminder"
                    >一键提醒</a-button>
                  </div>
                  <div :style="{ height:'218px', width:'100%', padding: '5px' }">
                    <a-table
                      ref="table"
                      size="middle"
                      bordered
                      rowKey="id"
                      :columns="abnormalColumns"
                      :scroll="{ x: true, y: 150 }"
                      :dataSource="dataSource"
                      :pagination="false">
                      <template #bodyCell="{ column, record, text }">
                        <template v-if="column.dataIndex === 'cqTime'">
                          <span style="color: #FF8D04">
                            {{ text }}
                          </span>
                        </template>
                        <template v-if="column.dataIndex === 'action2'">
                          <a @click="handleDetail(record)">
                            查看
                          </a>
                        </template>
                      </template>
                    </a-table>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </template>
      <template #tableTitle>
        <div class="flex">
          <div class="left">
            <span>清理维护项目执行状态</span>
            <span>超期 {{clearProjectData['超期']}} 个，异常次数 {{clearProjectData['异常次数']}} </span>
          </div>
          <div class="right">
            <a-form :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-row :gutter="24">
                <a-col :lg="4">
                  <a-button 
                    v-auth="'periodicCleanStatistics:export'"
                    type="primary" 
                    preIcon="ant-design:export-outlined"
                    @click="handleExportXls"
                  >导出</a-button>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </div>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #abnormalNum="{ text, record }">
        <a v-if="text" style="color:#CD2B1D;" @click="showAbnormal(record)">
          {{ text }}
        </a>
        <span v-else>{{ text }}</span>
      </template>
      <template #status="{ text }">
        <span style="color:#FF8D04;" v-if="text==='1'">超期</span>
        <span v-else>正常</span>
      </template>
    </BasicTable>
    <DetailsModal @register="registerModal"></DetailsModal>
    <AbnormalModal @register="abmModal"></AbnormalModal>
  </div>
</template>

<script lang="ts" name="periodicClean-statistics" setup>
import { BasicTable, TableAction } from '/@/components/Table'
import { columns, searchFormSchema } from './statistics.data'
import { useListPage } from '/@/hooks/system/useListPage'
import { getList, abnormalList, getExportUrl, enterAbnormal, planExecution, completionStatus, abnormalNumber, clearProjectStatus, exportXlsRecord, getOrganizationNew } from '/@/views/periodicClean/statistics/statistics.api'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { dateFormat } from '/@/utils/common/compUtils';
import * as echarts from 'echarts'
import DetailsModal from './detailsModal.vue'
import { useModal } from '/@/components/Modal'
import AbnormalModal from './abnormalModal.vue'
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();

const reminderLoading = ref(false)
let searchInfo:any = {}
let organizationCode = undefined
let queryParam = {}
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 }
})
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 16 }
})

// 计划执行情况
const executeChart = ref()
const executeEl = ref()
function getExecute(val: any) {
  const params = {
    ...val
  }
  planExecution(params).then(res => {
    renderExecute(res)
  })
}
function renderExecute(data: any) {
  executeEl.value = echarts.init(executeChart.value)
  const params = { '正常': data['正常'], '超期': data['超期'] }
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      left: 'center',
      bottom: 8,
      formatter: function(name) {
        return `${name} ${params[name]}`
      }
    },
    color: ['#13a74a', '#e99d43'],
    series: [
      {
        name: '计划执行状态',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          normal: {
            show: false,
            textStyle: {
              fontWeight: 300,
              fontSize: 12
            },
            formatter: '{b} {c}'
          }
        },
        data: [
          { name: '正常', value: data['正常'] },
          { name: '超期', value: data['超期'] }
        ]
      }
    ]
  }
  executeEl.value.setOption(option)
}

// 各工序完成情况
const completeChart = ref()
const completeEl = ref()
function getComplete(val: any) {
  const params = {
    ...val
  }
  completionStatus(params).then(res => {
    renderComplete(res)
  })
}
function renderComplete(data:any) {
  const xAxisData = Object.keys(data)
  const seriesData1 = xAxisData.map(v => data[v]['正常'])
  const seriesData2 = xAxisData.map(v => data[v]['超期'])
  completeEl.value = echarts.init(completeChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正常执行', '超期未完成'],
      left: 'center',
      bottom: 8
    },
    grid: {
      left: '40',
      right: '20',
      top: '30',
      bottom: '56'
    },
    color: ['#13a74a', '#e99d43'],
    xAxis: [
      {
        type: 'category',
        data: xAxisData
      }
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1
      }
    ],
    series: [
      {
        name: '正常执行',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        data: seriesData1,
        barMaxWidth: 30
      },
      {
        name: '超期未完成',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        data: seriesData2,
        barMaxWidth: 30
      }
    ]
  }
  completeEl.value.setOption(option)
}

// 各工序异常次数
const abnormalChart = ref()
const abnormalEl = ref()
function getAbnormal(val: any) {
  const params = {
    ...val
  }
  renderAbnormal({})
  abnormalNumber(params).then(res => {
    renderAbnormal(res)
  })
}
function renderAbnormal(data:any) {
  const xAxisData = Object.keys(data)
  const seriesData = xAxisData.map(v => data[v])
  abnormalEl.value = echarts.init(abnormalChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          show: true,
          backgroundColor: '#333'
        }
      }
    },
    grid: {
      left: '40',
      right: '20',
      top: '30',
      bottom: '56'
    },
    color: ['#fa5546'],
    legend: {
      data: ['异常次数'],
      left: 'center',
      bottom: 8
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '异常次数',
        type: 'bar',
        data: seriesData,
        barMaxWidth: 30
      }
    ]
  }
  abnormalEl.value.setOption(option)
}

const { tableContext, onExportXls } = useListPage({
  designScope: 'statistics',
  tableProps: {
    api: getList,
    columns: columns,
    formConfig: {
      schemas: searchFormSchema,
      autoAdvancedCol: 3,
    },
    handleSearchInfoFn(info) {
      console.log('handleSearchInfoFn', info)
      const {time} = info
      if(time) {
        info.startTime = time.split(',')[0] + ' 00:00:00'
        info.endTime = time.split(',')[1] + ' 23:59:59'
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
      getAbnormalList(searchInfo)
      getExecute(searchInfo)
      getComplete(searchInfo)
      getAbnormal(searchInfo)
      getClearProject(searchInfo)
      return searchInfo
    },
    beforeFetch: (params) => {
      console.log(params, '---====')
      const {time} = params
      if(time) {
        params.startTime = time.split(',')[0] + ' 00:00:00'
        params.endTime = time.split(',')[1] + ' 23:59:59'
      }
      return params
    },
    immediate: false,
    showIndexColumn: true,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right'
    }
  },
  exportConfig: {
    name: '清理维护项目执行情况-' + dateFormat(new Date(),'yyyy-MM-dd'),
    url: getExportUrl
  }
})
const [registerTable, { reload, getForm }] = tableContext
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
      getAbnormalList({organizationCode: orgOptions[0]?.value})
      getExecute({organizationCode: orgOptions[0]?.value})
      getComplete({organizationCode: orgOptions[0]?.value})
      getAbnormal({organizationCode: orgOptions[0]?.value})
      getClearProject({organizationCode: orgOptions[0]?.value})
    }
    reload()
 })
}
getOrgList()

function handleExportXls(){
  onExportXls(searchInfo)
}
// 操作列
function getActions(record) {
  return [
    {
      label: '导出记录',
      onClick: exportRecord.bind(null, record)
    }
  ]
}

// 清理项目执行情况
const clearProjectData:any = ref({})
function getClearProject(val:any) {
  const params = {
    ...val
  }
  clearProjectStatus(params).then(res => {
    clearProjectData.value = res
  })
}
getClearProject({})

const abnormalColumns = ref([
  {
    title: '项目',
    align: 'center',
    dataIndex: 'entryName',
    // slots: { customRender: 'entryName' }
  },
  // { title: '工序', align: 'center', dataIndex: 'productionProcessse', width: 60 },
  // { title: '下次维护时间', align: 'center', dataIndex: 'nextExecutionTime', width: 110 },
  { title: '超期天数', align: 'center', dataIndex: 'cqTime' },
  // { title: '执行人', align: 'center', dataIndex: 'executorName' },
  {
    title: '操作',
    dataIndex: 'action2',
    align: 'center',
    fixed: 'right',
    width: 60,
    // slots: { customRender: 'action2' }
  }
])
const dataSource = ref([])
// 异常情况提醒列表数据获取
function getAbnormalList(val: any) {
  const params = {
    ...val
  }
  abnormalList(params).then(res => {
    dataSource.value = res || []
  })
}
getAbnormalList({})
// 一键提醒
function oneReminder() {
  reminderLoading.value = true
  const ids = dataSource.value.map((v:any) => v.id).join(',')
  enterAbnormal({ids}).finally(() => {
    reminderLoading.value = false
  })
}


const [registerModal, { openModal }] = useModal()
const handleDetail = (record) => {
  openModal(true, { record })
}

const [abmModal, { openModal: openAbnormalModal }] = useModal()
const showAbnormal = (record) => {
  openAbnormalModal(true, { record })
}

// 导出所有数据
// function exportExcel() {

// }

// 导出单条记录
async function exportRecord(record:any, isXlsx?) {
  const data = await exportXlsRecord({id: record.id})
  if (!data) {
    createMessage.warning('文件下载失败');
    return;
  }
  const name = record.entryName + dateFormat(new Date(),'yyyy-MM-dd')
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
function onResize() {
  if(executeEl.value){
    executeEl.value.resize()
  }
  if(abnormalEl.value){
    abnormalEl.value.resize()
  }
  if(completeEl.value){
    completeEl.value.resize()
  }
}
onMounted(() => {
  getExecute({})
  getComplete({})
  getAbnormal({})
  window.addEventListener("resize", onResize);
})
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
})
</script>

<style lang="less" scoped>
.chart {
  margin-bottom: 8px;
}

.flex {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    :first-child {
      font-size: 20px;
    }

    :last-child {
      margin-left: 20px;
      color: red;
    }
  }
}

.ant-form-item {
  margin-bottom: 0;
}

.card {
  // padding: 10px 20px;
  background: #ffffff;
  .title {
    color: #409FFD;
    line-height: 56px;
    padding: 0px 20px;
    border-bottom: 1px solid #E8E8E8;
    font-weight: 500;
    color: #000000;
    font-size: 16px;
  }
}
</style>
