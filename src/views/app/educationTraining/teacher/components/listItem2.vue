<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="top">
      <div class="name">{{curItem.userName}}</div>
    </div>
    <div class="time">
      <!-- <span>完成课时：{{ computeTime(curItem.finishCourse) }}</span> -->
      <span>完成课时：{{ curItem.finishCourse || 0 }}</span>
      <div>
        <span>考试成绩：{{ curItem.score || 0 }}</span>
        <slot name="detail"></slot>
      </div>
     
    </div>
    <div class="bottom">
      <!-- <div class="info">完成情况：3/5</div> -->
      <div class="status" v-if="curItem.confirm === '0' && (!curItem.userSign && curItem.score)">已确认，参加人待签字</div>
      <div class="status" v-if="curItem.confirm === '1'">待确认</div>
      <slot name="check" v-if="curItem.confirm === '1'"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const emits = defineEmits(['go', 'check']);

  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
    }>(),
    {
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );

  const openDetail = () => {
    
  }

  const curItem = ref(props.item);

  const go = () => {
   emits('go', curItem);
  };

  const check = () => {
   emits('check', curItem);
  };

  const computeTime = (time: number) => {
    let day = Math.floor(time / 3600 / 24);
    let hour = Math.floor((time / 3600) % 24);
    let minute = Math.floor((time / 60) % 60);
    let second = Math.floor(time % 60);
    return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
  };

</script>

<style lang="less" scoped>
  .item {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background-color: #f2f2f2;
    padding: 15px 16px;
    height: auto;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    .top {
      display: flex;
      justify-content: space-between;
    }
    .name {
      font-weight: 600;
    }
    .tag {
      font-size: 12px;
    }
    .online {
      color: #fff;
      background-color: #07c160;
      border-radius: 4px;
      padding: 0 4px;
      height: 16px;
      font-size: 12px;
      display: flex;
      align-items: center;
    }
    .time{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin: 10px 0;
      div{
        display: flex;
        justify-content: space-between;
      }
    }
    .outline {
      background-color: #1890ff;
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      .status {
        color: #ee0a24;
      }
    }
  }
</style>
