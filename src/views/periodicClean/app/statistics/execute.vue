<template>
  <div class="execute">
    <div class="head">
      <a-row>
        <a-col :span="12" class="half-flex">
          <img src="../../../../assets/images/periodicClean/plane.png" width="36" height="36" />
          <span>{{ clearProjectData['执行中'] }}</span>
          <span>执行中</span>
        </a-col>
        <a-col :span="12" class="number">
          <div>超期<span>{{ clearProjectData['超期'] }}</span>个</div>
          <div>异常<span>{{ clearProjectData['异常次数'] }}</span>次</div>
        </a-col>
      </a-row>
      <div class="search">
        <div class="left">
          <van-search
            v-model="productionProcessse"
            shape="round"
            placeholder="请输入工序"
            background="#00000000"
            @search="onProcessse" 
            @clear="onProcessseClear"
          />
        </div>
        <div class="right">
          <van-search
            v-model="clearEntryName"
            shape="round"
            placeholder="请输入项目"
            background="#00000000"
            @search="onEntry" 
            @clear="onEntryClear"
          />
        </div>
      </div>
    </div>
    <div class="app-maintain-wrap">
      <div
        v-for="(item) in dataList"
        class="card-box"
        @click="goTask(item)"
      >
        <div class="cb-title">
          <span class="t-type" :class="item.type === '1' ? 'green' : ''">
          {{ filterMultiDictText(dictOptionsType, item.type) }}
          </span>
          <span class="t-name">{{ item.entryName }}</span>
          <span class="t-warn">{{item.cqTime}}</span>
        </div>
        <dl>
          <dt>工序:</dt>
          <dd>{{ item.productionProcessse || '--' }}</dd>
        </dl>
        <dl>
          <dt>周期:</dt>
          <dd>{{ item.cycle==='5' ? item.dayNum + '天' : filterMultiDictText(dictOptionsCycle, item.cycle)}}</dd>
        </dl>
        <dl>
          <dt>下次维护时间:</dt>
          <dd>{{item.nextExecutionTime}}</dd>
        </dl>
        <dl v-if="item.abnormalNum">
          <dt style="color:#CD2B1D;">异常次数:</dt>
          <dd style="color:#CD2B1D;">{{item.abnormalNum}}</dd>
        </dl>
      </div>
      <div v-if="!dataList.length" class="no-data">
        <Empty />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { Empty } from 'ant-design-vue';
import { clearProjectStatusList } from '../app.api'
import { initDictOptions } from '/@/utils/dict'
import { setAppTitle } from '/@/utils/index';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js'
import { clearProjectStatus } from '/@/views/periodicClean/statistics/statistics.api'
import { useRouter } from 'vue-router'
const router = useRouter()
const { currentRoute } = router;
const queryParam = reactive({
  startTime: currentRoute.value?.query.startTime,
  endTime: currentRoute.value?.query.endTime,
  type: currentRoute.value?.query.type,
  organizationCode: currentRoute.value?.query.organizationCode
})
const dictOptionsType = ref<any>([])
const dictOptionsCycle = ref<any>([])

const dataList: any = ref([])
const productionProcessse = ref('')
const clearEntryName = ref('')
// 初始化字典选项
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('clean_plan_type')
  dictOptionsCycle.value = await initDictOptions('cycle')
  console.log(dictOptionsType.value)
}

loadData()

function loadData() {
  clearProjectStatusList({
    ...queryParam,
    productionProcessse: productionProcessse.value,
    clearEntryName: clearEntryName.value
  }).then((res: any) => {
    dataList.value = res || []
  })
  getClearProject()
}

const clearProjectData:any = ref({})
function getClearProject() {
  clearProjectStatus({
    ...queryParam,
    productionProcessse: productionProcessse.value,
    clearEntryName: clearEntryName.value
  }).then(res => {
    clearProjectData.value = res
  })
}

function onProcessse() {
  loadData()
}
function onProcessseClear() {
  productionProcessse.value=''
  loadData()
}

function onEntry() {
  loadData()
}
function onEntryClear() {
  clearEntryName.value=''
  loadData()
}

function goTask(item:any) {
  // router.push({ path: '/app/statisticsOverdue', query: {id: item.id, cqTime: item.cqTime} })
  router.push({ path: '/app/periodicTask', query: {id:item.id} })
}

onMounted(() => {
  setAppTitle()
  initDictConfig()
})
</script>

<style lang="less" scoped>
.execute {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding: 12px 13px;

  .head {
    .ant-row {
      padding: 16px;
      align-items: center;
      background-color: #ffffff;
      margin-bottom: 2px;
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

    .search {
      display: flex;
      align-items: center;
      font-size: 13px;
      .left {
        flex: 1;
      }
      .right {
        flex: 1;
      }
    }
  }

  .app-maintain-wrap {
    .card-box {
      background-color: #fff;
      border-radius: 4px;
      margin-bottom: 8px;

      .cb-title {
        line-height: 44px;
        height: 44px;
        font-size: 15px;
        color: rgba(0, 0, 0, 0.87);
        position: relative;
        padding-left: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        .t-type {
          line-height: 18px;
          display: inline-block;
          vertical-align: text-bottom;
          padding: 0px 4px;
          border-radius: 2px;
          background-color: #e0ecfd;
          color: #3E87F8;
          font-size: 12px;
          margin-right: 6px;
          width: 32px;
        }
        .t-name{
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 6px;
          flex: 1;
        }
        .t-warn {
          padding-right: 12px;
          color: #FF8D04;
          font-size: 12px;
        }

        .green {
          background: #DAF6F0 !important;
          color: #09C199 !important;
        }
      }

      dl {
        display: flex;
        font-size: 13px;
        padding-left: 12px;
        margin-bottom: 8px;

        dt {
          padding-right: 6px;
          text-align: left;
          color: rgba(0, 0, 0, 0.38);
        }

        dd {
          color: rgba(0, 0, 0, 0.87);
          margin-bottom: 0px;
        }
      }

      dl:last-child {
        padding-bottom: 12px;
      }
    }
  }
}
.no-data{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30%;
}
</style>
