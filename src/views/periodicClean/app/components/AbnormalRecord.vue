<template>
  <div class="app-periodic-wrap">
    <div class="ar-num">异常次数：{{ dataObj.length }}</div>
    <div class="list-box" v-for="(item) in dataObj">
      <div class="lb-desc">{{item.remarks}}</div>
      <div class="lb-time">{{item.lastMaintenanceTime}}至{{item.maintenanceTime}}</div>
      <div class="lb-remind" v-if="item.abnormalNotes">异常原因：{{item.abnormalNotes}}</div>
      <div class="lb-btn" 
        v-auth="'periodicCleanStatistics:remark'"
        @click="updateRemark({id: item.id,remark:item.abnormalNotes})"
      >
        {{ item.abnormalNotes ? '修改备注' : '备注'}}
      </div>
    </div>
  </div>
  <van-dialog 
    v-model:show="show" 
    title="备注异常" 
    show-cancel-button
    :confirm-button-disabled="!remark"
    @confirm="remarkConfirm"
  >
    <!-- <p class="rm-desc"><van-icon name="warning-o" />备注异常后将不再收到此次异常提醒</p> -->
    <van-field
      type="textarea"
      v-model="remark"
      rows="2"
      autosize
      autofocus
      maxlength="50"
      placeholder="请输入"
      show-word-limit
      class="message"
    />
  </van-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// import { showToast } from 'vant';
import { abnormalRecord, abnormalEdit } from '../app.api';
const props = defineProps({
  pageId: { type: String, default: '' }
});
const show = ref(false)
const remark = ref('')
const remarkId = ref('')
const dataObj:any = ref([])

loadData();
onMounted(() => {
  
});

function loadData(){
  abnormalRecord({id: props.pageId}).then((res:any) => {
    // console.log(res)
    dataObj.value = res
  })
}

// 修改备注
function updateRemark(item:any){
  remark.value = item.remark
  remarkId.value = item.id
  show.value = true
}
// 确定修改备注
function remarkConfirm(){
  // console.log(remark.value)
  show.value = false
  // api
  abnormalEdit({
    id: remarkId.value,
    abnormalNotes: remark.value
  }).then(() => {
    loadData()
  })
}



</script>

<style lang="less" scoped>
.message {
  border: 1px solid #e2e2e2;
  width: 90%;
  margin: 12px auto;
}
.rm-desc{
  color: rgba(0,0,0,0.38);
  font-size: 14px;
  margin-bottom: 0px;
  padding-top: 10px;
  padding-left: 14px;
}
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding: 12px 13px;
  .ar-num{
    margin-bottom: 12px;
    font-size: 13px;
    color: rgba(0,0,0,0.87);
  }
  .list-box{
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.5);
    position: relative;
    margin-bottom: 8px;
    .lb-desc{
      font-size: 15px;
      color: #CD2B1D;
    }
    .lb-time,.lb-remind{
      line-height: 20px;
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      width: 15rem;
      word-break: break-all;
    }
    .lb-time{
      white-space: nowrap;
    }
    .lb-btn{
      border: 1px solid #3E87F8;
      border-radius: 4px;
      line-height: 24px;
      height: 24px;
      width: 64px;
      text-align: center;
      font-size: 13px;
      color: #3E87F8;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 16px;
    }
  }
}

</style>