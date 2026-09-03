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
          <a-col :span="6" v-for="item in list" :key="item.id">
            <a-card class="fixed-height-card" @click="goDetail(item)">
              <div class="item">
                <div class="top">
                  <span class="tag" :class="{ing: item.status == '进行中'}">{{ item.status }}</span>
                  截止日期：{{ item.taskEndTime }}
                </div>
                <div class="name">{{ item.taskName }}</div>
                <div class="gress" :class="{high: ['进行中', '已结束'].includes(item.status)}">
                  <div class="bar"><span :style="{ width: item.finishRate + '%' }"></span></div>{{item.finishRate + '%'}}
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
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
  </div>
  <TriningDetail @register="register" @cancel="getList" />
</template>
<script setup name="student-myTrining" lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { trainPageList } from '/@/views/app/educationTraining/index.api';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import TriningDetail from './triningDetail.vue';
  import { useDrawer } from '/@/components/Drawer';
  const [register, { openDrawer }] = useDrawer();
  const router = useRouter();
  const current = ref<number>(1);
  const pageSize = ref<number>(16);
  const total = ref<number>(0);
  const activeKey = ref('0');
  const handleTabChange = (idx) => {
    activeKey.value = idx;
    getList();
  };
  const loading = ref(false);

  const list = ref<any[]>([]);
  const getList = async () => {
    loading.value = true;
    const res = await trainPageList({
      pageNo: current.value,
      pageSize: pageSize.value,
      status: activeKey.value,
    });
    loading.value = false;
    list.value = res.records;
    total.value = res.total;
  };
  getList();

  const goDetail = (item) => {
    openDrawer(true, item);
    // router.push(`/student/myTriningDetail?id=${id}`)
  };

  // 页数和条数变化
  const pageSizeChange = (page: any, pageSize: any) => {
    // getList({ ...formState, state: state.value, pageNo: page, pageSize: pageSize });
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
          margin-bottom: -1px;
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
      margin-bottom: 10px;
      .name {
        width: 100%;
        line-height: 32px;
        font-weight: 800;
        font-size: 16px;
        padding: 10px 0;
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
      .high{
        color: #1890ff;
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
    }
    .fixed-height-card {
      cursor: pointer;
      border-radius: 7px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    }
  }
</style>
