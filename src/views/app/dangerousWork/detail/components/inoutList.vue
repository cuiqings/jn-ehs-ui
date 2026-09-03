<template>
  <div class="gas">
    <!-- <span class="title">气体检测分析：</span> -->
    <div class="list" v-for="item in accessSpaceList" :key="item.id">
      <div><span>有限空间名称：</span> {{ item.spaceName }}</div>
      <div><span>检修部位：</span> {{ item.accessParts }}</div>
      <div class="bk"><span>进入时间：</span> {{ item.inTime }}</div>
      <div class="bk"><span>进入人签字：</span> <img :src="getFileAccessHttpUrl(item.inSign)" alt=""></div>
      <div class="bk"><span>携带工具：</span> {{ item.carryTools }}</div>
      <div class="bk"><span>出来时间：</span> {{ item.outTime }}</div>
      <div class="bk"><span>出来人员签字：</span> <img :src="getFileAccessHttpUrl(item.outSign)" alt=""></div>
      <div><span>携带工具：</span> {{ item.carryTools }}</div>
      <div class="bk"><span>监护人签字：</span> <img :src="getFileAccessHttpUrl(item.inSignConfirm)" alt=""></div>
      <div class="bk"><span>备注：</span> {{ item.remark }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
defineProps({
  accessSpaceList: {
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
        width: 110px;
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
