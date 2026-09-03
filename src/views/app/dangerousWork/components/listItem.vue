<!-- 共用列表项 -->
<template>
  <div class="item" :class="{'hold': ['3', '7'].includes(curItem.workState) && dayjs(new Date()).isAfter(curItem.workEndTime)}" @click="openDetail">
    <p class="title">
      <div style="display: flex;" class="tags">
        <span class="tit" :style="{paddingRight: isUnhazardousWork ? '50PX' : 0}">{{ curItem.workContent }}</span>
        <span v-if="curItem.workGrade" class="grade" :class="curItem.workGrade == '一级' ? 'red' : curItem.workGrade == '二级' ? 'orange' : curItem.workGrade == '三级' ? 'blue' : ''">{{ curItem.workGrade }}</span>
        <span v-if="curItem.delayedMark" class="delayed">{{ curItem.delayedMark }}</span>
        <!-- <span v-if="curItem.workStopMark" class="delayed">{{ curItem.workStopMark }}</span> -->
        <span v-if="curItem.timeoutMark" class="delayed">{{ curItem.timeoutMark }}</span>
        <span v-if="curItem.workAnalysisMark" class="delayed">{{ curItem.workAnalysisMark }}</span>
        <span v-if="curItem.checkMark" class="delayed">{{ curItem.checkMark }}</span>
        <span v-if="curItem.reformNum && curItem.reformNum > 0" style="display: inline-block; margin-left: 5px; color: #ff4d4f;"
          >待整改({{ curItem.reformNum }})</span>
        <span v-if="['3', '7'].includes(curItem.workState) && dayjs(new Date()).isAfter(item.workEndTime)" class="holdtag" style="display: inline-block; margin-left: 5px; color: #ff4d4f;background-color: rgba(255, 77, 79, 0.1);"
          >待验收</span>
      </div>
      <slot name="del"> </slot>
    </p>
    <p>编号：{{ curItem.workApplyCode }}</p>
    <p>申请单位：{{ curItem.applicationUnitName }}</p>
    <p v-if="curItem.workOrgCodeName">生产单位：{{ curItem.workOrgCodeName }}</p>
    <p v-if="curItem.workUnitName">作业车间：{{ curItem.workUnitName }}</p>
    <p> 作业类型：{{ curItem.workTypeName }}</p>
    <p> 作业地点：{{ curItem.workLocation }}</p>
    <p>计划作业时间：{{ curItem.workStartTime }}</p>
    <p v-if="curItem.workTime && !['1', '2', '4', '5', '7'].includes(curItem.workState)"> 开始时间：{{ curItem.workTime }}</p>
    <p v-if="['3', '5'].includes(curItem.workState)">待检查：
      <template v-for="(item, idx) in setCheckRole(item.checkRole)" :key="idx">
        <span style="color: #b7eb8f; padding-right: 5px" v-if="item.status">{{ item.text }}</span>
        <span style="color: #ff4d4f; padding-right: 5px" v-else>{{ item.text }}</span>
      </template>
    </p>
    <p v-if="curItem.workState == '4'"> 发起验收时间：{{ curItem.workTime }}</p>
    <p v-if="curItem.workState == '5'"> 完结验收时间：{{ curItem.workFinishTime }}</p>
    <p v-if="curItem.stateName"
      >状态：<span :class="'tag' + curItem.state">{{ curItem.stateName }}</span></p
    >
    <div class="oneline" style="color: #ff4d4f" :title="curItem.workBackReason" v-if="curItem.workState == 3 && curItem.workBackReason">
      <span style="color: rgba(0, 0, 0, 0.85)">验收退回：</span><span>{{ curItem.workBackReason }}</span>
    </div>
    <p v-if="curItem.reason && curItem.workState == '7'"
      >中断原因：<span style="color:#ff4d4f;">{{ curItem.reason }}</span></p
    >
    <p v-if="curItem.workState == '7'"
      >中断时间：<span>{{ curItem.stopTime }}</span></p
    >
    
    <div class="btn">
      <slot name="btn"> </slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import dayjs from 'dayjs';

  const route = useRoute();
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
  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkManage';
  });

  const emit = defineEmits(['itemClick', 'btnClick']);

  // 按钮事件
  const edit = (type) => {
    emit('btnClick', type);
  };

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };
   
  const setCheckRole = (role) => {
    const statusmaps = [
      { text: '安全部', status: false, id: '1' },
      { text: '副部长', status: false, id: '2' },
      { text: '安全科长', status: false, id: '6' },
      { text: '安全科', status: false, id: '3' },
      { text: '车间主任', status: false, id: '4' },
      { text: '班组长', status: false, id: '5' },
    ];
    let res = statusmaps.map((v) => {
      if (!role.includes(v.id)) {
        v.status = true;
      }
      return v;
    });
    return res;
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
    .title{
      display: flex;
      justify-content: space-between;
    }
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
      :deep(button) {
        margin-top: 5px !important;
        display: inline-block;
      }
    }
  }
  .hold{
    box-shadow: inset 5px 5px 5px rgba(255, 77, 79, 0.3), inset -5px -5px 5px rgba(255, 77, 79, 0.3);
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
    white-space: nowrap;
  }
  .tag3 {
    color: #ee0a24;
  }
  .tags {
    width: 100%;
    position: relative;
    align-items: center !important;
    .holdtag{
      position: absolute;
      right: 0;
      top: 0px;
    }
    span{
      border-radius: 4px;
      font-size: 12px;
      padding: 0 5px;
    }
  }
</style>
