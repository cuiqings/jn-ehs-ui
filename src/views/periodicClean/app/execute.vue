<template>
  <div class="app-task-wrap">
    <van-tabs v-model:active="active" @click-tab="onClickTab" ref="tabsRef">
      <van-tab 
        v-for="(item,index) in dataObj.jnClearPositionVoList"
        :key="item.id"
      >
        <template #title>
          <span 
            class="tab-index"
            :class="{
              'on': active===index,
              'finish': item.biaoShi === '1'
            }"
          >{{ index+1 }}</span>
        </template>
        <ExecuteForm 
          :index="index"
          :item="item"
          :data="dataObj"
          :isLast="index === dataObj.jnClearPositionVoList.length -1"
          @save="handleSave"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { executeDetail, executeSave } from './app.api';
import { useRouter } from 'vue-router';
import ExecuteForm from './components/ExecuteForm.vue'
import { setAppTitle } from '/@/utils/index';
const router = useRouter();
const { currentRoute } = router;
const pageId = currentRoute.value.query.id
const active = ref(0);
const dataObj:any = ref({})
const tabsRef=ref()

loadData();
onMounted(() => {
  setAppTitle()
});

function loadData(reset?:string){
  executeDetail({id: pageId,type:'web'}).then((res:any) => {
    // console.log(res)
    dataObj.value = res
    if(reset==='1'){
      tabsRef.value.resize();
    }
  })
}

const onClickTab = (val) => {
  console.log(val)
}

// 保存成功
function handleSave(val:any){
  let params = {
    clearMaintenanceId: pageId,
    id: dataObj.value.jlId,
    positionId: dataObj.value.jnClearPositionVoList[active.value].id,
    clearMethod: dataObj.value.jnClearPositionVoList[active.value].clearMethod,
    clearPosition: dataObj.value.jnClearPositionVoList[active.value].clearPosition,
    ...val
  }
  // api
  executeSave(params).then((res:any) => {
    console.log(res)
    // 保存成功跳到下一个切换卡
    if(active.value !== dataObj.value.jnClearPositionVoList.length-1){
      active.value = active.value + 1
    }
    loadData('1');
  })
  
} 


</script>

<style lang="less" scoped>
.app-task-wrap {
  width: 100%;
  height: 100%;
  // overflow-y: auto;
  background: #eff1f5;
  padding-bottom: 30px;
  
}
.tab-index{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #eff1f5;
  display: inline-block;
  text-align: center;
  line-height: 20px;
  &.on{
    background-color: #1989fa;
    color: #fff;
  }
  &.finish{
    background-color: green;
    color: #fff;
  }
}
/deep/ .s-select{
  border: none;
}

</style>