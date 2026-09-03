<template>
  <div class="report-forms">
    <van-popup v-model:show="show" position="right" :style="{ height: '100%', width: '75%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="show = false" name="cross" />
        </div>
        <van-field
          label-width="60"
          v-model="queryParams.repairDate"
          readonly
          name="repairDate"
          label="统计时间"
          placeholder="统计时间"
          @click="calendarShow = true"
        />

        <van-field
          v-model="queryParams.orgName"
          is-link
          readonly
          label-width="60"
          name="orgName"
          label="所属单位"
          placeholder="点击选择所属机构"
          @click="showPicker = true"
        />

        <van-field
          v-model="queryParams.departName"
          is-link
          readonly
          label-width="60"
          name="departName"
          label="所属车间"
          placeholder="点击选择部门"
          @click="showPicker2 = true"
        />

        <div class="foot">
          <van-button @click="reset">重置</van-button>
          <van-button @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <van-calendar
      :allow-same-day="true"
      :min-date="minDate"
      :max-date="maxDate"
      v-model:show="calendarShow"
      type="range"
      @confirm="onConfirm($event, 'calendar')"
    />
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns-field-names="customFieldName" :columns="orgTree" @confirm="onConfirm($event, 'orgName')" @cancel="showPicker = false" />
    </van-popup>
    <van-popup v-model:show="showPicker2" position="bottom">
      <van-picker
        :columns-field-names="customFieldName"
        :columns="deptTree"
        @confirm="onConfirm($event, 'departName')"
        @cancel="showPicker2 = false"
      />
    </van-popup>
    <div class="search-btn" @click="openSearch">
      <img src="../../../../assets/images/app/hazardous/filter.png" />
    </div>
    <div class="top">
      <Pie ref="pieRef" @click="pieClick" :option="option" height="100%" :chartData="pieChartData" />
    </div>
    <template v-if="route.name == 'AppDangerReportFormsNew'">
      <div class="center">
        <div ref="completeChartRef" style="height: 100%"></div>
      </div>
      <!-- <div class="bottom">
        <div class="title">各类计划完成率</div>
        <div class="content">
          <div class="item" v-for="(item, idx) in circleData" ref="circleRef" :key="idx"> </div>
        </div>
      </div> -->
    </template>

    <template v-else>
      <ListPage ref="listPageRef" :queryParams="queryParams" />
    </template>
    <CurLoading v-if="loading" />
  </div>
</template>

<script lang="ts" setup>
  import { getDepart2List, getDepart3List, statistics1, statistics2, statistics3 } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { getOrgCodeList } from '/@/api/common/api';
  import CurLoading from '../components/loading.vue';
  import { useRoute, useRouter } from 'vue-router';
  import Pie from '/@/components/chart/Pie.vue';
  import { ref, reactive, computed, nextTick, watch } from 'vue';
  import ListPage from './listPage.vue';
  import * as echarts from 'echarts';
  import dayjs from 'dayjs';

  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const show = ref(false);
  const calendarShow = ref(false);
  const showPicker = ref(false);
  const showPicker2 = ref(false);
  const deptTree = ref<{ orgCode: string; departName: string }[]>([]);
  const orgTree = ref<{ orgCode: string; departName: string }[]>([]);
  const pieRef = ref();
  const minDate = ref(new Date(2023, 0, 1));
  const maxDate = ref(new Date());
  const loading = ref(false);
  const listPageRef = ref<InstanceType<typeof ListPage> | null>(null);

  const route = useRoute();
  const router = useRouter();
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };
  const pieChartData = ref<Array<{ name: string; value: string }>>([]);

  watch(route, (n) => {
    if (n.name == 'AppDangerReportFormsNew') {
      pageInit();
    }
  });

  const queryParams = reactive<{
    repairDate: string;
    startDate: string;
    endDate: string;
    org: string | undefined;
    orgName: string;
    depart: string | undefined;
    departName: string;
  }>({
    repairDate: '', // dayjs(new Date()).format('YYYY-MM-DD') + '~' + dayjs(new Date()).format('YYYY-MM-DD'),
    startDate: '', //dayjs(new Date()).format('YYYY-MM-DD'),
    endDate: '', //dayjs(new Date()).format('YYYY-MM-DD'),
    org: '', //userInfo.value.orgCode,
    orgName: '',
    depart: '',
    departName: '',
  });

  const reset = () => {
    Object.assign(queryParams, {
      repairDate: '', // dayjs(new Date()).format('YYYY-MM-DD') + '~' + dayjs(new Date()).format('YYYY-MM-DD'),
      startDate: '', //dayjs(new Date()).format('YYYY-MM-DD'),
      endDate: '', //dayjs(new Date()).format('YYYY-MM-DD'),
      org: '', //userInfo.value.orgCode,
      orgName: '',
      depart: '',
      departName: '',
    });
    if (orgTree.value.length == 1) {
      queryParams.org = orgTree.value[0].orgCode;
      queryParams.orgName = orgTree.value[0].departName;
      getDepart3ListFn(queryParams.org);
    }
  };

  const searchClick = () => {
    show.value = false;
    pageInit();
    if (route.name === 'AppDangerReportFormsPagetwoNew') {
      listPageRef.value?.searchRefresh(queryParams);
    }
  };

  const pageInit = async () => {
    loading.value = true;
    orgTree.value = await getOrgCodeList();
    if (orgTree.value.length == 1) {
      queryParams.org = orgTree.value[0].orgCode;
      queryParams.orgName = orgTree.value[0].departName;
      getDepart3ListFn(queryParams.org);
    }
    Promise.all([statistics1(queryParams), statistics2(queryParams), statistics3(queryParams)]).then((res) => {
      loading.value = false;
      pieChartData.value = [
        {
          name: '未完成',
          value: res[0]['未完成'],
          itemStyle: {
            color: '#e99d43',
          },
        },
        {
          name: '已完成',
          value: res[0]['已完成'],
          itemStyle: {
            color: '#13a74a',
          },
        },
      ];

      if (res[1]) {
        renderComplete(res[1]);
      }
      if (res[2]) {
        rederCircle(res[2]);
      }
    });
  };

  pageInit();

  // 各部门巡检完成情况
  const completeChartRef = ref<HTMLDivElement | null>(null);
  let completeChart;
  function renderComplete(data: any) {
    const xAxisData = [];
    const data1: number[] = [];
    const data2: number[] = [];
    const data3: number[] = [];

    data.map((v) => {
      xAxisData.push(v.name);
      data1.push(v['已巡检']);
      data2.push(v['未巡检']);
      data3.push(v['巡检完成率']);
    });

    const min1 = _getMinValue([...data1, ...data2]);
    const max1 = _getMaxValue([...data1, ...data2]);

    completeChart = echarts.init(completeChartRef.value);
    let option = {
      title: {
        text: '各单位完成情况',
        left: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        bottom: '0%',
        data: ['已巡检', '未巡检', '巡检完成率'],
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      grid: {
        top: 50,
        left: 45,
        bottom: 42,
        right: 45,
      },
      yAxis: [
        {
          type: 'value',
          min: min1,
          max: max1,
          alignTicks: true,
          axisLabel: {
            formatter: '{value} ',
          },
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          alignTicks: true,
          interval: 20,
          axisLabel: {
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '已巡检',
          type: 'bar',
          data: data1,
        },
        {
          name: '未巡检',
          type: 'bar',
          data: data2,
        },
        {
          name: '巡检完成率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (val) {
              if (val.value == 0) {
                return '';
              } else {
                return val.value + ' %';
              }
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: data3,
        },
      ],
    };
    completeChart.setOption(option);
  }

  function _getMaxValue(arr) {
    const max = Math.max(...arr);
    // 这样处理是为了不让最大值刚好到坐标轴最顶部
    return Math.ceil(max / 9.5) * 10;
  }
  function _getMinValue(arr) {
    const min = Math.min(...arr);
    // 这样处理是为了不让最大值刚好到坐标轴最底部
    return Math.floor(min / 12) * 10;
  }

  const option = {
    title: {
      text: '巡检计划统计',
      left: 'left',
    },
    color: ['#13a74a', '#e99d43'],
    grid: {
      left: '3%',
      top: '10%',
      right: '10%',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      bottom: 0,
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        center: ['50%', '55%'],
        data: [],
        labelLine: {
          show: true,
          length: 12,
          length2: 16,
        },
        label: {
          show: true,
          formatter: '{b} \n {c}',
          color: '#B1B9D3',
        },
      },
    ],
  };
  const circleData = ref<string[]>([]);
  const circleRef = ref();
  let colors = [
    ['#00bfbe', '#d3d2d2'],
    ['#0097ec', '#d3d2d2'],
    ['#f69924', '#d3d2d2'],
    ['#00bfbe', '#d3d2d2'],
    ['#0097ec', '#d3d2d2'],
  ];
  function rederCircle(data: any) {
    const itemKey = Object.keys(data);
    circleData.value = itemKey;

    let option = {
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: [],
          label: {
            show: false,
            alignTo: 'edge',
            formatter: '{b}\n{c}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
          },
          labelLine: {
            show: false,
            length: 10,
            length2: 0,
            maxSurfaceAngle: 80,
          },
          center: ['50%', '55%'],
        },
      ],
    };
    itemKey.map((v, i) => {
      let circleChart = null;
      nextTick(() => {
        if (circleRef.value[i]) {
          circleChart = echarts.init(circleRef.value[i]);
        }

        let obj = JSON.parse(JSON.stringify(option));
        obj.title = [
          {
            text: v,
            left: 'center',
            bottom: 0,
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal',
            },
          },
          {
            text: (data[v][3] * 100).toFixed(0) + '%',
            left: 'center',
            top: '47%',
            textStyle: {
              color: colors[i][0],
              fontSize: 14,
              fontWeight: 'normal',
            },
          },
        ];
        obj.textStyle = {
          // color: '#ffffff',
          fontSize: 12,
          rich: {
            name: {
              fontSize: 12,
            },
            num: {
              color: colors[i][0],
              fontSize: 12,
            },
          },
        };
        obj.legend = {
          orient: 'horizontal',
          left: 0,
          itemWidth: 15,
          itemHeight: 15,
          itemGap: 2,
          icon: 'roundRect',
          formatter: (name) => {
            if (name == '完成') return [`{name|完成} {num|${data[v][1]}}`];
            if (name == '未完成') return [`{name|未完成} {num|${data[v][2]}}`];
          },
        };

        obj.series[0].labelLayout = function (params) {
          const isLeft = params.labelRect.x < circleChart.getWidth() / 2; // params.text.indexOf('未') == -1
          const points = params.labelLinePoints;
          // Update the end point.
          if (points && points.length > 0) {
            points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          }
          return {
            labelLinePoints: points,
          };
        };
        obj.series[0].data = [
          {
            value: data[v][1],
            name: '完成',
          },
          {
            value: data[v][2],
            name: '未完成',
          },
        ];
        // obj.series[0].label.textStyle.color = colors[i];
        obj.series[0].color = colors[i];
        circleChart.setOption(obj);
      });
    });
  }

  // 跳转到列表页
  const pieClick = (e) => {
    if (route.name == 'AppDangerReportFormsPagetwoNew') return;
    let idx = e.name == '未完成' ? 1 : 2;
    router.push({
      path: '/app/hiddenDangerNew/reportForms/pagetwo',
      query: { idx },
    });
  };

  const onConfirm = (value: any, type) => {
    if (type == 'calendar') {
      console.log(value);
      queryParams.repairDate = dayjs(value[0]).format('YYYY-MM-DD') + '~' + dayjs(value[1]).format('YYYY-MM-DD');
      queryParams.startDate = dayjs(value[0]).format('YYYY-MM-DD');
      queryParams.endDate = dayjs(value[1]).format('YYYY-MM-DD');
      calendarShow.value = false;
    } else if (type == 'orgName') {
      queryParams.org = value.selectedOptions[0].orgCode;
      queryParams.orgName = value.selectedOptions[0].departName;
      queryParams.depart = '';
      queryParams.departName = '';
      getDepart3ListFn(queryParams.org);
      showPicker.value = false;
    } else {
      queryParams.depart = value.selectedOptions[0].orgCode;
      queryParams.departName = value.selectedOptions[0].departName;
      showPicker2.value = false;
    }
  };

  const openSearch = () => {
    show.value = true;
  };

  function getDepart3ListFn(code) {
    getDepart3List({ orgCode: code }).then((res) => {
      if (res.length > 1) {
        res.unshift({
          departName: '全部',
          orgCode: '',
        });
      }
      deptTree.value = res;
      // if (queryParams.depart) {
      //   deptTree.value.map((val) => {
      //     if (val.orgCode == queryParams.depart) {
      //       queryParams.depart = val.orgCode;
      //       queryParams.departName = val.departName;
      //     }
      //   });
      // }
    });
  }
</script>

<style lang="less" scoped>
  .report-forms {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;

    .search-box {
      height: 100%;
      position: relative;

      .foot {
        margin-top: 30px;
        width: 100%;
        padding: 10px 16px;
        display: flex;
        justify-content: space-around;
      }
    }

    .top {
      width: 100%;
      height: 280px;
      background-color: #fff;
      padding: 10px;
      margin-bottom: 15px;
    }

    .center {
      width: 100%;
      height: 280px;
      background-color: #ffffff;
      padding: 10px;
      margin-bottom: 15px;
    }

    .bottom {
      width: 100%;
      padding: 10px;
      background-color: #fff;

      .title {
        height: 40px;
        font-size: 16px;
        font-weight: 800;
        text-align: left;
      }

      .content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;

        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 30%;
          height: 38vw;
        }
      }
    }

    .search-btn {
      position: absolute;
      right: 10px;
      top: 8px;
      z-index: 999;

      img {
        width: 28px;
        height: 28px;
      }
    }

    .hd {
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
    }
  }
</style>
