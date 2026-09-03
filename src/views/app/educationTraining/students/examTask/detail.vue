<template>
  <div class="taskDetail">
    <div class="hd">
      <div>任务总进度</div>
      <h1>0%</h1>
      <div class="bt">任务周期：fsdfjdafdsadfsgfdgfsa</div>
    </div>
    <DetailList />
  </div>
</template>
<script lang="ts" setup>
import DetailList from '../components/detailList.vue'
</script>
<style lang="less" scoped>
  .taskDetail {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    .hd {
      height: 30%;
      background-color: #1890ff;
      border-radius: 10px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
      justify-content: space-between;
      h1 {
        font-size: 32px;
        font-weight: 800;
        color: #ffffff;
      }
      .bt {
        width: 100%;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 10px 16px;
        border-radius: 10px;
      }
    }
   
  }
</style>
