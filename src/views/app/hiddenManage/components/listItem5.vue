<!-- 共用列表项 -->
<template>
    <div class="item" @click="openDetail">
      <div>所属单位：{{ curItem.orgName }}</div>
      <div>所属车间：{{ curItem.departName }}</div>
      <div class="title">{{ curItem.planName }}</div>
      <div>排查周期：{{ curItem.checkCycle_dictText }}</div>
      <div class="tag">
        <van-tag v-if="curItem.useFlag == 1" type="success">启用</van-tag>
        <van-tag v-else-if="curItem.useFlag == 0" type="danger">停用</van-tag>
      </div>
      <div class="btn">
        <van-button type="primary" size="small" v-auth="'yh:dc_check_plan:edit'" @click.stop="edit">编辑</van-button>
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
  