<!-- 共用列表项 -->
<template>
  <div class="item">
    <h3>{{ curItem.planName }}</h3>
    <div>执行人：{{ curItem.executePersonName }}</div>
    <div>所属单位：{{ curItem.orgName }}>{{ curItem.departName }}</div>
    <div class="bt"><span>任务时间:{{ curItem.cycleTime }}</span><span class="blue">{{ curItem.checkCycle_dictText }}</span></div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';

  const userStore: any = useUserStore();
  const props = withDefaults(
    defineProps<{
      item: any;
    }>(),
    {
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );
  
  
  const curItem = ref(props.item);
  const emit = defineEmits(['itemClick', 'btnClick']);
  
  userStore.getAllDictItems.yh_inspection_cycle.map((item) => {
    if (item.value == curItem.value.checkCycle) {
      curItem.value['checkCycleName'] = item.text;
    }
  })

</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: auto;
    background: #fff;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    .tag{
      display: inline-block;
      background-color: #f76262;
      color: #fff;
      font-size: 10px;
      border-radius: 4px;
      padding: 0 4px;
      margin-left: 10px;
    }
    .bl{
      background-color: #68b0f8;
    }
    .or{
      background-color: #f7aa36;
    }
    img {
      width: 100%;
      height: 100px;
    }
    .custom-indicator {
      position: absolute;
      right: 5px;
      bottom: 5px;
      padding: 2px 5px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.1);
    }
    .right {
      height: 100%;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-around;
    }
    p {
      font-size: 12px;
      color: #333;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
    }
    .time {
      color: #999;
    }
    .content {
      font-size: 14px;
      word-break: break-all;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .bt{
      display: flex;
      justify-content: space-between;
    }
    .blue{
      margin-left: 10px;
      color: #1989fa;
    }
  }
</style>
