<template>
  <div class="taskStatistics">
    <!-- 自定义查询区域 -->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="5" :sm="12">
            <a-form-item label="统计时间">
              <a-range-picker v-model:value="queryParam.rangeValue" valueFormat="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="12">
            <a-form-item label="发布部门">
              <j-tree-select1
                v-model:value="queryParam.publishOrgCode"
                :tree-data="orgOptions"
                :isLeaf="false"
                :load="false"
                :field-names="{
                  label: 'departName',
                  value: 'orgCode',
                  options: 'children',
                }"
                tree-node-filter-prop="departName"
              />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <div class="btn-list">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
      <!-- <div class="search-time">
        发布时间
        <a-range-picker v-model:value="searchValue" />
      </div>
      <div class="search-depa">
        发布部门
        <a-select v-model:value="selectValue" :options="selOpt" placeholder="请选择" />
      </div> -->
    </div>
    <div class="statistics-above">
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/正向追溯(1).png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >任务总数
            <a-tooltip>
              <template #title>统计时间内发布的任务、完成期限在统计时间内的任务总数</template>
              <span class="rhques">!</span></a-tooltip
            >
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['任务总数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/正向追溯.png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >进行中
            <a-tooltip>
              <template #title>统计时间内发布部门发布的进行中的任务个数</template>
              <span class="rhques">!</span>
            </a-tooltip>
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['进行中任务数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/刻码信息查询(2).png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >已完成
            <a-tooltip>
              <template #title>统计时间内发布部门发布的已完成的任务个数</template>
              <span class="rhques">!</span>
            </a-tooltip>
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['完成任务数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/刻码信息查询(1).png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >延期完成
            <a-tooltip>
              <template #title>统计时间内发布部门发布的任务中延期完成的个数</template>
              <span class="rhques">!</span>
            </a-tooltip>
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['延期任务数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/刻码信息查询.png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >超期完成
            <a-tooltip>
              <template #title>统计时间内发布部门发布的任务中超期完成的任务个数</template>
              <span class="rhques">!</span>
            </a-tooltip>
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['超期完成任务数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
      <dl class="above-dl">
        <dt class="above-dt">
          <img src="../../../assets/images/taskStatistics/生产异常报警记录.png" alt="" />
        </dt>
        <dd class="above-dd">
          <p class="task-number"
            >超期未完成
            <a-tooltip>
              <template #title>统计时间内发布部门发布的任务中超期未完成的任务个数</template>
              <span class="rhques">!</span>
            </a-tooltip>
          </p>
          <p class="quantity">
            <span class="numval">{{ statisData['超期未完成任务数'] }}</span>
            <span class="several">个</span>
          </p>
        </dd>
      </dl>
    </div>
    <div class="statistics-middle">
      <div class="middle-left">
        <div class="middle-top">
          <h3>任务完成率</h3>
          <div class="top-prog">
            <h1>{{ statisData['任务完成率'] || 0}}%</h1>
            <a-progress :percent="(statisData['任务完成率'] || 0)" :show-info="false" />
          </div>
          <p class="comp-rate">
            <span>延期完成率 {{ (statisData['延期完成率'] || 0) }}%</span>
            <span>超期完成率 {{ (statisData['超期完成率'] || 0) }}%</span>
          </p>
        </div>
        <div class="middle-bottom">
          <!-- <h3>任务分类统计</h3> -->
          <!-- <div class="bot-task"> -->
          <div class="manage-risk" ref="manAndCon"></div>
          <!-- <a-progress type="circle" :percent="taskTypeData.检查任务*100" :show-info="false" :width="51" /> -->
          <!-- <a-radio-group v-model:value="redVal" class="redGro">
              <div class="examine-task">
                <a-radio :value="1">检查任务</a-radio>
                <h2>{{ taskTypeData['检查任务'] * 100 }}%</h2>
              </div>
              <div class="fill-task">
                <a-radio :value="2">填报任务</a-radio>
                <h2>{{ taskTypeData['填报任务'] * 100 }}%</h2>
              </div>
            </a-radio-group> -->
          <!-- </div> -->
        </div>
      </div>
      <div class="middle-right">
        <div class="mr-top">
          <h3>各单位任务完成情况</h3>
          <h3>
            责任单位：<!-- <a-select :options="liaOpt" v-model:value="liabValue" placeholder="六号线" /> -->
            <a-select v-model:value="queryParam.dutyOrgCode" allowClear placeholder="请选择" @change="handleSearchTypeChange">
              <template v-for="item in departOptions" :key="`${item.id}`">
                <a-select-option :value="item.orgCode">{{ item.departName }}</a-select-option>
              </template>
            </a-select>
          </h3>
        </div>
        <div class="mr-main" style="position: relative">
          <Loading
            :loading="compState.loadingas"
            :absolute="compState.absolute"
            :theme="compState.theme"
            :background="compState.background"
            :tip="compState.tip"
          />
          <div ref="cirChart" class="mr-circumstance"></div>
          <div class="mr-ranking">
            <h3> 任务完成率TOP5 </h3>
            <div class="com-ran">
              <div class="ran-list" v-if="rankOne.length > 0">
                <p class="list-box">
                  <span class="first">1</span>
                  <span class="line">{{ rankOne[0] }}</span>
                </p>
                <span class="enterate">{{ rankOne[1] }}%</span>
              </div>
              <div class="ran-list" v-if="rankTwo.length > 0">
                <p class="list-box">
                  <span class="second">2</span>
                  <span class="line">{{ rankTwo[0] }}</span>
                </p>
                <span class="enterate">{{ rankTwo[1] }}%</span>
              </div>
              <div class="ran-list" v-if="rankThree.length > 0">
                <p class="list-box">
                  <span class="third">3</span>
                  <span class="line">{{ rankThree[0] }}</span>
                </p>
                <span class="enterate">{{ rankThree[1] }}%</span>
              </div>
              <div class="ran-list" v-if="rankFour.length > 0">
                <p class="list-box">
                  <span class="round-rate">4</span>
                  <span class="line">{{ rankFour[0] }}</span>
                </p>
                <span class="enterate">{{ rankFour[1] }}%</span>
              </div>
              <div class="ran-list" v-if="rankFive.length > 0">
                <p class="list-box">
                  <span class="round-rate">5</span>
                  <span class="line">{{ rankFive[0] }}</span>
                </p>
                <span class="enterate">{{ rankFive[1] }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="statistics-under">
      <!-- <div class="under-top">
        <div class="ut-left">
          <h3>超期未完成任务列表</h3>
          <a-button type="primary" v-auth="'taskManagement:jn_sta:hint'" ghost>一键提醒</a-button>
        </div>
        <a-button v-auth="'taskManagement:jn_sta:exportXls'" @click="onExportXls">导出</a-button>
      </div> -->
      <div class="under-bottom">
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <div class="tab-header">
              <h3>超期未完成任务列表</h3>
              <div>
                <a-button
                  style="margin-right: 15px"
                  type="primary"
                  :loading="noticeLoading"
                  @click="handleOneRemind"
                  v-auth="'taskManagement:jn_sta:hint'"
                  >一键提醒</a-button
                >
                <a-button preIcon="ant-design:export-outlined" @click="onExportXls" v-auth="'taskManagement:jn_sta:exportXls'"> 导出</a-button>
              </div>
            </div>
          </template>
          <template #reportCycle="{ record }">
            <span>{{ setTime(record) }}</span>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { overList, getExportUrl, taskFinish, juStatistics, juTaskType, noticeOvertime } from './statisticsApi';
import { Loading } from '/@/components/Loading';
import { BasicTable, TableAction } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { ref, reactive, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { dateFormat } from '/@/utils/common/compUtils';
import { useRouter } from 'vue-router';
import { useMessage } from '/@/hooks/web/useMessage';
import { uploadFile, getDepartTreeFor23, getOrgCodeList } from '/@/api/common/api';
import { JTreeSelect1 } from '/@/components/Form';

const { createConfirm, createMessage } = useMessage();
const router = useRouter();
const cirChart = ref();
const manAndCon = ref();
const statisData = ref({});
const taskTypeData = ref({});
const dutyFinish = ref({});
const rankOne = ref<any[]>([]);
const rankTwo = ref<any[]>([]);
const rankThree = ref<any[]>([]);
const rankFour = ref<any[]>([]);
const rankFive = ref<any[]>([]);
const orgOptions = ref<any>([]);
const departOptions = ref<any>([]);
const loadingBtn = ref(false);
const noticeLoading = ref(false);
//搜索
const queryParam = ref({
  rangeValue: [],
  publishOrgCode: undefined,
  dutyOrgCode: undefined,
});
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 7 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 19 },
});

const compState = reactive({
  absolute: false,
  loadingas: false,
  theme: 'light',
  background: 'rgba(255,255,255,.7)',
  tip: '加载中...',
});
function openLoading(absolute: boolean) {
  compState.absolute = absolute;
  compState.loadingas = true;
}

//未完成表格
const columns = [
  {
    title: '责任单位/责任人',
    dataIndex: 'dutyUnitName',
    key: 'dutyUnitName',
  },
  {
    title: '工作任务',
    dataIndex: 'workContent',
    key: 'workContent',
  },
  {
    title: '是否延期',
    key: 'delayTime',
    dataIndex: 'delayTime',
  },
  {
    title: '任务类型',
    key: 'reportRequire',
    dataIndex: 'reportRequire',
  },
  {
    title: '汇报周期/汇报时间',
    key: 'reportCycle',
    dataIndex: 'reportCycle',
    slots: { customRender: 'reportCycle' },
  },
];

const { tableContext, onExportXls } = useListPage({
  designScope: 'publish-template',
  tableProps: {
    title: '超期未完成任务列表',
    api: overList,
    columns: columns,
    showIndexColumn: true,
    useSearchForm: false,
    // beforeFetch: (params) => {
    //   if(queryParam.value.rangeValue && queryParam.value.rangeValue.length > 0){
    //     params.startTime = queryParam.value.rangeValue[0];
    //     params.endTime = queryParam.value.rangeValue[1];
    //   }
    //   return params;
    // },
    actionColumn: {
      width: 220,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  exportConfig: {
    name: '超期未完成任务-' + dateFormat(new Date(), 'yyyy-MM-dd'),
    url: getExportUrl,
  },
});

const [registerTable, { reload }] = tableContext;

function handleDetail(record) {
  router.push({
    path: '/task/list',
    query: {
      completeTimeLimit: record.completeTimeLimit,
      workContent: record.workContent,
    },
  });
}

function getActions(record) {
  return [
    {
      label: '查看',
      onClick: handleDetail.bind(null, record),
    },
  ];
}

function setTime(record){
  return record.reportWay == 1 ? record.reportCycle : record.reportCycle.substr(0, 10)
}

let myBarChart = null;
getOrgList();
getOrgOptionList();
//获取责任单位
async function getOrgOptionList() {
  await getOrgCodeList().then((res) => {
    departOptions.value = res;
  });
}
onMounted(() => {
  initPage();
  myBarChart = echarts.init(cirChart.value);
});
const initPage = () => {
  let params = {
    dutyOrgCode: queryParam.value.dutyOrgCode,
    endTime: queryParam.value.rangeValue[1],
    publishOrgCode: queryParam.value.publishOrgCode,
    startTime: queryParam.value.rangeValue[0],
  };
  juStatisticsData();
  juTaskTypeStats();
  taskFinishStats(params);
};

//搜索
function searchQuery() {
  loadingBtn.value = true;
  reload();
  initPage();
}
async function getOrgList() {
  await getDepartTreeFor23().then((res) => {
    orgOptions.value = res;
  });
}

//publishOrgCode
const handleSearchTypeChange = (value) => {
  let cparams = {
    dutyOrgCode: value,
    startTime: queryParam.value.rangeValue[0],
    publishOrgCode: queryParam.value.publishOrgCode,
    endTime: queryParam.value.rangeValue[1],
  };
  if (!value) {
    cparams.dutyOrgCode = queryParam.value.dutyOrgCode;
  }
  taskFinishStats(cparams);
};
//各单位任务完成情况
async function taskFinishStats(data) {
  let params = {
    dutyOrgCode: queryParam.value.dutyOrgCode,
    endTime: '',
    publishOrgCode: queryParam.value.publishOrgCode,
    startTime: '',
  };
  openLoading(true);
  Object.assign(params, data);
  await taskFinish(params).then((res) => {
    loadingBtn.value = false;
    compState.loadingas = false;
    dutyFinish.value = res;
    let dtfArr:Array<any> = Object.entries(res.finishRateTop5).sort((a:Array<any>, b:Array<any>) => b[1] - a[1]);
    let len = dtfArr.length;
    rankOne.value = len > 0 ? dtfArr[0] : [];
    rankTwo.value = len > 1 ? dtfArr[1] : [];
    rankThree.value = len > 2 ? dtfArr[2] : [];
    rankFour.value = len > 3 ? dtfArr[3] : [];
    rankFive.value = len > 4 ? dtfArr[4] : [];
    circumsExecute();
  });
}
//数据统计
async function juStatisticsData() {
  await juStatistics({
    orgCodes: queryParam.value.publishOrgCode,
    startTime: queryParam.value.rangeValue[0],
    endTime: queryParam.value.rangeValue[1],
  }).then((res) => {
    //console.log(res);
    statisData.value = res;
  });
}
//任务统计分类
async function juTaskTypeStats() {
  await juTaskType({
    orgCodes: queryParam.value.publishOrgCode,
    startTime: queryParam.value.rangeValue[0],
    endTime: queryParam.value.rangeValue[1],
  }).then((res) => {
    taskTypeData.value = res;
    manageControlRisk();
  });
}

//管控风险点-图表
function manageControlRisk() {
  const myChart = echarts.init(manAndCon.value);
  nextTick(() => {
    const option = {
      color: ['#5470c6', '#73c0de'],
      title: {
        text: '任务分类统计',
        left: 0,
        textStyle: {
          fontSize: '14px',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (p) => {
          return `${p.name}<br />数量：${taskTypeData.value[p.name] ? taskTypeData.value[p.name].taskCount : 0}<br />占比：${taskTypeData.value[p.name] ? taskTypeData.value[p.name].taskPercent : 0}%`
        },
      },
      legend: {
        // orient: 'vertical',
        bottom: 0,
      },
      series: [
        {
          name: '任务分类统计',
          type: 'pie',
          radius: '50%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data: [
            { value: taskTypeData.value['填报任务'] ? taskTypeData.value['填报任务'].taskCount : 0, name: '填报任务' },
            { value: taskTypeData.value['检查任务'] ? taskTypeData.value['检查任务'].taskCount : 0, name: '检查任务' },
          ],
        },
      ],
    };
    myChart.setOption(option);
  });
}

//各单位任务完成情况
function circumsExecute() {
  let maxY = Math.max(...dutyFinish.value['allTask'],...dutyFinish.value['finishTask'],...dutyFinish.value['delayTask'],...dutyFinish.value['overtimeFinishTask'],...dutyFinish.value['overtimeTask'],...dutyFinish.value['finishRate']);
  if(maxY%10 > 0) maxY = maxY + (10 - maxY%10);
  myBarChart.clear();
  nextTick(() => {
    const option = {
      color: ['#1F7CF8', '#34E3F2', '#FF8D04', '#F7CF00', '#CD2B1D', '#09C199'],
      grid: {
        left: 50,
        bottom: 50
      },
      title: {
        text: '任务完成情况',
        textStyle: {
          fontSize: 13, // 设置标题字体大小
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params) {
          let str = params[0].name + '<br/>';
          params.forEach((item) => {
            if (item.seriesName == '完成率') {
              str += `${item.marker}${item.seriesName}: ${item.data}%`;
            } else {
              str += `${item.marker}${item.seriesName}: ${item.data}<br/>`;
            }
          });
          return str;
        },
      },
      legend: {
        data: ['任务总数', '按时完成', '延期完成', '超期完成', '超期未完成', '完成率'],
        left: '15%',
        icon: 'circle',
      },
      xAxis: [
        {
          type: 'category',
          data: dutyFinish.value['dutyName'],
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: maxY,
          // interval: 20,
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
      series: [
        {
          name: '任务总数',
          type: 'bar',
          data: dutyFinish.value['allTask'],
        },
        {
          name: '按时完成',
          type: 'bar',
          data: dutyFinish.value['finishTask'],
        },
        {
          name: '延期完成',
          type: 'bar',
          data: dutyFinish.value['delayTask'],
        },
        {
          name: '超期完成',
          type: 'bar',
          data: dutyFinish.value['overtimeFinishTask'],
        },
        {
          name: '超期未完成',
          type: 'bar',
          data: dutyFinish.value['overtimeTask'],
        },
        {
          name: '完成率',
          type: 'line',
          data: dutyFinish.value['finishRate'],
        },
      ],
    };
    myBarChart.setOption(option);
  });
}

// 一键提醒
function handleOneRemind() {
  // 请求接口
  createConfirm({
    iconType: 'warning',
    title: '一键提醒',
    content: '确定要一键提醒吗？',
    onOk: () => {
      noticeLoading.value = true;
      // 调用接口
      noticeOvertime()
        .then((res) => {
          createMessage.success('提醒已发送');
          noticeLoading.value = false;
        })
        .catch((err) => {
          console.log('OneRemind', err);
          noticeLoading.value = false;
          let errbak = JSON.stringify(err);
          saveTextAsFile(errbak, 'error.txt');
        });
    },
    onCancel() {},
  });
}
function saveTextAsFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  // const url = URL.createObjectURL(blob);
  console.log('=====blob=====', blob);
  let file = new File([blob], filename, { type: 'text/plain' });
  console.log('=====file=====', file);
  let params = {
    file: file,
    data: { biz: 'error' },
  };
  // let formData = new FormData()
  // formData.append('file', file)
  // formData.append('biz', 'error')
  // console.log('=====formData=====', formData)
  uploadFile(params, (res) => {
    if (res.success) {
      console.log('111111', res);
    }
  });
}

// 搜索重置
const searchReset = () => {
  queryParam.value = {
    rangeValue: [],
    publishOrgCode: undefined,
    dutyOrgCode: undefined,
  };
  initPage();
};
</script>

<style lang="less" scoped>
.taskStatistics {
  width: 100%;
  height: 100%;
  padding: 15px 20px;
  overflow-y: scroll;
  dt, dd, p{
    padding: 0;
    margin: 0;
  }
  .jeecg-basic-table-form-container {
    width: 100%;
    background-color: #ffffff;
    margin-bottom: 15px;
    .ant-form {
      padding: 0;
      margin: 0;
      .ant-form-item {
        margin-bottom: 0;
      }
    }
    .table-page-search-submitButtons {
      display: block;
      white-space: nowrap;
    }
  }
  // .statistics-search {
  //   width: 100%;
  //   height: 9%;
  //   display: flex;
  //   align-items: center;
  //   background-color: white;
  //   margin-bottom: 1%;

  //   .search-time {
  //     margin-left: 1.1%;
  //   }

  //   .search-depa {
  //     margin-left: 3%;

  //     :deep(.ant-select) {
  //       width: 180px;
  //     }
  //   }
  // }

  .statistics-above {
    width: 100%;
    height: 125px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    .above-dl {
      width: 15%;
      height: 100%;
      display: flex;
      background-color: white;
      justify-content: center;
      align-items: center;
      .above-dt {
        img {
          width: 68px;
          height: 68px;
        }
      }

      .above-dd {
        color: #999;
        padding-left: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        p:nth-child(1) {
          padding-bottom: 0px;
        }
        .task-number {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          
          .rhques {
            display: flex;
            width: 14px;
            height: 14px;
            text-align: center;
            font-size: 12px;
            border: 1px solid #999;
            border-radius: 50%;
            margin-left: 6px;
            align-items: center;
            justify-content: space-around;
          }
        }

        .quantity {
          .numval {
            font-size: 26px;
            color: black;
            line-height: 1;
            padding-right: 10px;
          }
        }
      }
    }
  }

  .statistics-middle {
    width: 100%;
    height: 330px;
    display: flex;

    .middle-left {
      width: 26%;
      height: 100%;

      .middle-top {
        width: 96%;
        height: 40%;
        padding: 3%;
        background-color: white;

        h3 {
          font-weight: bold;
        }

        .top-prog {
          height: 46%;
          display: flex;

          h1 {
            font-size: 26px;
          }

          :deep(.ant-progress-outer) {
            margin-top: 6px;
          }
        }

        .comp-rate {
          margin-bottom: 0;
          span:nth-child(1) {
            margin-right: 12%;
          }
        }
      }

      .middle-bottom {
        width: 96%;
        height: calc(60% - 15px);
        padding: 3%;
        margin-top: 15px;
        background-color: white;

        h3 {
          font-weight: bold;
        }

        .manage-risk {
          width: 100%;
          height: 100%;
        }
        .bot-task {
          width: 100%;
          display: flex;
          align-items: center;

          .manage-risk {
            width: 100%;
            height: 100%;
          }

          .redGro {
            flex: 1;
            display: flex;
          }

          .examine-task {
            margin-left: 6%;

            h2 {
              font-size: 21px;
            }
          }

          .fill-task {
            margin-left: 19%;

            h2 {
              font-size: 21px;
            }
          }
        }
      }
    }

    .middle-right {
      flex: 1;
      background-color: white;

      .mr-top {
        width: 100%;
        height: 18%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eff1f5;
        padding: 0 1.9% 0 1.3%;

        h3 {
          font-weight: bold;

          :deep(.ant-select) {
            width: 120px;
          }
        }
      }

      .mr-main {
        width: 100%;
        height: 82%;
        display: flex;

        .mr-circumstance {
          flex: 1;
          height: 100%;
          padding: 1% 0 0 1%;
        }

        .mr-ranking {
          width: 36%;
          height: 100%;
          padding-top: 1%;
          display: flex;
          flex-direction: column;
          h3 {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-weight: bold;
            margin: 0;
          }

          .com-ran {
            width: 100%;
            flex: 1;
            padding: 10px 16px;
            padding-left: 0;
            overflow-y: auto;

            .ran-list {
              display: flex;
              justify-content: space-between;

              .list-box {
                flex: 1;
                display: flex;
                align-items: center;

                .first {
                  width: 19px;
                  height: 19px;
                  line-height: 19px;
                  border-radius: 50%;
                  background-image: url(../../../assets/images/taskStatistics/蒙版组 846.png);
                  background-repeat: no-repeat;
                  background-size: 19px;
                  text-align: center;
                  color: white;
                }

                .second {
                  width: 19px;
                  height: 19px;
                  line-height: 19px;
                  border-radius: 50%;
                  background-image: url(../../../assets/images/taskStatistics/蒙版组 845.png);
                  background-repeat: no-repeat;
                  background-size: 19px;
                  text-align: center;
                  color: white;
                }

                .third {
                  width: 19px;
                  height: 19px;
                  line-height: 19px;
                  border-radius: 50%;
                  background-image: url('../../../assets/images/taskStatistics/蒙版组 844.png');
                  background-repeat: no-repeat;
                  background-size: 19px;
                  text-align: center;
                  color: white;
                }

                .line {
                  flex: 1;
                  padding-left: 16px;
                  word-break: break-all;
                  word-wrap: break-word;
                }

                .round-rate {
                  width: 19px;
                  height: 19px;
                  line-height: 19px;
                  border-radius: 50%;
                  text-align: center;
                  background-color: #ccc;
                }
              }

              .enterate {
                width: 70px;
                text-align: right;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }

  .statistics-under {
    width: 100%;
    height: auto;
    margin-top: 15px;
    background-color: white;

    .under-top {
      width: 100%;
      height: 15%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      // border-bottom: 1px solid #eee;
      padding: 0 2% 0 2%;

      .ut-left {
        width: 230px;
        display: flex;
        align-items: center;

        h3 {
          font-weight: bolder;
          margin-right: 3%;
        }
      }
    }
  }
  .tab-header {
    width: 100%;
    height: 55px;
    line-height: 55px;
    display: flex;
    align-self: start;
    justify-content: space-between;
    h3 {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
