<template>
  <div class="hiddendanger" v-loading="loading">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="进行中" name="1">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total1"
            ref="listRef1"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="未开始" name="2">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="已完成" name="3">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total3"
            :needBtn="false"
            ref="listRef3"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list3"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="" disabled name="4"></van-tab>
    </van-tabs>
  </div>
  <span id="search-btn" @click="toSearch">筛选</span>
  <van-popup v-model:show="show" position="right" :style="{ height: '100%', width: '70%' }">
    <div class="search-main">
      <h1>筛选</h1>
      <van-form @submit="onSearch" ref="searchForm">
        <van-field v-model="searchData.taskName" name="taskName" label="任务名称：" placeholder="请输入" />
        <van-field readonly v-model="searchData.trainTypeName" name="trainType" label="培训方式：" placeholder="请选择" @click="showPicker = true" />
        <van-field
          v-model="searchData.taskStrTime"
          label="培训开始时间："
          label-align="top"
          right-icon="notes-o"
          readonly
          placeholder="请选择"
          @click="startShow = true"
        />
        <van-field
          v-model="searchData.taskEndTime"
          label="培训结束时间："
          label-align="top"
          right-icon="notes-o"
          readonly
          placeholder="请选择"
          @click="endShow = true"
        />
      </van-form>
      <div class="s-foot">
        <van-button type="default" @click="reset">重置</van-button>
        <van-button type="primary" @click="onSearch">搜索</van-button>
      </div>
    </div>
  </van-popup>
  <van-popup v-model:show="showPicker" round position="bottom">
    <van-picker :columns="columns" @cancel="showPicker = false" @confirm="onConfirm" />
  </van-popup>
  <AppDateTimePicker
    @changeValue="startShow = false"
    :miniTime="miniTime"
    :showPicker="startShow"
    @confirm="calendarConfirm($event, 'taskStrTime')"
  />
  <AppDateTimePicker @changeValue="endShow = false" :showPicker="endShow" @confirm="calendarConfirm($event, 'taskEndTime')" />
</template>
<script lang="ts" setup>
  import { ref, nextTick, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { teacherPageList } from '../../index.api';
  import List from '../components/list.vue';
  import { useAppStore } from '/@/store/modules/app';
  import AppDateTimePicker from '../../../components/appDateTimePicker.vue';
  import dayjs from 'dayjs';

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);
  const show = ref(false);
  const searchForm = ref(null);

  const router = useRouter();
  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  const loading = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef1 = ref();
  const listRef2 = ref();
  const listRef3 = ref();
  const total1 = ref(0);
  const total2 = ref(0);
  const total3 = ref(0);
  // 搜索开始
  const searchData = ref({
    taskName: '',
    trainType: '',
    trainTypeName: '',
    taskStrTime: '',
    taskEndTime: '',
  });

  const showPicker = ref(false);
  const columns = [
    { text: '线上', value: '1' },
    { text: '线下', value: '2' },
  ];
  const onConfirm = (e) => {
    searchData.value.trainType = e.selectedOptions[0].value;
    searchData.value.trainTypeName = e.selectedOptions[0].text;
    showPicker.value = false;
  };

  const startShow = ref(false);
  const endShow = ref(false);
  const miniTime = ref(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'));

  const calendarConfirm = (val: any, key) => {
    searchData.value[key] = val;
    startShow.value = false;
    endShow.value = false;
  };

  const toSearch = () => {
    show.value = true;
  };

  const onSearch = () => {
    show.value = false;
    onRefresh(searchData.value);
  };

  const reset = () => {
    searchData.value = {
      taskName: '',
      trainType: '',
      trainTypeName: '',
      taskStrTime: '',
      taskEndTime: '',
    };
  };

  // 搜索结束

  const onRefresh = async (params) => {
    const res = await getList(params).finally(() => {
      loading.value = false;
      if (active.value == '1') {
        nextTick(() => {
          listRef1.value.refreshEnd();
        });
      } else if (active.value == '2') {
        nextTick(() => {
          listRef2.value.refreshEnd();
        });
      } else {
        nextTick(() => {
          listRef3.value.refreshEnd();
        });
      }
    });
    if (active.value == '1') {
      list.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    } else if (active.value == '2') {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    } else {
      list3.value = res.records;
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.refreshEnd();
      });
    }
  };

  const onLoad = async (params) => {
    const res = await getList(params).finally(() => {
      loading.value = false;
      if (active.value == '1') {
        nextTick(() => {
          listRef1.value.loadEnd();
        });
      } else if (active.value == '2') {
        nextTick(() => {
          listRef2.value.loadEnd();
        });
      } else {
        nextTick(() => {
          listRef3.value.loadEnd();
        });
      }
    });
    if (active.value == '1') {
      list.value = [...list.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else if (active.value == '2') {
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    } else {
      list3.value = [...list3.value, ...res.records];
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.loadEnd();
      });
    }
  };

  watch(
    () => router,
    (n) => {
      active.value = activeIdx.value + '';
    },
    { immediate: true, deep: true }
  );

  onMounted(() => {
    // 首次加载列表
    onLoad({});
  });

  const tabChange = (e) => {
    if (e == '1' && list.value.length == 0) {
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      onRefresh({});
    }
    if (e == '3' && list3.value.length == 0) {
      onRefresh({});
    }
  };

  function getList(params?) {
    loading.value = true;
    return teacherPageList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      status: active.value == '1' ? '2' : active.value == '2' ? '1' : active.value,
      ...searchData.value,
      ...params,
    });
  }

  // 卡片跳转
  const openDetail = (item) => {
    let query = { id: item.id, sourceType: 2 };
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/teacher/taskDetail', query: query });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;

    .tab-inner {
      height: calc(100vh - 44px);
      overflow-y: scroll;
      padding: 10px 15px;
    }
  }
  #search-btn {
    color: #1989fa;
    position: absolute;
    top: 12px;
    right: 25px;
  }
  .search-main {
    padding: 10px 0px;
    h1 {
      font-size: 16px;
      font-weight: bold;
      padding-left: 15px;
    }
    .s-foot {
      margin-top: 50px;
      display: flex;
      justify-content: space-around;
    }
  }
</style>
