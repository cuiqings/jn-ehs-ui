<template>
  <div class="jobAccounting">
    <div class="header">
      <BasicForm @register="registerForm" @submit="onSearch" @reset="resetForm" />
    </div>
    <div class="inner">
      <div class="chart">
        <div class="hd">
          <div v-if="pageType !== 'org'"></div>
          <div class="left" v-if="pageType === 'org'">
            <a-checkbox @change="changeChecked" v-model:checked="queryParams.checked">显示职能部室</a-checkbox>
            <div class="back-btn" @click="back" v-if="firstLevel == 2">
              <img src="../../../assets/images/back-s.png" alt="" />
            </div>
          </div>
          <div class="right">
            <div class="table">
              <div class="r-l"> 总计 </div>
              <ul>
                <li>
                  <span>{{ oneData[0] }}</span>
                  <span>{{ oneData[1] }}</span>
                  <span>{{ oneData[2] }}%</span>
                </li>
                <li> <span>培训人次</span><span>合格人次</span><span>合格率</span> </li>
              </ul>
            </div>
          </div>
        </div>
        <LineBar ref="lineBarRef1" :loading="loading1" />
      </div>
      <div class="chart gary">
        <div class="hd">
          <div class="back-btn">
            <img src="../../../assets/images/back-s.png" @click="back2" alt="" v-show="firstLevel2 == 2" />
          </div>
          <div class="right">
            <div class="table">
              <div class="r-l"> 总计 </div>
              <ul>
                <li>
                  <span>{{ twoData[0] }}</span>
                  <span>{{ twoData[1] }}</span>
                  <span>{{ twoData[2] }}%</span>
                </li>
                <li> <span>培训人次</span><span>合格人次</span><span>合格率</span> </li>
              </ul>
            </div>
          </div>
        </div>
        <LineBar ref="lineBarRef2" :loading="loading2" />
      </div>
      <div class="chart" style="padding-top: 10px">
        <div class="hd hd3">
          <div class="back-btn"> </div>

          <div class="center">
            <ul class="tab" :class="{ active2: tabActiveKey == 2 }">
              <li :class="{ active: tabActiveKey == 1 }" @click="tabClick(1)">参与率</li>
              <li :class="{ active: tabActiveKey == 2 }" @click="tabClick(2)">合格率</li>
            </ul>
            <div class="title">{{ lineBarRef3Title }}</div>
          </div>
          <div class="table">
            <div class="r-l"> 总计 </div>
            <ul>
              <li>
                <span>{{ threeData[0] }}</span>
                <span>{{ threeData[1] }}</span>
                <span>{{ threeData[2] }}%</span>
              </li>
              <li>
                <span>单位人数</span>
                <template v-if="tabActiveKey == 1"> <span>参与人数</span><span>参与率</span> </template>
                <template v-else> <span>合格人数</span><span>合格率</span> </template>
              </li>
            </ul>
          </div>
        </div>
        <LineBar style="height: 310px" ref="lineBarRef3" :loading="loading3" />
      </div>
      <div class="chart gary"> <LineBar ref="lineBarRef4" :loading="loading4" /></div>

      <div class="chart two-chart">
        <div class="left">
          <LineBar ref="lineBarRef7" :loading="loading7" />
        </div>
        <div class="right">
          <a-button class="fixedbtn" :loading="downloadIng6" type="primary" size="small" @click="exportTable(6)">导出</a-button>
          <LineBar ref="lineBarRef6" :loading="loading6" />
        </div>
      </div>

      <div class="chart two-chart">
        <div class="left">
          <LineBar ref="lineBarRef5" :loading="loading5" />
        </div>
        <div class="right">
          <a-button class="fixedbtn" :loading="downloadIng8" type="primary" size="small" @click="exportTable(8)">导出</a-button>
          <LineBar ref="lineBarRef8" :loading="loading8" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" name="statistics-edu" setup>
  import {
    getBarData,
    getProjectTrainData,
    getProjectTrainDataOrg,
    getTrainDataOrg,
    getMonthRate,
    getKnowledgeErrorRate,
    getDailyTrainRate,
    getDailyTrainScore,
    getAutoBrushQuestionRate,
  } from './api';
  import { onMounted, ref, computed } from 'vue';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useForm, BasicForm, FormSchema } from '/@/components/Form';
  import { useRoute } from 'vue-router';
  import LineBar from '../components/lineBar.vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  const route = useRoute();
  const orgList = ref<any[]>([]);
  const firstLevel = ref(1);
  const firstLevel2 = ref(1);

  const queryParams = ref({
    orgCode: '',
    time: [],
    startDate: '',
    endDate: '',
    checked: false,
    functions: '',
  });
  //自定义表单字段
  const formSchemas: FormSchema[] = [
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      componentProps: {
        allowClear: route.name !== 'departstatistics-edu',
        onChange: (value) => { 
          if (value) {
            console.log(value);
            
            queryParams.value.orgCode = value;
          }
        },
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
        },
      },
    },
    {
      label: '选择时间',
      field: 'time',
      component: 'RangeDate',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
    },
  ];

  const [registerForm, { getFieldsValue, updateSchema, setFieldsValue }] = useForm({
    //注册表单列
    schemas: formSchemas,
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
    fieldMapToTime: [['start', ['startTime', 'endTime'], 'YYYY-MM-DD']],
    showAdvancedButton: true,
    resetFunc: resetForm,
    labelWidth: 130,
    baseColProps: { span: 6 },
    labelAlign: 'right',
    submitOnReset: true,
  });

  const onSearch = () => {
    initData();
  };
  async function resetForm() {
    queryParams.value.functions = '1';
    pageInit();
  }

  // 图表
  const lineBarRef1 = ref<any>(null);
  const oneData = ref<any>({});
  const loading1 = ref(false);
  const lineBarRef2 = ref<any>(null);
  const twoData = ref<any>({});
  const loading2 = ref(false);
  const lineBarRef3 = ref<any>(null);
  const threeData = ref<any>({});
  const loading3 = ref(false);
  const lineBarRef4 = ref<any>(null);
  const loading4 = ref(false);
  const lineBarRef5 = ref<any>(null);
  const loading5 = ref(false);
  const lineBarRef6 = ref<any>(null);
  const loading6 = ref(false);
  const lineBarRef7 = ref<any>(null);
  const loading7 = ref(false);
  const lineBarRef8 = ref<any>(null);
  const loading8 = ref(false);
  const pageType = computed(() => {
    return route.name === 'departstatistics-edu' ? 'depart' : 'org';
  });
  async function pageInit() {
    orgList.value = await getDepart3ListWithSecurity();
    updateSchema({
      field: 'orgCode',
      componentProps: {
        options: orgList.value,
      },
    });
    if (orgList.value.length === 1) {
      await setFieldsValue({
        orgCode: orgList.value[0].orgCode,
      });
    }
    // 设置为当前月份
    await setFieldsValue({
      time: [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')].join(','),
      // time: [dayjs().set('year', 2024).format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    });
    if (pageType.value === 'depart') {
      let code = '';
      if (orgList.value.length > 1) {
        code = 'A04B01C11';
      } else {
        code = orgList.value[0].orgCode;
      }
      await setFieldsValue({
        orgCode: code,
      });
    }
    initData();
  }
  const back = () => {
    firstLevel.value = 1;
    levelData1.value = '';
    lineBarInit1();
  };
  const back2 = () => {
    firstLevel2.value = 1;
    levelData2.value = null;
    lineBarInit2();
  };
  const changeChecked = () => {
    queryParams.value.functions = queryParams.value.checked ? '1' : '0';
    if (firstLevel.value == 1) {
      lineBarInit1();
    }
    if (firstLevel2.value == 1) {
      lineBarInit2();
    }
    lineBarInit3();
    lineBarInit4();
    lineBarInit5();
    lineBarInit6();
  };

  const initData = async () => {
    // 设置为当前月份
    let time = await getFieldsValue().time.split(',');
    queryParams.value.startDate = time[0];
    queryParams.value.endDate = time[1];
    queryParams.value.orgCode = getFieldsValue().orgCode;
    if (pageType.value === 'depart') {
      lineBarInit1(queryParams.value.orgCode).catch(() => {});
      lineBarInit2(levelData2.value).catch(() => {});
    } else {
      lineBarInit1(levelData1.value).catch(() => {});
      lineBarInit2(levelData2.value).catch(() => {});
    }
    eventInit();
    lineBarInit3().catch(() => {});
    lineBarInit4().catch(() => {});
    lineBarInit7().catch(() => {});
    lineBarInit6().catch(() => {});
    lineBarInit5().catch(() => {});
    lineBarInit8().catch(() => {});
  };

  async function lineBarInit1(code?) {
    loading1.value = true;
    const result: any = await getBarData({ ...queryParams.value, orgCode: code }).finally(() => {
      loading1.value = false;
    });
    oneData.value = result.totalData;
    let lMax = computedMax(result.count, result.finishRate, result.qualifiedCount);
    let title = pageType.value === 'depart' || firstLevel.value == 2 ? '各车间培训统计（人次）' : '各单位培训统计（人次）';
    lineBarRef1.value.initCharts({
      title: title,
      grid: {
        top: 55,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      legend: { bottom: 0 },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
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
        },
      ],
      yAxis: [
        {
          type: 'value',
          alignTicks: true,
          min: 0,
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
          splitNumber: 10,
          axisLabel: {
            show: false,
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '培训人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.count.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: '合格人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.qualifiedCount.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value + ' %';
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
    loading1.value = false;
  }
  const levelData1 = ref('');
  const levelData2 = ref(null);
  const eventInit = () => {
    lineBarRef1.value.getInstance().on('click', (params) => {
      if (pageType.value === 'depart' || firstLevel.value == 2 || !params.data.id) return;
      firstLevel.value = 2;
      levelData1.value = params.data.id;
      lineBarInit1(params.data.id);
    });
    lineBarRef2.value.getInstance().on('click', (params) => {
      if (firstLevel2.value == 2 || !params.data.id) return;
      firstLevel2.value = 2;
      levelData2.value = params;
      lineBarInit2(params);
    });
  };

  function computedMax(...data: number[]) {
    let isolationMax = data.flat(Infinity).length > 0 ? Math.max(...data.flat(Infinity)) : 10;
    if (isolationMax === 0) isolationMax = 10;
    isolationMax = Math.ceil(isolationMax / 10) * 10;
    isolationMax = isolationMax + isolationMax / 5;
    return (isolationMax / 5) * 10;
  }

  async function lineBarInit2(project?) {
    loading2.value = true;
    let result: any = null;
    if (project) {
      let params: any = { ...queryParams.value };
      if (pageType.value !== 'depart') {
        delete params.orgCode;
      }
      params.project = project.data.id;
      result = await getProjectTrainDataOrg(params).finally(() => {
        loading2.value = false;
      });
    } else {
      let params: any = { ...queryParams.value };
      if (pageType.value !== 'depart') {
        delete params.orgCode;
      }
      result = await getProjectTrainData(params).finally(() => {
        loading2.value = false;
      });
    }
    twoData.value = result.totalData;
    let lMax = computedMax(result.count, result.finishRate, result.qualifiedCount);
    let title = firstLevel2.value == 2 ? '新员工岗前三级培训统计（人次）' : '培训类型统计（人次）';
    if (pageType.value === 'depart') {
      title = firstLevel2.value == 2 ? '年度安全教育再培训统计（人次）' : '培训类型统计（人次）';
    }
    if (project) {
      title = project.name;
    }
    lineBarRef2.value.initCharts({
      title: title,
      grid: {
        top: 55,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
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
          name: '培训人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.count.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: '合格人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.qualifiedCount.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value + ' %';
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
  }

  const tabActiveKey = ref(1);
  const tabClick = async (idx) => {
    tabActiveKey.value = idx;
    lineBarInit3();
  };
  const lineBarRef3Title = ref('各单位安全教育再培训统计(人数)');
  async function lineBarInit3() {
    loading3.value = true;
    const result: any = await getTrainDataOrg({ ...queryParams.value, type: tabActiveKey.value }).finally(() => {
      loading3.value = false;
    });
    threeData.value = result.totalData;
    let lMax = computedMax(result.count, result.finishRate, result.qualifiedCount);
    lineBarRef3Title.value =
      pageType.value === 'depart' || firstLevel.value == 2 ? '各车间安全教育再培训统计(人数)' : '各单位安全教育再培训统计(人数)';
    lineBarRef3.value.initCharts({
      // title: lineBarRef3Title.value,
      grid: {
        top: 28,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
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
          name: '单位人数',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.count.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: tabActiveKey.value == 1 ? '参与人数' : '合格人数',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value;
            },
          },
          data: result.qualifiedCount.map((item, idx) => {
            return {
              value: item,
              id: result.xdataCode[idx],
            };
          }),
        },
        {
          name: tabActiveKey.value == 1 ? '参与率' : '合格率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value + ' %';
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
  }
  async function lineBarInit4() {
    loading4.value = true;
    const result: any = await getMonthRate({ ...queryParams.value }).finally(() => {
      loading4.value = false;
    });
    let lMax = computedMax(result.count, result.finishRate, result.qualifiedCount);
    console.log(result);
    lineBarRef4.value.initCharts({
      title: '月合格率对比',
      grid: {
        top: 40,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
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
          name: '培训人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 人';
            },
          },
          data: result.count,
        },
        {
          name: '合格人次',
          type: 'bar',
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 人';
            },
          },
          data: result.qualifiedCount,
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value + ' %';
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
    loading4.value = false;
  }
  async function lineBarInit5() {
    loading5.value = true;
    const result: any = await getKnowledgeErrorRate({ ...queryParams.value }).finally(() => {
      loading5.value = false;
    });
    console.log(result);
    lineBarRef5.value.initCharts({
      title: '知识点错误率 top10',
      grid: {
        top: 40,
        left: 30,
        right: 0,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: result.xdata,
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
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 10,
        axisLabel: {
          formatter: '{value} %',
        },
      },
      series: [
        {
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
          type: 'line',
          smooth: true,
        },
      ],
    });
    loading5.value = false;
  }
  async function lineBarInit6() {
    loading6.value = true;
    const result: any = await getDailyTrainRate({ ...queryParams.value }).finally(() => {
      loading6.value = false;
    });
    lineBarRef6.value.initCharts({
      title: '每日一练参与率',
      grid: {
        top: 40,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
          axisPointer: {
            type: 'shadow',
          },
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
        },
      ],
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 10,
        axisLabel: {
          formatter: '{value} %',
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: 15,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
  }
  async function lineBarInit7() {
    loading7.value = true;
    const result: any = await getDailyTrainScore({ ...queryParams.value }).finally(() => {
      loading7.value = false;
    });
    lineBarRef7.value.initCharts({
      title: '每日一练学分排名TOP10',
      grid: {
        top: 40,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
          axisPointer: {
            type: 'shadow',
          },
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
        },
      ],
      yAxis: {
        type: 'value',
        min: 0,
        max: result.totalData && result.totalData.length ? Math.ceil(Math.max(...result.totalData) / 10) * 10 : 100,
        interval: 10,
        axisLabel: {
          formatter: '{value} 分',
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: 10,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 分';
            },
          },
          data: result.totalData,
        },
      ],
    });
  }

  async function lineBarInit8() {
    loading8.value = true;
    const result: any = await getAutoBrushQuestionRate({ ...queryParams.value }).finally(() => {
      loading8.value = false;
    });
    let lMax = computedMax(result.count, result.finishRate, result.qualifiedCount);
    lineBarRef8.value.initCharts({
      title: '自主刷题参与率',
      grid: {
        top: 40,
        left: 30,
        right: 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: result.xdata,
          axisPointer: {
            type: 'shadow',
          },
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
          name: '单位人数',
          type: 'bar',
          yAxisIndex: 0,
          barWidth: 10,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 人';
            },
          },
          data: result.count,
        },
        {
          name: '参与人数',
          type: 'bar',
          barWidth: 10,
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top',
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 人';
            },
          },
          data: result.qualifiedCount,
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value + ' %';
            },
          },
          tooltip: {
            valueFormatter: function (value) {
              return value + ' %';
            },
          },
          data: result.finishRate,
        },
      ],
    });
  }
  // 导出
  const downloadIng6 = ref(false);
  const downloadIng8 = ref(false);
  const exportTable = async (type: number) => {
    if(!queryParams.value.orgCode) {
      message.warning('请选择机构！');
      return;
    }
    const { handleExportXlsx } = useMethods();
    const dateStr = dateFormat(new Date(), 'yyyy-MM-dd');
    if (type === 6) {
      downloadIng6.value = true;
      await handleExportXlsx('每日一练统计报表-' + dateStr, '/edu/statistics/dailyTrainDataExport', queryParams.value);
      stout(() => downloadIng6.value = false);
    } else {
      downloadIng8.value = true;
      await handleExportXlsx('自主刷题统计报表-' + dateStr, '/edu/statistics/autoBrushQuestionDataExport', queryParams.value);
      stout(() => downloadIng8.value = false);
    }
  };
  function stout (c) {
    setTimeout(c, 800);
  }
  onMounted(() => {
    pageInit();
  });
</script>

<style lang="less" scoped>
  .jobAccounting {
    height: 100%;
    padding: 10px;
    .header {
      padding-top: 16px;
      background-color: #fff;
    }
    .inner {
      margin-top: 16px;
      padding: 16px;
      background-color: #fff;
    }
    .chart {
      width: 100%;
      height: 380px;
      position: relative;
      padding: 16px 0;
      padding-top: 50px;
      border-bottom: 1px solid #bbbbbb;
      box-sizing: content-box;
      .hd {
        width: 100%;
        position: absolute;
        top: 0px;
        z-index: 99;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        .left {
          display: flex;
        }
        .back-btn {
          margin-left: 10px;
          cursor: pointer;
          img {
            width: 25px;
          }
        }
      }
      .hd3 {
        height: 80px;
        display: flex;
        justify-content: center;
        position: relative;
        align-items: center;
        .title {
          font-size: 18px;
          font-weight: 600;
          padding-left: 20px;
        }
        .center {
          display: flex;
          transform: translateX(-120px);
        }
        .table {
          position: absolute;
          right: 0;
        }
      }
      .tab {
        width: 120px;
        height: 32px;
        line-height: 32px;
        margin-bottom: 0px;
        display: flex;
        align-items: baseline;
        justify-content: space-around;
        transform: translateY(0px);
        li {
          cursor: pointer;
          border-bottom: solid 2px transparent;
        }
        .active {
          color: #1890ff;
        }
        &::after {
          content: '';
          display: block;
          width: 40px;
          height: 5px;
          border-radius: 4px;
          position: absolute;
          left: 10px;
          bottom: 0;
          background-color: #1890ff;
          transition: all 0.5s;
        }
      }
      .active2 {
        &::after {
          left: 70px;
        }
      }
    }
    .gary {
    }
    .two-chart {
      display: flex;
      .left {
        width: 50%;
      }
      .right {
        width: 50%;
      }
    }
  }
  .right {
    display: flex;
    align-items: baseline;
  }
  .table {
    border: 1px solid #e5e5e5;
    display: flex;
    height: 70px;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 8px;
    .r-l {
      width: 80px;
      height: 70px;
      line-height: 70px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
    }

    ul {
      flex: auto;
      margin: 0;
      padding: 0;
      li {
        display: flex;
        height: 35px;
        line-height: 35px;
        span {
          width: 80px;
          flex: 1;
          border-left: 1px solid #e5e5e5;
        }
        span:nth-child(1) {
          color: orangered;
        }
        span:nth-child(2) {
          color: orange;
        }
        span:nth-child(3) {
          color: #1890ff;
        }
      }
      li:nth-child(1) {
        border-bottom: 1px solid #e5e5e5;
        span {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
  }
  .fixedbtn {
    position: absolute;
    right: 16px;
    top: 26px;
  }
</style>
