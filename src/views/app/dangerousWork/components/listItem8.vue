<!-- 共用列表项 -->
<template>
  <div class="item" @click="openDetail">
    <p>
      <div style="display: flex;">
      <span class="tit">{{ curItem.workContent }}</span>
      <span v-if="curItem.highWorkLevel && curItem.workType != '8'" class="grade" :class="curItem.highWorkLevel == '一级' ? 'red' : curItem.highWorkLevel == '二级' ? 'orange' : curItem.highWorkLevel == '三级' ? 'blue' : ''">{{ curItem.highWorkLevel }}</span>
      <span v-if="curItem.delayedMark" class="delayed">{{ curItem.delayedMark }}</span>
      <span v-if="curItem.workStopMark" class="delayed">{{ curItem.workStopMark }}</span>
      <span v-if="curItem.timeoutMark" class="delayed">{{ curItem.timeoutMark }}</span>
      <span v-if="curItem.workAnalysisMark" class="delayed">{{ curItem.workAnalysisMark }}</span>
      <span v-if="curItem.checkMark" class="delayed">{{ curItem.checkMark }}</span></div>
    </p>
    <p>编号：{{ curItem.workApplyCode }}</p>
    <p>作业类型：{{ curItem.workTypeName }}</p>
    <p>申请单位：{{ curItem.applicationUnitName }}</p>
    <p v-if="curItem.workUnitName">作业车间：{{ curItem.workUnitName }}</p>
    <p>申请人：{{ curItem.applicantName }}</p>
    <p>申请时间：{{ curItem.applicationTimeStr }}</p>
    <p v-if="curItem.stateName"
      >状态：<span :class="'tag' + curItem.state">{{ curItem.stateName }}</span></p
    >
    <div class="btn">
      <slot name="btn"> </slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
      listType?: number;
    }>(),
    {
      listType: 1, // 1申请 2审批
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );

  const curItem = ref(props.item);
  const { needBtn, btnText, listType } = props;

  const emit = defineEmits(['itemClick', 'btnClick', 'delClick']);

  // 按钮事件
  const edit = (type) => {
    emit('btnClick', type);
  };

  // 删除
  const del = () => {
    emit('delClick');
  };

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };
</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: auto;
    background: #fff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;

    .tit {
      font-size: 14px;
      font-weight: 600;
      word-break: break-all;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .grade {
     display: inline-block;
      font-size: 10px;
      height: 18px;
      padding: 0 6px;
      border-radius: 4px;
      line-height: 16px;
      margin-left: 10px;
      white-space: nowrap;
    }
    .red{
    color: rgb(255, 77, 79);
    background-color: #fff1f0;
  }
  .orange{
    color: #faad14;
    background-color: #fffbe6;
  }
  .blue{
    color: #1890ff;
    background-color: #e6f7ff;
  }


    .custom-indicator {
      color: #fff;
      position: absolute;
      right: 5px;
      bottom: 5px;
      padding: 2px 5px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.3);
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
    }

    .time {
      color: #999;
    }

    .content {
      font-size: 14px;
      word-break: break-all;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .btn {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      :deep(button){
        margin-top: 5px !important;
        display: inline-block;
      }
    }
  }
  .delayed {
    display: inline-block;
    padding: 0px;
    width: 68px;
    font-size: 12px;
    align-items: center;
    border: 1px solid #ee0a24;
    color: #ee0a24;
    border-radius: 4px;
    height: 18px;
    margin-left: 10px;
    line-height: 16px;
    text-align: center;
  }
  .tag3 {
    color: #ee0a24;
  }
</style>
