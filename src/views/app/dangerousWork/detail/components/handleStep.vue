<template>
  <div class="gas">
    <!-- <span class="title">气体检测分析：</span> -->
    <div class="list" v-for="(item, idx) in procedureList" :key="idx">
      <div><span>操作步骤：</span> {{ item.workProcedure }}</div>
      <div><span>完成时间：</span> {{ item.operatingTime }}</div>
      <div class="bk"><span>操作者：</span> {{ item.operatingUserName }}</div>
      <div class="bk"><span>完成情况：</span> 完成</div>
      <div class="bk"><span>确认人：</span> {{ item.confirmUserName }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  procedureList: {
    type: Array,
    default: () => [],
  },
});
  
</script>

<style lang="less" scoped>
.gas{
  padding: 10px 16px;
  background-color: #ffffff;
  .list{
    margin-top: 5px;
    background-color: #f5f5f5;
    padding: 5px 10px;
    div{
      line-height: 22px;
      span{
        display: inline-block;
        width: 70px;
        text-align: right;
        color: #323233;
      }
    }
  }
  .title{
    color: #1890ff;
  }
}
.bk{
  word-break: break-all;
  display: flex;
  img{
    height: 30px;
  }
}
</style>
