<template>
  <div class="app-maintain-wrap">
    <div 
      v-for="(item) in dataList"
      class="card-box" 
      @click="goTask(item.id)"
    >
      <div class="cb-title">
        <span class="t-type" :class="item.type === '1' ? 'green' : ''">
          {{filterMultiDictText(dictOptionsType, item.type)}}
        </span>
        <span class="t-name">{{ item.entryName }}</span>
        <span class="t-warn">{{item.prompt}}</span>
      </div>
      <dl>
        <dt>执行人:</dt>
        <dd>{{item.executorName}}</dd>
      </dl>
      <dl>
        <dt>监督人:</dt>
        <dd>{{item.supervisorName || '--'}}</dd>
      </dl>
      <dl>
        <dt>上次执行时间:</dt>
        <dd>{{item.lastExecutionTime}}</dd>
      </dl>
      <dl>
        <dt>下次维护时间:</dt>
        <dd>{{item.nextExecutionTime}}</dd>
      </dl>
      <div class="cb-bot">
        <span class="t-go" @click="goExecute(item.id, $event)">清理维护</span>
      </div>
    </div>

    <div v-if="!dataList.length" class="no-data">
      <Empty />
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// import { showDialog } from 'vant';
import { Empty } from 'ant-design-vue';
import { executeList } from './app.api';
import { initDictOptions } from '/@/utils/dict';
import { setAppTitle } from '/@/utils/index';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { useRouter } from 'vue-router';
const router = useRouter();
const dictOptionsType = ref<any>([]);
const dataList:any = ref([])
/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('clean_plan_type');
}
loadData();
onMounted(() => {
  setAppTitle()
  //初始化字典选项
  initDictConfig();
});

function loadData(){
  executeList({}).then((res:any) => {
    // console.log(res)
    dataList.value = res
  })
}

function goTask(id:string){
  router.push({ path: '/app/periodicTask', query: {id} })
}

function goExecute(id:string,e:any){
  e.stopPropagation();
  router.push({ path: '/app/periodicExecute', query: {id} })
}

</script>

<style lang="less" scoped>
.app-maintain-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding: 12px 13px;
  padding-bottom: 70px;
  .card-box{
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 8px;
    .cb-title{
      line-height: 44px;
      min-height: 44px;
      font-size: 15px;
      color: rgba(0,0,0,0.87);
      position: relative;
      padding-left: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      margin-bottom: 12px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .t-type{
        line-height: 18px;
        display: inline-block;
        vertical-align: text-bottom;
        padding: 0px 4px;
        border-radius: 2px;
        background-color: #e0ecfd;
        color: #3E87F8;
        font-size: 12px;
        margin-right: 10px;
        width: 34px;
      }
      .t-name{
        line-height: 15px;
        flex: 1;
      }
      .t-warn{
        color: #CD2B1D;
        font-size: 12px;
      }
      .green {
        background: #DAF6F0 !important;
        color: #09C199 !important;
      }
    }
    dl{
      display: flex;
      font-size: 13px;
      margin-bottom: 10px;
      padding-left: 12px;
      margin-bottom: 8px;
      dt{
        padding-right: 6px;
        text-align: left;
        color: rgba(0,0,0,0.38);
      }
      dd{
        color: rgba(0,0,0,0.87);
        margin-bottom: 0px;
      }
    }
    .cb-bot{
      height: 47px;
      border-top: 1px solid rgba(0,0,0,0.1);
      text-align: right;
      padding-right: 12px;
      display: flex;
      align-items: center;
      justify-content: right;
      margin-top: 4px;
      .t-go{
        display: inline-block;
        padding: 0px 16px;
        height: 24px;
        line-height: 24px;
        border-radius: 4px;
        border: 1px solid #3E87F8;
        font-size: 13px;
        color: #3E87F8;
      }
    }
  }
  .no-data{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

</style>