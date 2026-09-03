<template>
  <div>
    <div class="head">
      <span class="first">异常提醒</span>
      <span class="last" v-auth="'periodicCleanStatistics:abnormal'" @click="oneReminder">一键提醒</span>
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
          <dt>执行人:</dt>
          <dd>{{ item.executorName }}</dd>
        </dl>
        <dl>
          <dt>周期:</dt>
          <dd>{{ item.cycle==='5' ? item.dayNum+'天' : filterMultiDictText(dictOptionsCycle, item.cycle) }}</dd>
        </dl>
        <dl>
          <dt>下次维护时间:</dt>
          <dd>{{item.nextExecutionTime}}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { initDictOptions } from '/@/utils/dict'
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js'
import { setAppTitle } from '/@/utils/index';
import { abnormalList, enterAbnormal } from '/@/views/periodicClean/statistics/statistics.api'
import { useRouter } from 'vue-router'
const router = useRouter()
const { currentRoute } = router;
const dictOptionsType = ref<any>([])
const dictOptionsCycle = ref<any>([])
const dataList: any = ref([])

const queryParam = reactive({
  startTime: currentRoute.value?.query.startTime,
  endTime: currentRoute.value?.query.endTime,
  type: currentRoute.value?.query.type,
  organizationCode: currentRoute.value?.query.organizationCode
})

// 初始化字典选项
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('clean_plan_type')
  dictOptionsCycle.value = await initDictOptions('cycle')
  // console.log(dictOptionsType.value)
}

loadData()
function loadData() {
  abnormalList(queryParam).then((res: any) => {
    dataList.value = res
  })
}
// 一键提醒
function oneReminder() {
  const ids = dataList.value.map((v:any) => v.id).join(',')
  enterAbnormal({ids}).then(() => {
    
  })
}

function goTask(item:any) {
  router.push({ path: '/app/statisticsOverdue', query: {id: item.id, cqTime: item.cqTime} })
}

onMounted(() => {
  setAppTitle()
  initDictConfig()
})
</script>

<style lang="less" scoped>
.head {
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;

  .first {
    font-size: 15px;
    color: rgba(0, 0, 0, 0.38);
  }

  .last {
    background: #3E87F8;
    color: #ffffff;
    font-size: 12px;
    width: 84px;
    height: 24px;
    line-height: 24px;
    border-radius: 4px;
    text-align: center;
    letter-spacing: 1px;
  }
}

.app-maintain-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding: 12px 13px;
  padding-bottom: 30px;

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

</style>
