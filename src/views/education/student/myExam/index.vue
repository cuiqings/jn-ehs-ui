<template>
  <div class="newsUserTraining">
    <div class="newsUserTraining-tabs">
      <div>
        <div :class="activeKey === '0' ? 'active' : ''" @click="handleTabChange('0')">全部任务</div>
        <div :class="activeKey === '1' ? 'active' : ''" @click="handleTabChange('1')">未开始</div>
        <div :class="activeKey === '2' ? 'active' : ''" @click="handleTabChange('2')">进行中</div>
        <div :class="activeKey === '3' ? 'active' : ''" @click="handleTabChange('3')">已结束</div>
      </div>
    </div>
    <div class="list" v-loading="loading">
      <div class="items">
        <a-row :span="24" :gutter="[20, 10]" style="background-color: #ffffff; margin: 0px 0; padding: 10px">
          <a-col :span="6" v-for="item in list" :key="item.taskId">
            <a-card class="fixed-height-card">
              <div class="item">
                <div class="top">
                  <div>
                    <span class="tag" :class="{ ing: item.taskStatus === '进行中', hold: item.taskStatus === '未开始' }">{{ item.taskStatus }}</span>
                    <span class="time">截止日期：{{ item.endTime }}</span>
                  </div>

                  <span v-if="item.examStatus" class="tag tag2" :class="{ ing: item.examStatus == '合格' }">{{ item.examStatus }}</span>
                </div>
                <div class="name" :title="item.taskName">{{ item.taskName }}</div>
                <div class="bottom">
                  <a-space :size="12">
                    <a-button v-if="!['未开始', '已结束'].includes(item.taskStatus)" size="default" @click="openExamModal(item)" type="primary">开始考试</a-button>
                    <a-button v-if="item.taskStatus === '已结束'" size="default" @click="openRecord(item)" type="default">考试记录</a-button>
                  </a-space>
                </div>
              </div>
            </a-card></a-col
          ></a-row
        >
      </div>
      <div style="margin: 10px; text-align: right; height: 50px">
        <pagination
          v-model:current="current"
          v-model:page-size="pageSize"
          :total="total"
          show-quick-jumper
          showSizeChanger
          :pageSizeOptions="['16', '32', '80', '160', '480']"
          @change="pageSizeChange"
          :defaultPageSize="pageSize"
          :show-total="(total: number) => `共${total}条记录 第${current}/${Math.ceil(total / pageSize)}页`"
        />
      </div>
    </div>
    <StartExam @register="register" />
    <ExamRecord @register="registerRecord" />
  </div>
</template>
<script setup name="myTrining" lang="ts">
  import StartExam from '../components/startExam.vue';
  import ExamRecord from '../components/examRecord.vue';
  import { Pagination } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { examPageList } from '/@/views/app/educationTraining/index.api';
  import { ref } from 'vue';
  const [register, { openModal }] = useModal();
  const [registerRecord, { openModal: openModalRecord }] = useModal();
  const current = ref<number>(1);
  const pageSize = ref<number>(16);
  const total = ref<number>(0);
  const activeKey = ref('0');
  const handleTabChange = (idx) => {
    activeKey.value = idx;
    getList();
  };
  const loading = ref(false);

  const pageInit = () => {
    getList();
  };
  const list = ref<any[]>([]);
  const getList = async () => {
    loading.value = true;
    const res = await examPageList({
      pageNo: current.value,
      pageSize: pageSize.value,
      status: activeKey.value,
    });
    loading.value = false;
    list.value = res.records;
    total.value = res.total;
  };
  pageInit();

  // 页数和条数变化
  const pageSizeChange = (page: any, pageSize: any) => {
    getList();
  };

  const openExamModal = (item) => {
    openModal(true, { ...item, source: 1 });
  };
  const openRecord = (item) => {
    openModalRecord(true, { ...item, source: 1 });
  };
</script>
<style lang="less" scoped>
  .newsUserTraining {
    width: 100%;
    height: 100%;
    .list {
      width: 100%;
      height: calc(100% - 65px);
      padding: 0 0px;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      .items {
        flex: 1;
      }
    }
    .newsUserTraining-tabs {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      padding-bottom: 0;
      background-color: #fff;
      border-bottom: 1px solid #f0f0f0;
      & > div:nth-child(1) {
        display: flex;
        div {
          width: 104px;
          text-align: center;
          margin-right: 10px;
          background-color: #fafafa;
          border: 1px solid #f0f0f0;
          font-size: 16px;
          color: #666;
          padding: 7px 0px;
          border-radius: 2px 2px 0 0;
          cursor: pointer;
          position: relative;
          z-index: 999;
          margin-bottom: -2px;
        }
        .active {
          color: #1890ff;
          background-color: #fff;
          font-weight: normal;
          border-bottom-color: #fff;
        }
        & > div:nth-child(1) {
          margin-right: 10px;
        }
      }
    }
    .item {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: auto;
      border-radius: 4px;
      position: relative;
      user-select: none;
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .time {
        font-size: 14px;
        padding-left: 10px;
      }
      .name {
        width: 100%;
        line-height: 32px;
        font-weight: 800;
        font-size: 16px;
        padding: 10px 0;
        height: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        word-break: break-all;
      }
      .gress {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .bar {
          width: calc(100% - 60px);
          height: 10px;
          margin-right: 10px;
          background-color: #d7d7d7;
          border-radius: 5px;
          overflow: hidden;
          display: flex;
          span {
            display: block;
            height: 100%;
            background-color: #1890ff;
          }
        }
      }
      .tag {
        font-size: 12px;
        padding: 5px 8px;
        border-radius: 4px;
        border: 1px solid transparent;
        background-color: rgb(239, 239, 239);
      }
      .ing {
        border: 1px solid #b7eb8f;
        background-color: #f6ffed;
        color: #389e0d;
      }
      .hold {
        border: 1px solid #1890ff;
        background-color: #dceeff;
        color: #1890ff;
      }
      .bottom {
        display: flex;
        justify-content: flex-end;
        height: 32px;
      }
      .tag2 {
        padding: 0px 5px;
      }
    }
    .fixed-height-card {
      border-radius: 7px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
      :deep(.ant-card-body) {
        padding: 24px 16px;
      }
    }
  }
</style>
