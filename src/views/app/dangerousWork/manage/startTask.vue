<!-- 共用列表项 -->
<template>
  <div class="item">
    <div style="display: flex">
      <span class="tit">{{ detailInfo.workContent }}</span>
      <span
        v-if="detailInfo.highWorkLevel && detailInfo.workType != '8'"
        class="grade"
        :class="
          detailInfo.highWorkLevel == '一级'
            ? 'red'
            : detailInfo.highWorkLevel == '二级'
            ? 'orange'
            : detailInfo.highWorkLevel == '三级'
            ? 'blue'
            : ''
        "
        >{{ detailInfo.highWorkLevel }}</span
      >
      <span v-if="detailInfo.delayedMark" class="delayed">{{ detailInfo.delayedMark }}</span>
      <span v-if="detailInfo.workStopMark" class="delayed">{{ detailInfo.workStopMark }}</span>
      <span v-if="detailInfo.timeoutMark" class="delayed">{{ detailInfo.timeoutMark }}</span>
      <span v-if="detailInfo.workAnalysisMark" class="delayed">{{ detailInfo.workAnalysisMark }}</span>
      <span v-if="detailInfo.checkMark" class="delayed">{{ detailInfo.checkMark }}</span>
    </div>
    <p>编号：{{ detailInfo.workApplyCode }}</p>
    <p>作业类型：{{ detailInfo.workTypeName }}</p>
    <p>申请单位：{{ detailInfo.applicationUnitName }}</p>
    <p v-if="detailInfo.workUnitName">作业车间：{{ detailInfo.workUnitName }}</p>
    <p>申请人：{{ detailInfo.applicantName }}</p>
    <p>申请时间：{{ detailInfo.applicationTimeStr }}</p>
    <p v-if="detailInfo.stateName"
      >状态：<span :class="'tag' + detailInfo.state">{{ detailInfo.stateName }}</span></p
    >
    <p>开始作业时间：{{ time }}</p>
    <div class="btn">
      <slot name="btn"> </slot>
    </div>
  </div>
  <div class="foot">
    <van-button type="primary" @click="ecsSubmit">开始作业</van-button>
  </div>
</template>
<script lang="ts" setup>
  import { getWorkDetail, postStartWork } from '../../../hazardousOperation/api/index';
  import { showSuccessToast } from 'vant';
  import { useRoute } from 'vue-router';
    import dayjs from 'dayjs';
  import { ref } from 'vue';
  const route = useRoute();
  const detailInfo = ref<any>({});
  const loading = ref(false);
  const time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  pageInit();
  async function pageInit() {
    // 获取作业详情
    if (route.query.id) {
      loading.value = true;
      getWorkDetail(route.query.id as string)
        .then((res) => {
          Object.assign(detailInfo.value, res);
          loading.value = false;
        })
        .finally(() => {
          loading.value = false;
        });
    }
  }

  // 开始作业
  const ecsSubmit = () => {
    postStartWork({ workApplyId: detailInfo.value?.id, workExamineId: detailInfo.value?.workExamineId }).then((res) => {
      showSuccessToast('操作成功！');
    });
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
    .red {
      color: rgb(255, 77, 79);
      background-color: #fff1f0;
    }
    .orange {
      color: #faad14;
      background-color: #fffbe6;
    }
    .blue {
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
  .foot {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
