<!-- 共用列表 -->
<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <div class="item" v-for="(item, index) in list" :key="item.id+index">
        <p class="title">
          <div class="title-content">
            <div class="title-content-left">
              <span class="tit">{{ item.workContent }}</span>
              <span v-if="item.highWorkLevel" class="grade" :class="item.highWorkLevel == '一级' ? 'red' : item.highWorkLevel == '二级' ? 'orange' : item.highWorkLevel == '三级' ? 'blue' : ''">{{ item.highWorkLevel }}</span>
              <span v-if="item.checkMark" class="delayed">{{ item.checkMark }}</span>
            </div>
            <span class="work-state" :class="item.workState == '待作业' ? 'work-state-1' : item.workState == '作业中' ? 'work-state-2' : item.workState == '作业中断' ? 'work-state-3' : item.workState == '已验收' ? 'work-state-4' : ''"
              >{{ item.workState }}</span
            >
          </div>
        </p>
      <p>编号：{{ item.workApplyCode }}</p>
      <p>申请单位：{{ item.applicationUnit }}</p>
      <p v-if="item.workUnitName">申请车间：{{ item.workUnit }}</p>
      <p> 作业类型：{{ item.workType }}</p>
      <p> 作业负责人：{{ item.compiler }}</p>
      <p> 监护人：{{ item.guardian }}</p>
      <p v-if="item.workTime && !['1', '2', '4', '5', '7'].includes(item.workState)"> 作业时间：{{ item.workTime }}</p>
      <div class="btn">
        <van-button type="primary" size="mini" @click.stop="openDetail(item)">查看详情</van-button>
      </div>
    </div>
    </van-list>
  </van-pull-refresh>
</template>
<script lang="ts" setup>
  import { ref, toRef } from 'vue';
  import { useRouter } from 'vue-router';
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(0);
  const pageSize = ref(10);
  const router = useRouter();
  const emits = defineEmits<{
    (e: 'onRefresh', params: any): void;
    (e: 'onLoad', params: any): void;
    (e: 'openDetail', item: any): void;
    (e: 'edit', item: any): void;
    (e: 'del', item: any): void;
  }>();

  const props = withDefaults(
    defineProps<{
      list: any[];
      total: number;
    }>(),
    {}
  );

  const list = toRef(props, 'list');
  const total = toRef(props, 'total');

  // 下拉刷新
  const onRefresh = () => {
    pageNo.value = 1;
    finished.value = false;
    emits('onRefresh', { pageNo: pageNo.value, pageSize: pageSize.value });
  };

  // 上拉加载
  const onLoad = () => {
    pageNo.value += 1;
    emits('onLoad', { pageNo: pageNo.value, pageSize: pageSize.value });
  };

  // 加载状态结束
  const loadEnd = () => {
    loading.value = false;
    console.log(list.value.length, 'total:', total.value);
    if (list.value.length >= total.value) {
      finished.value = true;
    } else {
      finished.value = false;
    }
  };

  // 刷新状态结束
  const refreshEnd = () => {
    refreshing.value = false;
    if (list.value.length < total.value) {
      finished.value = false;
    }
    if (list.value.length >= total.value) {
      finished.value = true;
    }
  };

  // item点击事件
const openDetail = (item) => {
    console.log(item);
    
    router.push({
      path: `/app/dangerousWork/detail`,
      query: { id: item.id, workType: item.workType, pageType: 'detail' }
    });
  };

  // 按钮点击事件
  const edit = (item) => {
    emits('edit', item);
  };

  const del = (item) => {
    emits('del', item);
};

const setCheckRole = (item) => {
  const role = item.checkRole;
    const statusmaps = [
      { text: '安全部', status: false, id: '1' },
      { text: '副部长', status: false, id: '2' },
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
    console.log(res);
    return res;
  };

  defineExpose({
    loadEnd,
    refreshEnd,
  });
</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: auto;
    background: #f5f5f5;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    .title{
      display: flex;
      justify-content: space-between;
    }
    .title-content-left{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title-content{
      width: 100%;
      display: flex;
      align-items: center;
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
    .work-state{
      display: inline-block;
      margin-left: 5px;
      color: #ffffff;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 12px;
      background-color: #b4b4b4;
      white-space: nowrap;
    }
    .work-state-1{
      background-color: #faad14;
    }
    .work-state-2{
      background-color: #1890ff;
    }
    .work-state-3{
      background-color: #ff4d4f;
    }
    .work-state-4{
      background-color: #389e0d;
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
      justify-content: flex-end;
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
</style>
