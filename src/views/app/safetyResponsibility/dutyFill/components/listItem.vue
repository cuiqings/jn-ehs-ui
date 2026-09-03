<template>
  <div class="item">
    <div class="tit">姓名：{{ item.realName }}</div>
    <div class="li"><span class="lable">所属单位：</span> {{ item.orgCode }}</div>
    <div class="li"><span class="lable">所属车间：</span> {{ item.workshop }}</div>
    <div class="li"><span class="lable">岗位：</span> {{ item.post }}</div>
    <div class="li"><span class="lable">考评周期：</span> {{ item.cycleDate }}</div>
    <div class="status">
         <a-tag v-if="item.status=='审核完成'" color="success">{{ item.status }}</a-tag>
         <a-tag v-else color="processing">{{ item.status }}</a-tag>
    </div>
    <slot name="btn"></slot>
  </div>
</template>
<script lang="ts" setup>
  const props = defineProps<{
    item: any;
  }>();
</script>
<style lang="less" scoped>
  .item {
    position: relative;
    width: 100%;
    border-radius: 7px;
    width: 100%;
    background: #ffffff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
  }
  .tit {
    font-size: 16px;
    font-weight: 600;
    // 两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
    margin-bottom: 10px;
  }
  .li {
    width: 100%;
    display: flex;
    .lable {
      display: inline-block;
      width: 60px;
      margin-right: 15px;
      text-align: right;
    }
    .file {
      flex: 1;
      color: #1890ff;
    }
  }
  .status {
    position: absolute;
    top: 10px;
    right: 6px;
  }
</style>
