import { ref, reactive, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';
import { showFailToast } from 'vant';
import {
  eventTypeStats,
  eventResultStats,
  eventOrgCodeStats,
  eventTrendStats,
  yearLostWorkdayStats,
  orgLostWorkdayStats,
  getOrgInfoForOrgCode,
} from '../../url/index';
import { getLoginBackInfo } from '/@/utils/auth';
export const useContent = (
  typeStatisticsRef: any,
  trendOccursRef: any,
  eventResultRef: any,
  occurUnitRef: any,
  lostDaysRef: any,
  lostDaysSectorRef: any
) => {
  highcharts3d(highcharts);
  const userInfo: any = getLoginBackInfo();
  const show = ref(false);
  const iconLoading = ref(true);
  const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const onConfirm = (values) => {
    const [start, end] = values;
    show.value = false;
    queryParams.time = `${formatDate(start)} - ${formatDate(end)}`;
    queryParams['startTime'] = `${formatDate(start)} 00:00:00`;
    queryParams['endTime'] = `${formatDate(end)} 23:59:59`;
  };
  const queryParams = reactive({
    orgCodes: [] as any[],
    time: '',
    startTime: '',
    endTime: '',
  });
  const orgOptions = ref<any[]>([]);
  const colors = ref([
    '#3b89f4',
    '#44bec6',
    '#34a753',
    '#fcba08',
    '#ff6c01',
    '#eb4236',
    '#81C462',
    '#FFB6C1',
    '#DC143C',
    '#BA55D3',
    '#7B68EE',
    '#87CEFA',
    '#87CEEB',
    '#00FFFF',
    '#40E0D0',
    '#7FFFAA',
    '#FFFF00',
    '#FFFACD',
    '#FFD700',
    '#FF8C00',
    '#F08080',
  ]);
  watch(
    () => queryParams.time,
    (value) => {
      if (value === '') {
        queryParams.startTime = '';
        queryParams.endTime = '';
      }
    }
  );
  const init = async () => {
    const params: any = Object.assign({}, queryParams);
    params.orgCodes = queryParams.orgCodes.join(',');
    delete params.time;
    await initAccidentTypeCharts(params);
    await initTrendOccursCharts(params);
    await initEventResultCharts(params);
    await initOccurUnit(params);
    await initLostDaysCharts(params);
    await initLostDaysSectorCharts(params);
    iconLoading.value = false;
  };
  onMounted(async () => {
    await getOrgInfoForOrgCode().then((res) => {
      orgOptions.value = res;
    });
    queryParams.orgCodes = userInfo.userInfo.orgCode.length === 3 ? [] : [userInfo.userInfo.orgCode.slice(0, 6)];
    init();
  });
  const searchQuery = () => {
    iconLoading.value = true;
    init();
  };
  const searchReset = () => {
    Object.assign(queryParams, {
      orgCodes: userInfo.userInfo.orgCode.length === 3 ? [] : [userInfo.userInfo.orgCode.slice(0, 6)],
      time: '',
      startTime: '',
      endTime: '',
    });
    init();
  };
  //事件分类统计
  const initAccidentTypeCharts = async (params) => {
    let data = <any[]>[];
    await eventTypeStats(params).then((res) => {
      if (res.success) {
        data = Object.keys(res.result).map((key) => {
          return {
            name: key,
            value: res.result[key] === 0 ? null : res.result[key],
          };
        });
      } else {
        iconLoading.value = false;
        showFailToast(res.message);
      }
    });
    if (data.every((item) => item.value === null)) {
      data = data.map((item) => {
        item.value = 0;
        return item;
      });
    }
    const myChart = echarts.init(typeStatisticsRef.value);
    const option = {
      // 设置背景颜色为白色
      backgroundColor: 'white',
      // 设置饼图标题配置
      title: {
        text: '事件分类统计', // 饼图标题文本
        left: 'left', // 标题居中显示
        textStyle: {
          color: '#000', // 标题字体颜色为黑色
          fontSize: 18, // 标题字体大小为24px
          fontWeight: 'bold', // 标题字体加粗
        },
      },
      // 设置提示框样式配置
      tooltip: {
        trigger: 'item', // 提示框触发方式为数据项触发
        backgroundColor: '#ffffff', // 提示框背景颜色为白色
        padding: [8], // 提示框内边距
        textStyle: {
          color: '#6a6a6a', // 提示框文本颜色为灰色
          fontSize: 12, // 提示框文本字体大小为16px
        },
        // 自定义提示框内容格式化函数
        formatter: function (params) {
          // 返回自定义的提示框内容
          return (
            '<span style="color:' +
            params.color +
            '">' +
            params.data['name'] + // 数据项名称
            '\n' +
            '<span style="color:#666666">' +
            params.data['value'] + // 数据项值
            '</span></span>'
          );
        },
      },
      // 设置图例配置
      legend: {
        show: false,
      },
      // 设置饼图系列配置
      series: [
        {
          name: '', // 系列名称
          type: 'pie', // 系列类型为饼图
          radius: '50%', // 饼图半径为整个容器的50%
          center: ['50%', '50%'], // 饼图中心位置为容器的中心
          // 饼图数据项配置
          data,
          label: {
            normal: {
              formatter: '{b}\n{c}',
            },
          },
          itemStyle: {
            normal: {
              color: (params) => {
                return colors.value[params.dataIndex];
              },
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0)',
            },
          },
        },
      ],
    };
    myChart.setOption(option);
  };
  // 事件发生趋势
  const initTrendOccursCharts = async (params) => {
    let data = <any[]>[];
    let data1 = <any[]>[];
    let xAxisData = <any[]>[];
    await eventTrendStats(params).then((res) => {
      if (res.success) {
        data = Object.keys(res.result).map((key) => {
          return {
            name: key,
            value: res.result[key],
          };
        });
        xAxisData = Object.keys(res.result['近一年']);
        data = Object.keys(res.result['近一年']).map((key) => {
          return res.result['近一年'][key];
        });
        data1 = Object.keys(res.result['上一年']).map((key) => {
          return res.result['上一年'][key];
        });
      } else {
        iconLoading.value = false;
        showFailToast(res.message);
      }
    });
    const myChart = echarts.init(trendOccursRef.value);
    const option = {
      // 设置背景颜色为白色
      backgroundColor: 'white',
      // 设置饼图标题配置
      title: {
        text: '事件发生趋势', // 饼图标题文本
        left: 'left', // 标题居中显示
        textStyle: {
          color: '#000', // 标题字体颜色为黑色
          fontSize: 18, // 标题字体大小为24px
          fontWeight: 'bold', // 标题字体加粗
        },
      },
      grid: {
        top: '20%',
        left: '5%',
        right: '5%',
        bottom: '8%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true,
          },
        },
        formatter(params) {
          let data = '';
          for (let i = 0; i < params.length; i++) {
            data += params[i].seriesName + '  ' + params[i].value + '<br/>';
          }
          return data;
        },
      },
      legend: {
        data: ['近一年', '上一年'],
        top: 30, // 图例距离容器上边缘的距离为20px
        itemWidth: 15, // 图例项宽度为15px
        itemHeight: 10, // 图例项高度为10px
        itemGap: 10, // 图例项间隔为25px
        borderRadius: 4, // 图例项圆角为4px
        textStyle: {
          color: '#000', // 图例文本颜色为黑色
          fontFamily: 'Alibaba PuHuiTi', // 图例文本字体为"Alibaba PuHuiTi"
          fontSize: 14, // 图例文本字体大小为14px
          fontWeight: 400, // 图例文本字体粗细为400
        },
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          rotate: 50,
          textStyle: {
            color: '#393939', //X轴文字颜色
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          textStyle: {
            color: '#393939',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#eeeeee',
          },
        },
      },
      series: [
        {
          name: '近一年',
          type: 'bar',
          barWidth: 20,
          itemStyle: {
            normal: {
              color: '#3b89f4',
            },
          },
          data,
        },
        {
          name: '上一年',
          type: 'line',
          showAllSymbol: true, //显示所有图形。
          symbol: 'circle', //标记的图形为实心圆
          symbolSize: 4, //标记的大小
          itemStyle: {
            //折线拐点标志的样式
            color: '#ffffff',
            borderWidth: '2',
            borderColor: '#97d8de',
          },
          lineStyle: {
            color: '#97d8de',
          },
          data: data1,
        },
      ],
    };
    myChart.setOption(option);
  };
  // 事件结果分类统计
  const initEventResultCharts = async (params) => {
    let data = <any[]>[];
    await eventResultStats(params).then((res) => {
      if (res.success) {
        data = Object.keys(res.result).map((key) => {
          return {
            name: key,
            value: res.result[key] === 0 ? null : res.result[key],
          };
        });
      } else {
        iconLoading.value = false;
        showFailToast(res.message);
      }
    });
    if (data.every((item) => item.value === null)) {
      data = data.map((item) => {
        item.value = 0;
        return item;
      });
    }
    const myChart = echarts.init(eventResultRef.value);
    const option = {
      // 设置背景颜色为白色
      backgroundColor: 'white',
      // 设置饼图标题配置
      title: {
        text: '事件结果分类统计', // 饼图标题文本
        left: 'left', // 标题居中显示
        textStyle: {
          color: '#000', // 标题字体颜色为黑色
          fontSize: 18, // 标题字体大小为24px
          fontWeight: 'bold', // 标题字体加粗
        },
      },
      // 设置提示框样式配置
      tooltip: {
        trigger: 'item', // 提示框触发方式为数据项触发
        backgroundColor: '#ffffff', // 提示框背景颜色为白色
        padding: [8], // 提示框内边距
        textStyle: {
          color: '#6a6a6a', // 提示框文本颜色为灰色
          fontSize: 12, // 提示框文本字体大小为16px
        },
        // 自定义提示框内容格式化函数
        formatter: function (params) {
          // 返回自定义的提示框内容
          return (
            '<span style="color:' +
            params.color +
            '">' +
            params.data['name'] + // 数据项名称
            '\n' +
            '<span style="color:#666666">' +
            params.data['value'] + // 数据项值
            '</span></span>'
          );
        },
      },
      // 设置图例配置
      legend: {
        top: 35,
        itemWidth: 15, // 图例项宽度为15px
        itemHeight: 10, // 图例项高度为10px
        itemGap: 10, // 图例项间隔为25px
        borderRadius: 4, // 图例项圆角为4px
        textStyle: {
          color: '#000', // 图例文本颜色为黑色
          fontFamily: 'Alibaba PuHuiTi', // 图例文本字体为"Alibaba PuHuiTi"
          fontSize: 14, // 图例文本字体大小为14px
          fontWeight: 400, // 图例文本字体粗细为400
        },
      },
      // 设置饼图系列配置
      series: [
        {
          name: '', // 系列名称
          type: 'pie', // 系列类型为饼图
          radius: '50%', // 饼图半径为整个容器的50%
          center: ['50%', '58%'], // 饼图中心位置为容器的中心
          // 饼图数据项配置
          data,
          label: {
            normal: {
              formatter: '{b}\n{c}',
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0)',
            },
          },
          // 饼图数据项样式配置
          itemStyle: {
            normal: {
              color: (params) => {
                return colors.value[params.dataIndex];
              },
            },
          },
        },
      ],
    };
    myChart.setOption(option);
  };
  //事件发生单位统计
  const initOccurUnit = async (params) => {
    let data = <any[]>[];
    await eventOrgCodeStats(params).then((res) => {
      data = Object.keys(res.result).map((key) => {
        return {
          name: key,
          y: res.result[key],
          value: res.result[key],
        };
      });
    });
    if (data.every((item) => item.y === 0)) {
      data = data.map((item) => {
        item.y = 1;
        item.value = 0;
        return item;
      });
    }
    highcharts.chart(occurUnitRef.value, {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 60,
          beta: 0,
        },
      },
      title: {
        text: '事件发生单位统计',
        align: 'left',
        style: { color: '#000', fontSize: '18px', fontWeight: 'bold' },
      },
      tooltip: {
        backgroundColor: '#fff',
        padding: 10,
        useHTML: true,
        style: {
          color: '#6a6a6a',
          fontSize: '12px',
        },
        headerFormat: `<span style='padding-right:5px;color:{point.color}'>{point.key}</span>`,
        pointFormat: `<span>{point.value}</span>`,
      },
      credits: {
        enabled: false, // 禁用底部标志
      },
      plotOptions: {
        pie: {
          showInLegend: true, // 显示图例
          allowPointSelect: true,
          cursor: 'pointer',
          size: '120%', // 设置饼图大
          depth: 50,
          borderWidth: 1, // 设置扇形边缘的宽度为1px
          borderColor: '#fff', // 设置扇形边缘的颜色为白色
          colors: colors.value,
          dataLabels: {
            enabled: true,
            format: '{point.name}',
          },
        },
      },
      // 设置图例配置
      legend: {
        symbolWidth: 15, // 设置图例项的宽度
        symbolHeight: 10, // 设置图例项的高度
        symbolRadius: 2, // 设置图例项的边框半径
        padding: 5,
        itemStyle: {
          color: '#000',
          fontFamily: 'Alibaba PuHuiTi',
          fontSize: '14px',
          fontWeight: '400',
        },
      },
      series: [
        {
          type: 'pie',
          dataLabels: {
            enabled: false,
          },
          data,
        },
      ],
    });
  };
  // 事件损失天数
  const initLostDaysCharts = async (params) => {
    let data = <any[]>[];
    let data1 = <any[]>[];
    let xAxisData = <any[]>[];
    await yearLostWorkdayStats(params).then((res) => {
      if (res.success) {
        xAxisData = Object.keys(res.result['损失天数']);
        data = Object.keys(res.result['损失天数']).map((key) => {
          return res.result['损失天数'][key];
        });
        data1 = Object.keys(res.result['事故/事件数']).map((key) => {
          return res.result['事故/事件数'][key];
        });
      } else {
        iconLoading.value = false;
        showFailToast(res.message);
      }
    });
    const myChart = echarts.init(lostDaysRef.value);
    const option = {
      backgroundColor: 'white',
      title: {
        text: '事件损失天数', // 饼图标题文本
        left: 'left', // 标题居中显示
        textStyle: {
          color: '#000', // 标题字体颜色为黑色
          fontSize: 18, // 标题字体大小为24px
          fontWeight: 'bold', // 标题字体加粗
        },
      },
      grid: {
        top: '22%',
        left: '5%',
        right: '5%',
        bottom: '1%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'item', // 提示框触发方式为数据项触发
        backgroundColor: '#ffffff', // 提示框背景颜色为白色
        padding: [8], // 提示框内边距
        textStyle: {
          color: '#6a6a6a', // 提示框文本颜色为灰色
          fontSize: 12, // 提示框文本字体大小为16px
        },
        formatter: function (params) {
          // 返回自定义的提示框内容
          return (
            '<span style="color:' +
            params.color +
            ';display:block">' +
            params.seriesName + // 数据项名称
            '</span>' +
            '<span style="color:#666666">' +
            params.name +
            '\n' +
            params.value +
            '</span>'
          );
        },
      },
      legend: {
        data: ['损失天数', '事故/事件数'],
        top: 30, // 图例距离容器上边缘的距离为20px
        itemWidth: 15, // 图例项宽度为15px
        itemHeight: 10, // 图例项高度为10px
        itemGap: 10, // 图例项间隔为25px
        borderRadius: 4, // 图例项圆角为4px
        textStyle: {
          color: '#000', // 图例文本颜色为黑色
          fontFamily: 'Alibaba PuHuiTi', // 图例文本字体为"Alibaba PuHuiTi"
          fontSize: 14, // 图例文本字体大小为14px
          fontWeight: 400, // 图例文本字体粗细为400
        },
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            textStyle: {
              color: '#393939',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#393939',
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#eeeeee',
            },
          },
        },
      ],
      series: [
        {
          name: '损失天数',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#e86e51',
            },
          },
          data,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
        {
          name: '事故/事件数',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#eac26a',
            },
          },

          data: data1,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };
    myChart.setOption(option);
  };
  // 事件损失天数扇形
  const initLostDaysSectorCharts = async (params) => {
    let data = <any[]>[];
    await orgLostWorkdayStats(params).then((res) => {
      if (res.success) {
        data = Object.keys(res.result).map((key) => {
          return {
            name: key,
            value: res.result[key],
            label: {
              show: (function () {
                if (res.result[key] == 0) {
                  return false;
                } else {
                  return true;
                }
              })(),
            },
            labelLine: {
              show: (function () {
                if (res.result[key] == 0) {
                  return false;
                } else {
                  return true;
                }
              })(),
            },
          };
        });
      } else {
        iconLoading.value = false;
        showFailToast(res.message);
      }
    });
    if (data.every((item) => item.value === 0)) {
      data = data.map((item) => {
        item.label.show = true;
        item.labelLine.show = true;
        return item;
      });
    }
    const myChart = echarts.init(lostDaysSectorRef.value);
    const option = {
      tooltip: {
        trigger: 'item', // 提示框触发方式为数据项触发
        backgroundColor: '#ffffff', // 提示框背景颜色为白色
        padding: [8], // 提示框内边距
        textStyle: {
          color: '#6a6a6a', // 提示框文本颜色为灰色
          fontSize: 12, // 提示框文本字体大小为16px
        },
        formatter: function (params) {
          // 返回自定义的提示框内容
          return (
            '<span style="color:' +
            params.color +
            '">' +
            params.name + // 数据项名称
            '\n' +
            '<span style="color:#666666">' +
            params.value + // 数据项值
            '</span></span>'
          );
        },
      },
      legend: {
        top: 20,
        itemWidth: 15, // 图例项宽度为15px
        itemHeight: 10, // 图例项高度为10px
        itemGap: 10, // 图例项间隔为25px
        borderRadius: 4, // 图例项圆角为4px
        textStyle: {
          color: '#000', // 图例文本颜色为黑色
          fontFamily: 'Alibaba PuHuiTi', // 图例文本字体为"Alibaba PuHuiTi"
          fontSize: 14, // 图例文本字体大小为14px
          fontWeight: 400, // 图例文本字体粗细为400
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '50%'],
          center: ['50%', '65%'], // 饼图中心位置为容器的中心
          avoidLabelOverlap: false,
          data,
          label: {
            normal: {
              formatter: '{b}\n{c}',
            },
          },
          itemStyle: {
            normal: {
              borderColor: '#fff',
              borderRadius: 5,
              borderWidth: 2,
              color: (params) => {
                return colors.value[params.dataIndex];
              },
            },
          },
        },
      ],
    };
    myChart.setOption(option);
  };
  return {
    queryParams,
    searchQuery,
    searchReset,
    show,
    onConfirm,
    iconLoading,
    orgOptions,
  };
};
export default useContent;
