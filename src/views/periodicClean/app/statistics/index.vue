<template>
  <div class="statistics">
    <div class="head">
      <div class="left">所属机构：{{ curOrganizationName || '全部' }}</div>
      <div class="right" @click="showSearchDrawer">
        <span>筛选</span>
        <img src="../../../../assets/images/emergency/down.png" width="9" height="5" />
      </div>
    </div>
    <div class="card" style="margin-top: 0px;">
      <div class="card-head">
        <div class="title">异常提醒</div>
        <div class="more" @click="abnormalConfirm">
          <span>更多</span>
          <img src="../../../../assets/images/periodicClean/more.png" width="16" height="16" />
        </div>
      </div>
      <div class="card-content">
        <div class="flex" v-for="(item, index) in dataSource" :key="index">
          <span>{{ item.entryName }}</span>
          <span class="red" @click="overdueMore(item)">{{ item.cqTime }}</span>
        </div>
        <div v-if="!dataSource.length" class="no-data">暂无数据</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="title">清理项目执行情况</div>
        <div class="more" @click="executeMore">
          <span>更多</span>
          <img src="../../../../assets/images/periodicClean/more.png" width="16" height="16" />
        </div>
      </div>
      <div class="card-content">
        <a-row>
          <a-col :span="12" class="half-flex">
            <img src="../../../../assets/images/periodicClean/plane.png" width="36" height="36" />
            <span>{{ clearProjectData['执行中'] }}</span>
            <span>执行中</span>
          </a-col>
          <a-col :span="12" class="number">
            <div>正常<span>{{ clearProjectData['正常'] }}</span>个 <span class="green margin-left">{{ (clearProjectData['正常百分比']*100).toFixed(1) }}%</span></div>
            <div>超期<span>{{ clearProjectData['超期'] }}</span>个 <span class="red margin-left">{{ (clearProjectData['超期百分比']*100).toFixed(1) }}%</span></div>
            <div>异常<span class="red">{{ clearProjectData['异常次数'] }}</span>次</div>
          </a-col>
        </a-row>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="title">计划执行情况</div>
      </div>
      <div class="card-content">
        <div ref="executeChart" :style="{ height:'25vh', width:'100%' }"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="title">各工序完成情况</div>
      </div>
      <div class="card-content">
        <div ref="completeChart" :style="{ height:'35vh', width:'100%' }"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="title">各工序异常次数</div>
      </div>
      <div class="card-content">
        <div ref="abnormalChart" :style="{ height:'35vh', width:'100%' }"></div>
      </div>
    </div>
    <van-popup
      v-model:show="showRight"
      closeable
      position="right"
      :style="{ width: '294px', height: '100%' }">
      <div class="search">
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">类型</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseClassify(index, item.value)"
                v-for="(item, index) in dictOptionsECL"
                :key="index"
                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': isActiveClassify && isActiveClassifyIndex == index }"
              >
                {{ item.text }}
                <input type="text" v-model="item.value" style="display: none" />
              </div>
            </div>
          </div>

          <div class="content-item">
            <div class="item-label">所属机构</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseLine(index, item)"
                v-for="(item, index) in orgOptions"
                :key="index"
                :class="{ 
                  'item-margin': (index + 1) % 2 != 0, 
                  'item-active': isActiveLine && isActiveLineIndex == index 
                }"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          
          <div class="content-item" style="position: relative">
            <div class="item-label">统计日期</div>
            <a-input
              style="width: 264px; height: 46px; border-radius: 4px 4px 4px 4px; margin-top: 8px"
              v-model:value="date"
              placeholder="请选择"
            />
            <van-icon name="arrow-down" class="arrow-down" @click="showTime = true" />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <van-calendar 
      v-model:show="showTime" 
      type="range" 
      :min-date="new Date('2023-01-01')"
      :allow-same-day="true"
      @confirm="onConfirm" 
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { defHttp } from '/@/utils/http/axios'
import { initDictOptions } from '/@/utils/dict'
import { setAppTitle } from '/@/utils/index';
import { abnormalList, planExecution, completionStatus, abnormalNumber, clearProjectStatus } from '/@/views/periodicClean/statistics/statistics.api'
import { useRouter } from 'vue-router'
const router = useRouter()

const curOrganizationName = ref('')
const queryParam = reactive({
  startTime: '',
  endTime: '',
  type: '',
  organizationCode: ''
})

function loadData() {
  getAbnormalList()
  getExecute()
  getComplete()
  getAbnormal()
  getClearProject()
}

const clearProjectData:any = ref({})
function getClearProject() {
  const params = {
    ...queryParam
  }
  clearProjectStatus(params).then(res => {
    clearProjectData.value = res
  })
}

const dataSource:any = ref([])
// 异常情况提醒列表数据获取
function getAbnormalList() {
  const params = {
    ...queryParam
  }
  abnormalList(params).then(res => {
    if(res && res.length > 2){
      dataSource.value = res.slice(0,2)
    } else {
      dataSource.value = res || []
    }
  })
}

const showRight = ref(false)

// 异常提醒
function abnormalConfirm() {
  router.push({ path: '/app/abnormalReminder', query: queryParam })
}

// 清理项目执行情况
function executeMore() {
  router.push({ path: '/app/statisticsExecute', query: queryParam })
}

// 超期
function overdueMore(item) {
  router.push({ path: '/app/statisticsOverdue', query: {id: item.id, cqTime: item.cqTime} })
}

// 筛选
function showSearchDrawer() {
  showRight.value = true
}

const orgOptions = ref<any>([])

function getOrgList() {
  defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode
      })
    })
    if(res.length === 1) {
      isActiveLine.value = true
      isActiveLineIndex.value = 0
      queryParam['organizationCode'] = res[0].orgCode
    }
    loadData()
  })
  console.log('options', orgOptions.value)
}
getOrgList()

const dictOptionsECL = ref<any>([])

async function initDictConfig() {
  dictOptionsECL.value = await initDictOptions('clean_plan_type')
}

const date = ref('')
const showTime = ref(false)
const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
const onConfirm = (values) => {
  const [start, end] = values
  showTime.value = false
  date.value = `${formatDate(start)} - ${formatDate(end)}`
  queryParam['startTime'] = `${formatDate(start)} 00:00:00`
  queryParam['endTime'] = `${formatDate(end)} 23:59:59`
}
const isActiveLine = ref(false)
const isActiveLineIndex:any = ref(null)

function chooseLine(index, item) {
  console.log('chooseLine', index, item.value)
  curOrganizationName.value = item.label
  if (isActiveLineIndex.value == index) {
    console.log('chooseLine 11111')
    if(orgOptions.value.length !== 1) {
      isActiveLine.value = !isActiveLine.value
      queryParam['organizationCode'] = ''
    }
  } else {
    console.log('chooseLine 22222')
    isActiveLineIndex.value = index
    isActiveLine.value = true
    queryParam['organizationCode'] = item.value
    curOrganizationName.value = item.label
    console.log('chooseLine queryParam', queryParam)
  }
}

const isActiveClassify = ref(false)
const isActiveClassifyIndex = ref(null)

function chooseClassify(index, value) {
  if (isActiveClassifyIndex.value == index) {
    isActiveClassify.value = !isActiveClassify.value
    queryParam['type'] = ''
  } else {
    isActiveClassifyIndex.value = index
    isActiveClassify.value = true
    queryParam['type'] = value
  }
}

// 筛选-确认
function handleConfirm() {
  loadData()
  showRight.value = false
}

// 重置
function handleReset() {
  isActiveClassify.value = false
  isActiveClassifyIndex.value = null
  date.value = ''
  curOrganizationName.value = ''
  queryParam['startTime'] = ''
  queryParam['endTime'] = ''
  queryParam['type'] = ''
  if(orgOptions.value.length !== 1) {
    isActiveLine.value = false
    isActiveLineIndex.value = null
    queryParam['organizationCode'] = ''
  }
}

// 计划执行情况
const executeChart = ref()
function getExecute() {
  const params = {
    ...queryParam
  }
  planExecution(params).then(res => {
    renderExecute(res)
  })
}
function renderExecute(data: any) {
  const myChart = echarts.init(executeChart.value)
  const params = { '正常': data['正常'], '超期': data['超期'] }
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: '50%',
      top: 'middle',
      align: 'left',
      itemHeight: 8,
      itemWidth: 8,
      itemGap: 15,
      formatter: function(name) {
        return `${name}  ${params[name]}项`
      }
    },
    color: ['#09C199', '#FF8D04'],
    series: [
      {
        name: '计划执行状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['25%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        // label: {
        //   normal: {
        //     show: true,
        //     textStyle: {
        //       fontWeight: 300,
        //       fontSize: 16
        //     },
        //     formatter: '{b} {c}'
        //   }
        // },
        data: [
          { name: '正常', value: data['正常'] },
          { name: '超期', value: data['超期'] }
        ]
      }
    ]
  }
  myChart.setOption(option)
}

// 各工序完成情况
const completeChart = ref()

function getComplete() {
  const params = {
    ...queryParam
  }
  completionStatus(params).then(res => {
    renderComplete(res)
  })
}
function renderComplete(data:any) {
  const xAxisData = Object.keys(data)
  const seriesData1 = xAxisData.map(v => data[v]['正常'])
  const seriesData2 = xAxisData.map(v => data[v]['超期'])
  const myChart = echarts.init(completeChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正常', '超期'],
      left: 'center'
    },
    grid: {
      left: '10%',
      right: '0',
      top: '20%',
      bottom: '10%'
    },
    color: ['#09C199', '#FF8D04'],
    xAxis: [
      {
        type: 'category',
        data: xAxisData
      }
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
      }
    ],
    series: [
      {
        name: '正常',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        data: seriesData1,
        barMaxWidth: 30
      },
      {
        name: '超期',
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
  myChart.setOption(option)
}

// 各工序异常次数
const abnormalChart = ref()
function getAbnormal() {
  const params = {
    ...queryParam
  }
  abnormalNumber(params).then(res => {
    renderAbnormal(res)
  })
}
function renderAbnormal(data:any) {
  const xAxisData = Object.keys(data)
  const seriesData = xAxisData.map(v => data[v])
  const myChart = echarts.init(abnormalChart.value)
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
      left: '10%',
      right: '0',
      top: '20%',
      bottom: '10%'
    },
    color: ['#fa5546'],
    legend: {
      data: ['异常次数'],
      left: 'center'
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
  myChart.setOption(option)
}

onMounted(() => {
  setAppTitle()
  // getOrgList()
  initDictConfig()
})
</script>

<style lang="less" scoped>
.statistics {
  background: #EFF1F5;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .no-data{
    color: #999;
    text-align: center;
  }
  .head {
    display: flex;
    justify-content: space-between;
    padding: 12px 14px;
    font-size: 13px;

    .left {
      background: #ffffff;
      color: rgba(0, 0, 0, 0.87);
      padding: 11px 16px;
      border-radius: 20px;
    }

    .right {
      width: 74px;
      height: 40px;
      border-radius: 20px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.87);
      display: flex;
      align-items: center;
      justify-content: center;

      :first-child {
        margin-right: 5px;
      }
    }
  }

  .card {
    margin: 12px 0;
    background-color: #fff;

    .card-head {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 13px;
      border: 1px solid rgba(0, 0, 0, 0.05);

      .title {
        font-size: 15px;
        color: rgba(0, 0, 0, 0.87);
        font-weight: bold;
        letter-spacing: 1px;
      }

      .more {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
      }
    }

    .card-content {
      padding: 12px 13px;

      .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #F7F8FA;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 8px;
      }

      .half-flex {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        border-right: 1px solid #E5E5E5;

        :first-child {
          margin-left: 17px;
        }

        :nth-child(2) {
          font-size: 40px;
          font-weight: bold;
          color: #1F7CF8;
          margin-left: 2px;
          margin-right: 10px;
        }

        :last-child {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.38);
          margin-top: 15px;
        }
      }

      .number {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
        padding-left: 16px;
        line-height: 23px;

        span {
          color: rgba(0, 0, 0, 0.87);
          font-size: 13px;
          width: 30px;
          display: inline-block;
          text-align: center;
        }
      }
    }
  }

  .green {
    color: #09C199 !important;
  }

  .red {
    color: #CD2B1D !important;
  }

  .margin-left {
    margin-left: 32px;
  }

  .search {
    position: relative;

    .search-title {
      font-size: 16px;
      font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      color: rgba(0, 0, 0, 0.87);
      margin: 12px 0 12px 16px;
    }

    .search-split {
      width: 100%;
      height: 1px;
      background: #eff1f5;
      border-radius: 0px 0px 0px 0px;
    }

    .content-box {
      margin-left: 16px;
      padding-bottom: 80px;

      .content-item {
        margin-top: 12px;

        .item-label {
          font-size: 13px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #000000;
        }

        .choose-list {
          margin-top: 8px;

          .choose-item {
            display: inline-block;
            width: 128px;
            height: 36px;
            background: #eff1f5;
            border-radius: 4px 4px 4px 4px;
            line-height: 36px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            text-align: center;
            margin-bottom: 8px;
            border: 1px solid #eff1f5;
            cursor: pointer;
            text-overflow: -o-ellipsis-lastline;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
          }

          .item-margin {
            margin-right: 8px;
          }

          .item-active {
            border: 1px solid #3e87f8;
            background: rgba(62, 135, 248, 0.1);
          }
        }

        .arrow-down {
          position: absolute;
          right: 30px;
          top: 43px;
          z-index: 999;
          width: 8px;
          height: 4px;
          cursor: pointer;
        }
      }
    }

    .action-btn {
      position: absolute;
      right: 0px;
      bottom: 0px;
      width: 100%;
      z-index: 999;

      :first-child {
        display: inline-block;
        cursor: pointer;
        width: 50%;
        color: rgba(0, 0, 0, 0.6);
        height: 53px;
        line-height: 53px;
        background: #f7f8fa;
        text-align: center;
      }

      :last-child {
        display: inline-block;
        cursor: pointer;
        width: 50%;
        height: 53px;
        line-height: 53px;
        font-weight: 600;
        color: #ffffff;
        background: #3e87f8;
        cursor: pointer;
        text-align: center;
      }
    }
  }
}
</style>
