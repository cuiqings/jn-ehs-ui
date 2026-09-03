<template>
  <div class="app-danger-work">
    <div class="sratch-btn" @click="showSearch = true">
      <img src="../../../../assets/images/app/hazardous/filter.png" />
    </div>
    <div ref="pieChart" style="height: 220px"></div>
    <div class="items">
      <div class="item" v-for="item in levelList" @click="levelClick(item.id)" :class="{ active: queryParams.level === item.id }">
        <div class="tit">{{ item.text }}</div>
        <div
          class="num"
          :style="{ color: item.text === '一级' ? '#e94141' : item.text === '二级' ? '#ff8f00' : item.text === '三级' ? '#0b88e3' : '' }"
          >{{ item.value }}</div
        >
      </div>
    </div>
    <div class="list-main">
      <ListEl :list="list" :total="total" ref="listRef" @onLoad="onLoad" @onRefresh="onRefresh" />
    </div>
    <van-popup v-model:show="showSearch" position="top">
      <div class="search-box">
        <div class="item">
          <span class="item-label">时间：</span>
          <div class="value" @click="timeClick">
            <span>{{ queryParams.startTime || '开始时间' }}</span> ~ <span>{{ queryParams.endTime || '结束时间' }}</span>
          </div>
        </div>
        <van-calendar :min-date="minDate" :max-date="maxDate" allow-same-day type="range" v-model:show="showDatePicker" @confirm="onDateConfirm" />
        <div class="item">
          <span class="item-label">单位：</span>
          <div class="value">
            <van-button
              round
              size="small"
              v-for="item in departList"
              :type="queryParams.orgCode === item.orgCode ? 'primary' : 'default'"
              @click="orgClick(item)"
              >{{ item.departName }}</van-button
            >
          </div>
        </div>
        <div class="item">
          <span class="item-label">类型：</span>
          <div class="value">
            <van-button round size="small" :type="queryParams.workType === '' ? 'primary' : 'default'" @click="typeClick('')">全部</van-button>
            <van-button
              round
              size="small"
              v-for="item in work_typeList"
              :type="queryParams.workType === item.value ? 'primary' : 'default'"
              @click="typeClick(item.value)"
              >{{ item.text }}</van-button
            >
          </div>
        </div>
        <div class="item">
          <span class="item-label">状态：</span>
          <div class="value">
            <van-button
              round
              size="small"
              v-for="item in workStatusList"
              :type="queryParams.workStatus === item.value ? 'primary' : 'default'"
              @click="statusClick(item.value)"
              >{{ item.text }}</van-button
            >
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { getRiskWorkData, getRiskWorkList } from '../api';
  import ListEl from '../../components/list.vue';
  import { ref, onMounted, nextTick } from 'vue';
  import { useContent } from '../hooks/useContent';
  import * as echarts from 'echarts';
  import dayjs from 'dayjs';
  const { work_typeList, workStatusList, departList, gradeList, columns, columns2 } = useContent();
  const showSearch = ref(false);
  const queryParams = ref({
    startTime: dayjs().format('YYYY-MM-DD'),
    endTime: dayjs().format('YYYY-MM-DD'),
    orgCode: '',
    workType: '',
    workStatus: '',
    orgName: '',
    level: '',
  });
  const levelList = ref<any[]>([
    { value: '', id: '', text: '作业总数' },
    { value: '0', id: '一级', text: '一级' },
    { value: '0', id: '二级', text: '二级' },
    { value: '0', id: '三级', text: '三级' },
  ]);
  // 日期区间
  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2060, 12, 31);
  const showDatePicker = ref(false);
  const onDateConfirm = (val) => {
    showDatePicker.value = false;
    if (val && val.length === 2) {
      const [start, end] = val;
      queryParams.value.startTime = dayjs(start).format('YYYY-MM-DD');
      queryParams.value.endTime = dayjs(end).format('YYYY-MM-DD');
      initPieChart();
      onRefresh();
    }
  };
  const timeClick = () => {
    showDatePicker.value = true;
  };
  const orgClick = (item) => {
    queryParams.value.orgCode = item.orgCode;
    initPieChart();
    onRefresh();
  };

  const typeClick = (value) => {
    queryParams.value.workType = value;
    initPieChart();
    onRefresh();
  };
  const statusClick = (value) => {
    queryParams.value.workStatus = value;
    onRefresh();
  };

  const levelClick = (id) => {
    queryParams.value.level = id;
    onRefresh();
  };
  const totalData = ref<any>({});
  const pieChart = ref<any>(null);

  async function initPieChart() {
    let res = await getRiskWorkData(queryParams.value);
    totalData.value = res;
    levelList.value.forEach((item) => {
      if (item.text === '一级') {
        item.value = res.totalOne;
      } else if (item.text === '二级') {
        item.value = res.totalTwo;
      } else if (item.text === '三级') {
        item.value = res.totalThree;
      }
      if (item.text === '作业总数') {
        item.value = res.totalOne + res.totalTwo + res.totalThree;
      }
    });
    let pieOption = {
      title: {
        text: '等级分布',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '0%',
        left: 'center',
      },
      series: [
        {
          name: '等级分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          color: ['#e94141', '#ff8f00', '#0b88e3'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: res.totalOne, name: '一级' },
            { value: res.totalTwo, name: '二级' },
            { value: res.totalThree, name: '三级' },
          ],
        },
      ],
    };
    const pie = echarts.init(pieChart.value);
    pie.setOption(pieOption);
  }
  const onLoad = async (params) => {
    let res = await getList(params);
    list.value = [...list.value, ...res];
    nextTick(() => {
      listRef.value.loadEnd();
    });
  };
  const onRefresh = async () => {
    let res = await getList({ pageNo: 1 });
    list.value = res;
    console.log(list.value);
    
    nextTick(() => {
      listRef.value.refreshEnd();
    });
  };
  const total = ref(0);
  const listRef = ref<any>(null);
  const list = ref<any[]>([]);
  async function getList(params = {}) {
    let res = await getRiskWorkList({ ...queryParams.value, ...params });
    total.value = res.total;
    return res.records;
  }

  onMounted(() => {
    initPieChart();
  });
</script>

<style lang="less" scoped>
  .app-danger-work {
    height: 100%;
    padding: 10px;
    overflow: auto;
    .search-box {
      font-size: 12px;
      .item {
        display: flex;
        padding: 10px;
        .item-label {
          width: 45px;
          text-align: left;
        }
        .value {
          flex: 1;
        }
        .van-button {
          margin-right: 10px;
          margin-bottom: 10px;
        }
      }
    }
    .list-main {
    }
    .items {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .item {
        width: 45%;
        height: 65px;
        background-color: #f0f6ff;
        border-radius: 4px;
        margin-bottom: 10px;
        padding: 10px;
        .num {
          color: #636363;
          text-align: center;
          font-size: 16px;
          font-weight: 800;
        }
      }
      .active {
        background-color: #c1daff;
      }
    }
    .sratch-btn {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 999;
      img {
        width: 28px;
        height: 28px;
      }
    }
  }
</style>
