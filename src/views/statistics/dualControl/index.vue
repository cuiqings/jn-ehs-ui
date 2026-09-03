<template>
  <div class="dual-control">
    <div class="dual-control-header">
      <a-form
        ref="formRef"
        :model="queryParams"
        :label-col="{
          xs: { span: 12 },
          sm: { span: 7 },
        }"
        :wrapper-col="{
          xs: { span: 24 },
          sm: { span: 17 },
        }"
      >
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属单位">
              <a-select
                v-model:value="queryParams.org"
                :options="orgOptions"
                placeholder="请选择"
                allow-clear
                show-search
                :disabled="orgOptions.length === 1"
                :fieldNames="{
                  label: 'departName',
                  value: 'orgCode',
                }"
                @change="orgChange"
                :filter-option="(input: string, option: any) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="所属车间">
              <a-select
                v-model:value="queryParams.depart"
                :options="orgOptions3"
                placeholder="请选择"
                allow-clear
                show-search
                :fieldNames="{
                  label: 'departName',
                  value: 'orgCode',
                }"
                :filter-option="(input: string, option: any) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="统计时间">
              <a-range-picker allow-clear v-model:value="time" value-format="YYYY-MM-DD" @change="handleChange" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-spin tip="Loading..." :spinning="spinning">
      <div class="dual-control-body">
        <a-row :gutter="[24, 24]" justify="center" style="height: 130px">
          <a-col :span="7">
            <div class="flex-space_between">
              <div class="left-box-data">
                <img src="../../../assets/images/risk/point.png" alt="" />
                <div class="right-box-data">
                  <h4 class="check_title">管控风险点</h4>
                  <div class="number">{{ riskNumRes }} <span class="digit">个</span></div>
                </div>
              </div>
              <div class="left-box-data">
                <img src="../../../assets/images/risk/area.png" alt="" />
                <div class="right-box-data">
                  <h4 class="check_title">辨识单元</h4>
                  <div class="number">{{ riskAreaNumRes }} <span class="digit">个</span></div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="7">
            <div class="flex-column">
              <div class="risk-title"> 隐患排查计划 </div>
              <div class="risk-title_right" v-if="yhPlan">
                <div>
                  今日任务
                  <span class="num">{{ yhPlan['今日任务'] }}</span
                  >个
                </div>
                <div>
                  今日完成
                  <span class="num">{{ yhPlan['今日完成'] }}</span
                  >个
                </div>
                <div>
                  完成率<span class="num">{{ yhPlan['完成率'] }}%</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="5">
            <div class="flex-column">
              <div class="risk-title">发现隐患</div>
              <div class="risk-title_right">
                <div
                  >重大隐患<span class="num" style="color: #d9001b; cursor: pointer"> {{ yhFind['重大隐患'] }} </span>个</div
                >
                <div
                  >一般隐患<span class="num" style="cursor: pointer"> {{ yhFind['一般隐患'] }} </span>个</div
                >
              </div>
            </div>
          </a-col>
          <a-col :span="5">
            <div class="flex-column">
              <div class="risk-title double">
                隐患公示
                <div
                  >整改完成率<span>{{ yhCheck['整改完成率'] }}</span
                  >%</div
                >
              </div>
              <div class="risk-title_right">
                <div
                  >未整改<span class="num" style="cursor: pointer"> {{ yhCheck['未整改'] }} </span>个</div
                >
                <div
                  >超期未整改<span class="num" style="color: #d9001b; cursor: pointer" @click="goToPage('6', undefined)">
                    {{ yhCheck['超期未整改'] }} </span
                  >个</div
                >
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 24]" justify="center" style="height: calc((100% - 150px) / 2)">
          <a-col :span="8">
            <a-card title="风险等级分布">
              <div v-if="firstShow" ref="firstChart" class="pie-or-bar-Box"></div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="各单位风险等级分布">
              <div v-if="secondShow" ref="secondChart" class="pie-or-bar-Box"></div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="隐患分类统计">
              <div v-if="sixthShow" ref="sixthChart" class="pie-or-bar-Box"></div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
            </a-card>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 24]" justify="center" style="height: calc((100% - 150px) / 2)">
          <a-col :span="12">
            <a-card title="各单位排查计划与执行结果">
              <div v-if="thirdShow" ref="thirdChart" class="pie-or-bar-Box"></div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="各单位隐患治理情况">
              <div v-if="governanceShow" ref="governanceChart" class="pie-or-bar-Box"></div>
              <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin-top: 14%" />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>
<script lang="ts" name="statistics-dualControl" setup>
  import { ref, onMounted, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { Empty } from 'ant-design-vue';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import {
    statistics15,
    gradeDistribution,
    statistics17,
    statistics6,
    statistics5,
    statistics7,
    skYhStatistics1,
    skYhStatistics2,
    skYhStatistics3,
    ifSecurityByOrg,
  } from './url/index';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
import { offset } from 'highcharts';

  const spinning = ref(true);
  const time: any = ref([dayjs(new Date()).format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')]);
  const queryParams = ref({
    org: undefined,
    depart: undefined,
    startTime: '',
    endTime: '',
  });
  const firstShow = ref(true);
  const secondShow = ref(true);
  const thirdShow = ref(true);
  const governanceShow = ref(true);
  const sixthShow = ref(true);
  const orgOptions: any = ref([]);
  const orgOptions3: any = ref([]);

  const firstChart = ref();
  const secondChart = ref();
  const thirdChart = ref();
  const governanceChart = ref();
  const sixthChart = ref();
  const router = useRouter();
  onMounted(async () => {
    await initStatus();
    await getDepart3ListWithSecurity().then((res) => {
      if (res) {
        if (res.length == 1) {
          queryParams.value.org = res[0].orgCode;
          orgChange(queryParams.value.org);
        }
        orgOptions.value = res;
      } else {
        orgOptions.value = [];
      }
    });
    searchQuery();
  });
  const initialize = async (...promises: Promise<void>[]) => {
    spinning.value = true;
    try {
      await Promise.all(promises);
    } finally {
      spinning.value = false;
    }
  };
  const init = () => {
    initialize(
      firstChartInit(),
      secondChartInit(),
      thirdChartInit(),
      governanceChartInit(),
      sixthChartInit(),
      getData1(),
      getData2(),
      getData3(),
      getData4()
    );
  };
  const iSaf = ref(false);
  const initStatus = () => {
    return ifSecurityByOrg().then((res) => {
      iSaf.value = res;
    });
  };

  const orgChange = (val) => {
    orgOptions3.value = [];
    queryParams.value.depart = undefined;
    selectDeptNew({ orgCode: val }).then((res) => {
      orgOptions3.value = res;
    });
  };
  const yhPlan = ref<any>({});
  const riskNumRes = ref(0);
  const riskAreaNumRes = ref(0);

  const getData1 = async () => {
    return statistics15({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      riskNumRes.value = res['风险点'];
      riskAreaNumRes.value = res['辨识单元'];
    });
  };
  const getData2 = async () => {
    return skYhStatistics1({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      yhPlan.value = res;
    });
  };
  const yhFind = ref<any>({});
  const getData3 = async () => {
    return skYhStatistics2({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      yhFind.value = res;
    });
  };
  const yhCheck = ref<any>({});
  const getData4 = async () => {
    return skYhStatistics3({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      yhCheck.value = res;
    });
  };
  const handleChange = (value) => {
    if (!value) {
      queryParams.value.startTime = '';
      queryParams.value.endTime = '';
    }
  };
  const searchQuery = () => {
    if (time.value) {
      queryParams.value.startTime = time.value[0];
      queryParams.value.endTime = time.value[1];
    }
    init();
  };
  const searchReset = () => {
    time.value = [dayjs(new Date()).format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')];
    Object.assign(queryParams.value, {
      startTime: time.value[0],
      endTime: time.value[1],
      depart: undefined,
      org: orgOptions.value.length == 1 ? orgOptions.value[0].orgCode : undefined,
    });
    orgChange(queryParams.value.org);
    init();
  };

  const goToPage = async(s?, l?) => {
    console.log('goToPage s', s);
    if (l) l = l.toString();
    let pa = {
      // org: queryParams.value.org && queryParams.value.org.length < 6 ? '' : queryParams.value.org,
      // depart: queryParams.value.depart,
      checkTimeBegin: queryParams.value.startTime,
      checkTimeEnd: queryParams.value.endTime,
      yhLevel: l,
      yhStatus: s,
    };
      window['accountQueryParams'] = pa;
     await router.push({
      path: '/daily/hidden/account',
    });
  };

  // 风险等级分布
  const firstChartInit = async () => {
    return gradeDistribution({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      if (res) {
        firstShow.value = true;
        const data = [
          {
            name: '重大风险',
            key: 'zdfx',
            value: 0,
          },
          {
            name: '较大风险',
            key: 'jdfx',
            value: 0,
          },
          {
            name: '一般风险',
            key: 'ybfx',
            value: 0,
          },
          {
            name: '低风险',
            key: 'dfx',
            value: 0,
          },
        ];
        const keys = Object.keys(res);
        keys.forEach((key) => {
          data.forEach((val) => {
            if (val.name === key) {
              val.value = res[key];
            }
          });
        });
        nextTick(() => {
          firstCharts(data);
        });
      } else firstShow.value = false;
    });
  };
  const firstCharts = (data) => {
    const myChart = echarts.init(firstChart.value);
    const option = {
      color: ['#F43328', '#FF8D04', '#f7cf00', '#1F7CF8'],
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c}:\n{d}%',
      },
      legend: {
        x: 'center',
        top: 5,
        bottom: 15,
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['35%', '65%'],
          top: 30,
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
          },
          label: {
            normal: {
              show: true,
              formatter: '{b}：{c}（{d}%） ',
            },
          },
          labelLine: {
            show: true,
          },
          data,
        },
      ],
    };
    myChart.setOption(option);
    myChart.resize();
  };
  // 各部门风险分布
  const secondChartInit = async () => {
    await statistics17({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      if (res) {
        secondShow.value = true;
        let data: any = [];
        let keys: any = [];
        let map = ['低风险', '一般风险', '较大风险', '重大风险'];
        res.forEach((item) => {
          keys.push(item.name);
          let arr = [item.name];
          map.forEach((val) => {
            arr.push(item[val]);
          });
          data.push(arr);
        });
        nextTick(() => {
          secondCharts(data, keys);
        });
      } else secondShow.value = false;
    });
  };
  const secondCharts = (data, xData) => {
    const myChart = echarts.init(secondChart.value);
    const option = {
      color: ['#1F7CF8', '#FFD902', '#FF8D04', '#F43328'],
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        top: 32,
        left: '3%',
        right: '4%',
        bottom: '0%',
        containLabel: true,
      },
      legend: {
        top: 5,
      },
      dataset: {
        source: data,
      },
      xAxis: [
        {
          type: 'category',
          data: xData,
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '低风险',
          type: 'bar',
          barWidth: 20,
          stack: 'total',
          label: {
            show: true,
            position: 'inside',
          },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: '一般风险',
          type: 'bar',
          barWidth: 20,
          stack: 'total',
          label: {
            show: true,
            position: 'inside',
          },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: '较大风险',
          type: 'bar',
          barWidth: 20,
          stack: 'total',
          label: {
            show: true,
            position: 'inside',
          },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: '重大风险',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          label: {
            show: true,
            position: 'top',
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
    myChart.setOption(option);
    myChart.resize();
  };
  // 各单位排查计划与执行结果
  const thirdChartInit = async () => {
    return statistics5({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      if (res) {
        let xAxisData: any = [];
        let data: any = [[], []];
        let total: any = [];
        res.forEach((val: any) => {
          xAxisData.push(val.name);
          data[0].push(val['任务总数']);
          data[1].push(val['完成率']);
          total.push(val['任务总数']);
          total.push(val['完成率']);
        });

        nextTick(() => {
          thirdCharts(data, xAxisData, total);
        });
      } else thirdShow.value = false;
    });
  };
  const thirdCharts = (data, xAxisData, total) => {
    const myChart = echarts.init(thirdChart.value);
    let lMax = computedMax(total);
    const option = {
      color: ['#1F7CF8', '#FF8D04'],
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        top: 28,
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
      },
      legend: {
        bottom: 0,
        data: ['任务总数', '完成率'],
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          alignTicks: true,
          max: lMax,
          interval: lMax / 10,
          splitNumber: 10,
          axisLabel: {
            show: false,
          },
        },
        {
          type: 'value',
          min: -100,
          max: 100,
          interval: 20,
          axisLabel: {
            show: false,
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '任务总数',
          type: 'bar',
          data: data[0],
          yAxisIndex: 0,
          barWidth: '30',
          label: {
            show: true,
            formatter: (params) => (params.value ? params.value : ''),
          },
        },
        {
          name: '完成率',
          type: 'line',
          data: data[1],
          yAxisIndex: 1,
          label: {
            show: true,
            formatter: (params) => (params.value ? params.value + '%' : ''),
          },
        },
      ],
    };
    myChart.setOption(option);
    myChart.resize();
  };

  // 各单位隐患治理情况
  const governanceChartInit = async () => {
    return statistics6({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      if (res) {
        governanceShow.value = true;
        let data: any = [];
        let xAxisData: any = [];
        let map = ['已整改', '未整改', '超期未整改', '整改完成率'];
        let total: any = [];
        res.forEach((val) => {
          let arr: any = [val.name];
          map.forEach((key) => {
            arr.push(val[key]);
            total.push(val[key]);
          });
          xAxisData.push(val.name);
          data.push(arr);
        });
        nextTick(() => {
          governanceCharts(data, xAxisData, total);
        });
      } else governanceShow.value = false;
    });
  };
  const governanceCharts = (data, xAxisData, total) => {
    const myChart = echarts.init(governanceChart.value);
    let lMax = computedMax(total);
    const option = {
      color: ['#87d068', '#F43328', '#FF8D04', '#1F7CF8'],
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        top: 28,
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
      },
      legend: {
        bottom: 0,
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      dataset: {
        source: data,
      },
      yAxis: [
        {
          type: 'value',
          alignTicks: true,
          max: lMax,
          interval: lMax / 10,
          splitNumber: 10,
          axisLabel: {
            show: false,
          },
        },
        {
          type: 'value',
          min: -100,
          max: 100,
          interval: 20,
          axisLabel: {
            show: false,
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '已整改',
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            position: 'insideBottom',
          },
        },
        {
          name: '未整改',
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            position: 'inside',
          },
        },
        {
          name: '超期未整改',
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            position: 'top',
          },
        },
        {
          name: '整改完成率',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              return params.value ? params.value[params.value.length - 1] + '%' : '';
            },
          },
        },
      ],
    };
    myChart.setOption(option);
    myChart.resize();
  };
  function _getMaxValue(arr) {
    const max = Math.max(...arr);
    return Math.ceil(max / 9.5) * 10;
  }
  function _getMinValue(arr) {
    const min = Math.min(...arr);
    return Math.floor(min / 12) * 10;
  }
  // 隐患分类统计
  const sixthChartInit = async () => {
    return statistics7({
      org: queryParams.value.org,
      depart: queryParams.value.depart,
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
    }).then((res) => {
      if (res) {
        let f: any[] = [];
        let fN: number[] = [];
        let c: any[] = [];
        let cN: number[] = [];

        sixthShow.value = true;
        f = res['隐患分类'];
        c = f[0].subList;
        f.forEach((val) => {
          fN.push(val.name);
          val.value = val.number;
        });
        c.forEach((val) => {
          let name = val.name.indexOf('、') > -1 ? val.name.replace(/、/g, '\n') : val.name;
          cN.push(name);
          val.value = val.number;
          val.name = name;
        });
        nextTick(() => {
          sixthCharts(f, fN, c, cN, 0);
        });
      } else {
        sixthCharts([], [], [], [], 0);
        sixthShow.value = true;
      }
    });
  };
  const sixthCharts = (f, _fN, c, _cN, idx) => {
    const myChart = echarts.init(sixthChart.value);
    const option = {
      tooltip: {
        show: true,
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      calculable: true,
      series: [
        {
          name: '隐患类型',
          type: 'pie',
          center: ['25%', '50%'],
          radius: 60,
          data: f,
          label: {
            show: true,
            position: 'top',
          },
          labelLine: {
            length: 5,
            length2: 3
          }
        },
        {
          name: '隐患类型',
          type: 'pie',
          clockWise: true,
          startAngle: 135,
          center: ['70%', '50%'],
          radius: 50,
          data: c,
          label: {
            show: true,
            position: 'outside',
            distanceToLabelLine: 0,
          },
          labelLine: {
            length: 7,
            length2: 5
          }
        },
      ],
    };
    myChart.on('click', function (params:any) {
      c = params.data?.subList;
      let cN: number[] = [];
      c.forEach((val) => {
        let name = val.name.indexOf('、') > -1 ? val.name.replace(/、/g, '\n') : val.name;
        cN.push(name);
        val.value = val.number;
        val.name = name;
      });
      myChart.dispose();
      sixthCharts(f, _fN, c, cN, params.dataIndex);
    });
    myChart.setOption(option);
    myChart.resize();
    myChart.dispatchAction({
        type: 'highlight', // 动作类型：高亮
        seriesIndex: 0, // 系列索引（第一个饼图系列）
        dataIndex: idx // 要高亮的扇区在 data 中的索引
    });
  };
  function computedMax(...data: number[]) {
    let isolationMax = data.flat(Infinity).length > 0 ? Math.max(...data.flat(Infinity)) : 10;
    if (isolationMax === 0) isolationMax = 10;
    isolationMax = Math.ceil(isolationMax / 10) * 10;
    isolationMax = isolationMax + isolationMax / 5;
    return (isolationMax / 5) * 10;
  }
</script>
<style lang="less" scoped>
  * {
    box-sizing: border-box !important;
    user-select: none;
  }
  .dual-control {
    height: calc(100% - 10px);
  }
  .dual-control-header {
    background-color: #fff;
    height: 60px;
    padding: 15px 0;
    margin: 10px;
  }
  .dual-control-body {
    height: 100%;
    /deep/ .ant-row {
      margin-right: 5px !important;
      margin-left: 5px !important;
      margin-bottom: 10px !important;
      .ant-col {
        padding: 0 !important;
        & > div {
          background-color: #fff;
          height: 100%;
          margin: 0 5px;
        }
      }
    }
    /deep/ .ant-card-body {
      padding: 0 !important;
      height: calc(100% - 57.14px);
      & > div {
        height: 100%;
      }
    }
    .flex-space_between {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .left-box-data {
        width: 50%;
        display: flex;
        align-items: center;
        padding: 0 15px;
        justify-content: center;
        img {
          width: 55px;
          height: 55px;
        }
        .right-box-data {
          margin-left: 15px;
          text-align: left;
          .check_title {
            font-size: 16px;
          }
          .number {
            font-size: 25px;
            font-weight: bold;
          }
          .digit {
            font-size: 16px;
          }
        }
      }
    }
    .flex-column {
      flex-direction: column;
      padding: 15px;
      .risk-title {
        font-size: 18px;
        line-height: 28px;
        font-weight: 600;
      }
      .double {
        display: flex;
        justify-content: space-between;
        div {
          font-size: 14px;
          font-weight: normal;
          span {
            font-size: 20px;
            font-weight: 600;
          }
        }
      }
      .risk-title_right {
        width: 100%;
        padding-top: 10px;
        display: flex;
        justify-content: space-around;
        div {
          text-align: center;
          span {
            font-size: 20px;
            font-weight: 600;
          }
        }
      }
    }
    .risk-title_left {
      writing-mode: vertical-lr; /* 将文本从左向右垂直显示 */
      text-orientation: upright; /* 文本方向保持正常 */
      white-space: nowrap; /* 禁止换行 */
      border-right: 1px solid #e8e8e8;
      height: 130px;
      font-size: 16px;
      width: 40px;
      text-align: center;
      line-height: 40px;
      font-weight: 500;
    }
    .risk-title_right {
      width: calc(100% - 40px);
      padding: 0 10px;
      font-size: 15px;
      & > div {
        margin: 10px 0;
        & > div:nth-child(1) {
          margin-left: 15px;
        }
        & > div:nth-child(2) {
          font-size: 14px;
          color: #6666;
          & > span {
            margin: 0 5px;
          }
        }
      }
    }
  }
  /deep/.ant-spin-nested-loading {
    height: calc(100% - 80px);
    .ant-spin-container {
      height: 100%;
    }
  }
  /deep/.ant-empty {
    height: 50% !important;
  }
  .num {
    padding: 0 5px;
  }
</style>
