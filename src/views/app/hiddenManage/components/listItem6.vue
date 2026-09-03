<!-- 共用列表项 -->
<template>
    <div class="item" @click="openDetail">
      <div>检查类型：
        <!-- 3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查 8重大风险管控措施检查 -->
        <span v-if="curItem.checkType == '3'">综合检查</span>
        <span v-if="curItem.checkType == '4'">季节性检查</span>
        <span v-if="curItem.checkType == '5'">节假日检查</span>
        <span v-if="curItem.checkType == '6'">专项检查</span>
        <span v-if="curItem.checkType == '7'">重大事故隐患检查</span>
        <span v-if="curItem.checkType == '8'">重大风险管控措施检查</span>
      </div>
      <div style="font-weight: bold;">{{ curItem.taskName }}</div>
      <div>任务时间：{{ curItem.taskTimeStart }} ~ {{ curItem.taskTimeEnd }}</div>
      <div class="btn" v-if="curItem.canApprovePlan">
        <van-button type="primary" size="small" v-auth="'yh:special_check:approval'" @click.stop="edit">审批</van-button>
      </div>
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
   // item卡片事件
   const openDetail = () => {
    emit('itemClick');
  };
 // 按钮事件
 const edit = () => {
    emit('btnClick');
  };

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
      position: relative;
      .tag{
        position: absolute;
        right: 10px;
        top: 10px;
      }
      .title{
        font-weight: bold;
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
        position: absolute;
        right: 10px;
        bottom: 10px;
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
  