<template>
  <div class="app-periodic-wrap">
    <div class="step-box">

      <dl 
        :class="dataObj.status === '1' ? 'no' : 'next'"
      >
        <dt><span>{{dataObj.maintenanceTime}}</span></dt>
        <dd>
          {{dataObj.bs}}
        </dd>
      </dl>

      <dl 
        v-for="(item) in dataObj.jnClearExecutionRecordList"
        :class="{'no': item.status === '1'}"
      >
        <dt><span>{{item.maintenanceTime.slice(5)}}</span></dt>
        <dd>
          {{ 
            item.status === '1' ? '未执行' : 
            item.executor ? '执行人：' + item.executor : '' 
          }}
          <span 
            v-if="item.status === '0' && item.executor"
            @click="goDetail(item.recordId)"
          >查看详情</span>
        </dd>
      </dl>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// import { showDialog } from 'vant';
import { executeRecord } from '../app.api';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps({
  pageId: { type: String, default: '' }
});

const dataObj:any = ref({})

loadData();
onMounted(() => {
  
});

function loadData(){
  executeRecord({id: props.pageId}).then((res:any) => {
    // console.log(res)
    dataObj.value = res
  })
}

function goDetail(id:string){
  router.push({ path: '/app/periodicexecuteDetail', query: {id} })
}

</script>

<style lang="less" scoped>
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding-top: 12px;
  .step-box{
    background-color: #fff;
    padding-left: 32px;
    padding-top: 30px;
    dl{
      margin-bottom: 0px;
      padding-left: 20px;
      border-left: 1px solid #09C199;
      dt{
        color: #323233;
        font-size: 14px;
        position: relative;
        >span{
          position: relative;
          top: -2px;
        }
        &::before{
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #09C199;
          border: 3px solid #fff;
          position: absolute;
          left: -28px;
          top: 0px;
        }
      }
      dd{
        color: #969799;
        font-size: 13px;
        padding-top: 6px;
        padding-bottom: 28px;
        margin: 0px;
        >span{
          color: #3E87F8;
          padding-left: 6px;
        }
      }
      &.no{
        border-left-color: #CD2B1D;
        dt{
          &::before{
            background-color: #CD2B1D;
          }
        }
      }
      &.next{
        border-left-color: #DCDEE0;
        dt{
          &::before{
            background-color: #DCDEE0;
          }
        }
      }
    }
  }
}

</style>