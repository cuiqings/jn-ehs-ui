<template>
  <a-card style="background: #eff1f5">
    <!-- 待汇报 -->
    <div class="unfinish-wrap">
      <div class="fl-title">
        <span class="title">待汇报</span> <span class="num">{{ reportingListData.length }}</span>
      </div>
      <div class="fl-list">
        <div class="item-wrap" v-for="item in reportingListData" :key="item.id">
          <div>
            <span class="item-time">汇报时间：{{ item.reportCycleStr }} </span>
            <span v-if="item.publish.taskType == 1" class="item-label">填报任务</span>
            <span v-if="item.publish.taskType == 2" class="item-label">检查任务</span>
          </div>
          <div class="item-content">
            工作任务：{{ item.publish.workContent }}
          </div>
          <div class="item-btn">
            <span v-if="item.tag && item.tag == '即将到期'" class="dot"></span
            ><span v-if="item.tag && item.tag == '即将到期'" class="status">{{ item.tag }}</span>
            <!-- <span class="button" @click="handleAddReport(item, 'wait')">汇报</span> -->
            <span v-if="item.tag && (item.tag == '验收未通过' || item.tag == '逾期未汇报')" class="dot dot-red"></span
            ><span v-if="item.tag && (item.tag == '验收未通过' || item.tag == '逾期未汇报')" class="status status-red">{{ item.tag }}</span>
            <span class="button" @click="handleAddReport(item, 'wait')">汇报</span>
          </div>
        </div>
      </div>
    </div>
    <!-- tab汇报 -->
    <div class="others-wrap">
      <div class="tab-search">
        <a-tabs v-model:activeKey="activeKey" @change="handleTab" type="card">
          <a-tab-pane key="1" :tab="`进行中(${count.jxz || 0})`"></a-tab-pane>
          <a-tab-pane key="2" :tab="`已完成(${count.ywc || 0})`"></a-tab-pane>
          <a-tab-pane key="3" :tab="`我参与的(${count.wcy || 0})`"></a-tab-pane>
        </a-tabs>
        <div class="search-time">
          统计时间:
          <a-range-picker v-model:value="rangeValue" @change="handleTimeChange" :placeholder="placeholder" valueFormat="YYYY-MM-DD" />
        </div>
      </div>
      <!-- 列表区域 -->
      <div>
        <!--自定义查询区域-->
        <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
          <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
              <a-col :md="6" :sm="12">
                <a-form-item label="任务分类">
                  <JDictSelectTag v-model:value="queryParam.taskType" placeholder="请选择" dictCode="jn_publish_task_type" />
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="12">
                <a-form-item label="发布单位">
                  <a-input allowClear placeholder="请输入" v-model:value="queryParam.publishOrgName"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="12">
                <a-form-item label="工作任务">
                  <a-input allowClear placeholder="请输入" v-model:value="queryParam.workContent"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="12">
                <div class="btn-list">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
                </div>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div v-if="listData.length > 0">
          <!--列表-->
          <div class="fl-list-1">
            <div class="item-wrap" v-for="item in listData" :key="item.id">
              <div v-if="activeKey == 3 && item.status == 2" class="task-finished-icon">
                <img src="../../../assets/images/task/task-finished.png" alt="" />
              </div>
              <div>
                <span class="item-time">完成时限：{{ item.completeTimeLimit }} </span>
                <span class="item-label">{{ item.taskType_dictText }}</span>
              </div>
              <div class="item-org">发布单位：{{ item.publishOrgName }}</div>
              <div class="item-content">
                工作任务：{{ item.workContent }}
              </div>
              <div class="item-btn">
                <!-- <span class="status">有1条新评论</span> -->
                <span v-if="item.canReport" class="button" @click="handleAddReport(item, 'other')">汇报</span>
                <span v-else class="button" @click="handleAddReport(item, 'other')">查看</span>
              </div>
            </div>
          </div>
          <!-- 分页 -->
          <div class="page-wrap">
            <a-pagination
              v-model:current="current"
              v-model:page-size="pageSizeRef"
              :total="total"
              @change="onChange"
              showLessItems
              show-quick-jumper
              @showSizeChange="onShowSizeChange"
              :show-total="(total) => `共 ${total} 条`"
            />
          </div>
        </div>
        <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
      </div>
    </div>
    <!-- <ReportModal @register="registerModal" @success="onSuccess" /> -->
    <ReportModal @register="registerDrawer" @success="onSuccess" />
    <!-- <ReportModal ref="reportFormRef" @ok="onSuccess" /> -->
  </a-card>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { reportList, reportingList, getTabCount } from './report.api';
import { Pagination } from 'ant-design-vue';
import ReportModal from './ReportModal.vue';
import { useDrawer } from '/@/components/Drawer';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import dayjs, { Dayjs } from 'dayjs';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();

const APagination = Pagination;
const activeKey = ref('1');
const dateFormat = 'YYYY-MM-DD';
const time1 = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
const rangeValue = ref([]);
const queryParam = ref({
  taskType: '',
  publishOrgName: '',
  workContent: '',
  completeTimeLimit_begin: '',
  completeTimeLimit_end: '',
});
const placeholder = ['开始日期', '结束日期'];
const current = ref<number>(1);
const pageSizeRef = ref(4);
const total = ref(0);
const listData = ref([]);
const reportingListData = ref([]);
const loading = ref(false);
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 19 },
});
const count = ref({});
// const reportFormRef = ref();

// const instance = unref(reportFormRef);
// onCreated
loadData(1);
handleTabCount();
getReportingListData();
// 获取tab count 数据
function handleTabCount() {
  getTabCount({}).then((res) => {
    console.log('res', res);
    count.value = res;
  });
}
// 搜索
function searchQuery() {
  loadData(1);
}
// 重置
function searchReset() {
  const time1 = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
  queryParam.value.taskType = '';
  queryParam.value.publishOrgName = '';
  queryParam.value.workContent = '';
  rangeValue.value = [];
  queryParam.value.completeTimeLimit_begin = '';
  queryParam.value.completeTimeLimit_end = '';
  loadData(1);
}
// tab的重置
function tabReset() {
  queryParam.value.taskType = '';
  queryParam.value.publishOrgName = '';
  queryParam.value.workContent = '';
}
async function getReportingListData() {
  await reportingList({}).then((res) => {
    console.log('res', res);
    reportingListData.value = res;
  });
}
async function loadData(arg) {
  if (arg === 1) {
    current.value = 1;
  }
  loading.value = true;
  let param = Object.assign({}, queryParam.value);
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;
  param['type'] = activeKey.value;
  console.log('param', param);
  await reportList(param).then((res) => {
    console.log('res', res);
    listData.value = res.records;
    total.value = res.total;
    loading.value = false;
    console.log('this.listData.value', listData.value);
  });
}
function handleTab(key) {
  activeKey.value = key;
  tabReset();
  loadData(1);
}
function handleTimeChange(arr) {
  console.log('handleTimeChange', arr);

  if (arr) {
    // 时间间隔不能超过一年
    let timeDiff = new Date(arr[1].valueOf()).getTime() - new Date(arr[0].valueOf()).getTime();
    if (timeDiff > 365 * 24 * 60 * 60 * 1000) {
      rangeValue.value = [];
      createMessage.warning('时间间隔不能超过一年');
      return;
    }
    queryParam.value.completeTimeLimit_begin = arr[0];
    queryParam.value.completeTimeLimit_end = arr[1];
  } else {
    queryParam.value.completeTimeLimit_begin = '';
    queryParam.value.completeTimeLimit_end = '';
  }
  loadData(1);
}
const onShowSizeChange = (current: number, pageSize: number) => {
  console.log(current, pageSize);
  pageSizeRef.value = pageSize;
  loadData(1);
};
const onChange = (pageNumber: number) => {
  console.log('Page: ', pageNumber);
  current.value = pageNumber;
  loadData(0);
};
// 汇报
function handleAddReport(record, type) {
  console.log('handleAddReport');
  openDrawer(true, { record: record, type: type, listKey: activeKey.value });
}

// const [registerModal, { openModal }] = useModal();
const [registerDrawer, { openDrawer }] = useDrawer();
function onSuccess() {
  loadData(current.value);
  handleTabCount();
  getReportingListData();
}
</script>

<style scoped lang="less">
.jeecg-basic-table-form-container {
  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }
}
.page-wrap {
  float: right;
  margin-top: 8px;
}
.unfinish-wrap {
  display: flex;
  .fl-title {
    width: 48px;
    height: 269px;
    background: rgba(0, 190, 247, 0.15);
    border-radius: 2px 0px 0px 2px;
    padding: 0 13px;
    span {
      width: 22px;
      height: 89px;
      font-size: 20px;
      display: inline-block;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    .title {
      margin-top: 65px;
    }
    .num {
      margin-left: 3px;
    }
  }
}

.fl-list-1 {
  width: 100%;
  height: 249px;
  background: #f9fafd;
  border-radius: 0px 2px 2px 0px;
  margin: 0 auto;
  .item-wrap {
    position: relative;
    overflow: hidden;
    display: inline-block;
    width: 358px;
    height: 221px;
    margin: 12px;
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    padding: 24px;
    // cursor: pointer;
    .item-org {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
    .item-time {
      display: inline-block;
      font-size: 20px;
      font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.87);
      margin-right: 8px;
    }
    .item-label {
      width: 64px;
      height: 21px;
      display: inline-block;
      background: rgba(62, 135, 248, 0.15);
      border-radius: 2px 2px 2px 2px;
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #3e87f8;
      padding: 2px 6px;
      vertical-align: initial;
    }
    .item-content {
      margin: 0 0 24px 0;
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3; /* 限制在三行 */
      -webkit-box-orient: vertical;
    }
    .item-btn {
      .status {
        position: absolute;
        display: inline-block;
        bottom: 24px;
        left: 24px;
        width: 112px;
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        font-weight: normal;
        color: #3e87f8;
      }
      .button {
        position: absolute;
        right: 24px;
        bottom: 12px;
        width: 112px;
        height: 40px;
        line-height: 40px;
        background: #3e87f8;
        box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        display: inline-block;
        color: #ffffff;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
      }
    }
  }
}
.fl-list {
  width: 100%;
  height: 269px;
  background: #f9fafd;
  border-radius: 0px 2px 2px 0px;
  overflow-x: scroll;
  // overflow-y: hidden;
  padding: 24px;
  // white-space: nowrap;
  .item-wrap {
    position: relative;
    overflow: hidden;
    display: inline-block;
    width: 435px;
    height: 221px;
    margin: 0 24px 12px 0;
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    padding: 24px;
    .item-time {
      display: inline-block;
      font-size: 20px;
      font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.87);
      margin-right: 8px;
    }
    .item-label {
      width: 64px;
      height: 21px;
      display: inline-block;
      background: rgba(62, 135, 248, 0.15);
      border-radius: 2px 2px 2px 2px;
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #3e87f8;
      padding: 2px 6px;
      vertical-align: initial;
    }
    .item-content {
      margin: 16px 0 24px 0;
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3; /* 限制在三行 */
      -webkit-box-orient: vertical;
    }
    .item-btn {
      .dot {
        position: absolute;
        left: 24px;
        bottom: 33px;
        width: 8px;
        height: 8px;
        background: #ff8d04;
        border-radius: 50%;
        display: inline-block;
      }
      .status {
        position: absolute;
        left: 40px;
        bottom: 24px;
        font-size: 16px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #ff8d04;
        vertical-align: middle;
      }
      .dot-red {
        background: #cd2b1d;
      }
      .status-red {
        color: #cd2b1d;
      }
      .button {
        position: absolute;
        right: 24px;
        bottom: 20px;
        width: 112px;
        height: 40px;
        line-height: 40px;
        background: #3e87f8;
        box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        display: inline-block;
        color: #ffffff;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
      }
    }
  }
}
.others-wrap {
  margin: 24px 0;
  padding: 24px;
  height: 479px;
  background: #ffffff;
  .tab-search {
    position: relative;
  }
  .search-time {
    position: absolute;
    top: 0;
    right: 0;
  }
}
/* 滚动条 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: #e4e0e0;
}
/* 滚动条滑块在鼠标移上时 */
::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
.task-finished-icon {
  position: absolute;
  top: 0;
  right: 0;
  img {
    width: 48px;
    height: 48px;
  }
}
</style>