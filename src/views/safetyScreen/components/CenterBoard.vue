<script setup lang="ts">
  import TopoPreview from '../../../components/AntdvTopo/previewLoop.vue';
  import * as echarts from 'echarts';
  import { onUnmounted, nextTick } from 'vue';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { getList, rectifyProblem, completionRate } from '../plan.api';
  import { DownOutlined } from '@ant-design/icons-vue';

  const cyyList: any = ref([]);
  const dcyList: any = ref([]);
  const swiperCurrent = ref<number>(0);

  const type = ref('1'); // 默认选择按日查看
  const dateTime = ref(dayjs(new Date()).format('YYYY-MM-DD'));
  const showLeftBoard = ref(true); //看板产业园-东厂按钮
  const currentType = ref('问题整改情况'); //柱状图上方标签切换按钮
  // const hazardRectificationChartData = ref([]);
  let myEcharts = echarts;
  const orgCode = ref('A04');
  onUnmounted(() => {
    myEcharts.dispose;
  });

  const onChange = (current: number) => {
    console.log(current);
    swiperCurrent.value = current;
  };

  function init(val) {
    orgCode.value = val.orgCode;
    changeTime();
    initBoard();
  }

  function initBoard() {
    const params = {
      column: 'createTime',
      order: 'desc',
      pageNo: '1',
      pageSize: '999',
      // park: '0', // 0产业园；1东厂园
      status: '0',
    };
    getList(params).then((res) => {
      const resData = res.records || [];
      cyyList.value = resData.filter((v) => v.park === '0') || [];
      dcyList.value = resData.filter((v) => v.park === '1') || [];
    });
  }
  const changeTime = () => {
    if (currentType.value === '问题整改情况') {
      rectifyProblemData(orgCode.value);
    }
    if (currentType.value === '检查完成率') {
      completionRateData(orgCode.value);
    }
  };
  const changeType = () => {
    if (type.value === '1') {
      dateTime.value = dayjs(new Date()).format('YYYY-MM-DD');
    }
    if (type.value === '2') {
      dateTime.value = dayjs(new Date()).format('YYYY-MM');
    }
    if (type.value === '3') {
      dateTime.value = dayjs(new Date()).format('YYYY');
    }
    changeTime();
  };
  const rectifyProblemData = (val) => {
    rectifyProblem({
      type: type.value,
      dateTime: dateTime.value,
      orgCode: val,
    }).then((res) => {
      if (res && res.legendData) {
        const legendData = res.legendData;
        const xData = res.xData;
        let data = [];
        let leftMax = 0;
        if (type.value !== '3') {
          data = legendData.map((item, index) => {
            if (index < legendData.length - 1) {
              leftMax = Math.max(...res.data.filter((v) => v.type === 'bar').map((ite) => ite.data[0]));
              return {
                name: item,
                type: 'bar',
                barWidth: '30%',
                data: res.data.filter((v) => v.type === 'bar').map((ite) => ite.data[0]),
              };
            } else {
              return {
                name: item,
                type: 'line',
                data: res.data.filter((v) => v.type === 'line').map((ite) => ite.data[0]),
                // smooth: true,
                symbol: 'circle', // 设置为实心圆
                symbolSize: 8,
                yAxisIndex: 1,
                itemStyle: {
                  borderWidth: 2,
                  color: '#FF8251', // 圆环的颜色
                },
              };
            }
          });
        } else {
          data = res.data.map((item) => {
            if (item.type === 'line') {
              item.yAxisIndex = 1;
              // item.smooth = true;
              item.symbol = 'circle';
              item.symbolSize = 8;
              item.itemStyle = {
                borderWidth: 2,
              };
            } else {
              leftMax = Math.max(
                ...res.data
                  .filter((v) => v.type === 'bar')
                  .map((ite) => ite.data)
                  .flat()
              );
            }
            item.data = item.data.map((ite) => Number(ite));
            return item;
          });
        }
        initChart(legendData, xData, data, leftMax);
      } else {
        initChart([], [], [], 0);
      }
    });
  };
  const completionRateData = (val) => {
    completionRate({
      type: type.value,
      dateTime: dateTime.value,
      orgCode: val,
    }).then((res) => {
      if (res && res.legendData) {
        const legendData = res.legendData;
        const xData = res.xData;
        let data = [];
        let leftMax = 0;
        if (type.value !== '1') {
          data = res.data.map((item) => {
            // item.smooth = true;
            item.symbol = 'circle';
            item.symbolSize = 8;
            item.itemStyle = {
              borderWidth: 2,
            };
            item.data = item.data.map((ite) => Number(ite));
            return item;
          });
        } else {
          data = res.data.map((item) => {
            if (item.type === 'line') {
              item.yAxisIndex = 1;
              // item.smooth = true;
              item.symbol = 'circle';
              item.symbolSize = 8;
              item.itemStyle = {
                borderWidth: 2,
              };
            } else {
              leftMax = Math.max(
                ...res.data
                  .filter((v) => v.type === 'bar')
                  .map((ite) => ite.data)
                  .flat()
              );
            }
            item.data = item.data.map((ite) => Number(ite));
            return item;
          });
        }
        initChart(legendData, xData, data, leftMax);
      } else {
        initChart([], [], [], 0);
      }
    });
  };
  const transformNumber = (num) => {
    if (num === 0) {
      return 100;
    }
    const lastDigit = num % 10; // 获取数字的最后一位
    // 如果最后一位是 0 或者 5，则返回原始数字
    if (lastDigit === 0 || lastDigit === 5) {
      return num;
    }
    // 计算需要增加的数值
    const increment = lastDigit < 5 ? 5 - lastDigit : 10 - lastDigit;
    // 返回调整后的数字
    return num + increment;
  };
  function initChart(legendData, xData, data, leftMax) {
    const dom = document.getElementById('alarmChart_' + currentType.value);
    if (dom) {
      myEcharts.dispose(dom);
    }
    let chart = myEcharts.init(dom);
    let option;
    if (currentType.value === '问题整改情况') {
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          show: false, // 隐藏刻度
          data: legendData,
          align: 'left',
          right: 50,
          top: 10,
          icon: 'roundRect',
          itemGap: 20,
          itemWidth: 9,
          itemHeight: 9,
          textStyle: {
            color: '#A9B6C8',
            fontSize: 13,
          },
        },
        grid: {
          left: 35,
          right: 10,
          top: 43,
          bottom: 20,
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: xData,
            axisTick: {
              show: false, // 隐藏刻度
            },
            axisLine: {
              show: false,
            },
            axisLabel: {
              color: '#A9B6C8', // 设置 x 轴文字颜色
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}', // Y 轴上不加单位
            },
            nameTextStyle: {
              color: '#A9B6C8',
            },
            title: {
              text: '',
              textStyle: {
                color: '#A9B6C8',
                fontSize: 13,
              },
              padding: 10,
            },
            splitLine: {
              lineStyle: {
                type: 'solid',
                width: 2,
                color: 'rgba(169,182,200,0.13)',
              },
            },
            splitNumber: 5,
            interval: transformNumber(leftMax) / 5,
            min: 0,
            max: transformNumber(leftMax),
          },
          {
            type: 'value',
            // scale: true,
            splitLine: {
              lineStyle: {
                type: 'solid',
                width: 2,
                color: 'rgba(169,182,200,0.13)',
              },
            },
            axisLabel: {
              formatter: '{value}%', //右侧以百分比进行展示
              show: true,
              textStyle: {
                color: '#A9B6C8',
                fontSize: 13,
              },
            },
            nameTextStyle: {
              color: '#A9B6C8',
            },
            min: 0,
            max: 100,
            splitNumber: 5,
          },
        ],
        series: data,
        graphic: [
          {
            type: 'text',
            left: 20,
            top: 10,
            style: {
              text: '(个)', // 添加单位
              fill: '#A9B6C8',
              fontSize: 12,
            },
          },
          {
            type: 'text',
            right: 20,
            top: 10,
            style: {
              text: '(%)', // 添加单位
              fill: '#A9B6C8',
              fontSize: 12,
            },
          },
        ],
      };
    } else if (currentType.value === '检查完成率') {
      let yAxis: any = [];
      let graphic: any = [];
      if (type.value !== '1') {
        if (leftMax === 0) {
          yAxis = [
            {
              type: 'value',
              axisLabel: {
                formatter: '{value}', // Y 轴上不加单位
              },
              nameTextStyle: {
                color: '#A9B6C8',
              },
              title: {
                text: '',
                textStyle: {
                  color: '#A9B6C8',
                  fontSize: 13,
                },
                padding: 10,
              },
              splitLine: {
                lineStyle: {
                  type: 'solid',
                  width: 2,
                  color: 'rgba(169,182,200,0.13)',
                },
              },
              splitNumber: 5,
              min: 0,
              max: 100,
            },
          ];
        } else {
          yAxis = [
            {
              type: 'value',
              axisLabel: {
                formatter: '{value}', // Y 轴上不加单位
              },
              nameTextStyle: {
                color: '#A9B6C8',
              },
              title: {
                text: '',
                textStyle: {
                  color: '#A9B6C8',
                  fontSize: 13,
                },
                padding: 10,
              },
              splitLine: {
                lineStyle: {
                  type: 'solid',
                  width: 2,
                  color: 'rgba(169,182,200,0.13)',
                },
              },
            },
          ];
        }
        graphic = [
          {
            type: 'text',
            left: 20,
            top: 10,
            style: {
              text: '(%)', // 添加单位
              fill: '#A9B6C8',
              fontSize: 12,
            },
          },
        ];
      } else {
        yAxis = [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}', // Y 轴上不加单位
            },
            nameTextStyle: {
              color: '#A9B6C8',
            },
            title: {
              text: '',
              textStyle: {
                color: '#A9B6C8',
                fontSize: 13,
              },
              padding: 10,
            },
            splitLine: {
              lineStyle: {
                type: 'solid',
                width: 2,
                color: 'rgba(169,182,200,0.13)',
              },
            },
            splitNumber: 5,
            interval: transformNumber(leftMax) / 5,
            min: 0,
            max: transformNumber(leftMax),
          },
          {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'solid',
                width: 2,
                color: 'rgba(169,182,200,0.13)',
              },
            },
            axisLabel: {
              formatter: '{value}%', //右侧以百分比进行展示
              show: true,
              textStyle: {
                color: '#A9B6C8',
                fontSize: 13,
              },
            },
            nameTextStyle: {
              color: '#A9B6C8',
            },
            min: 0,
            max: 100,
            splitNumber: 5,
          },
        ];
        graphic = [
          {
            type: 'text',
            left: 20,
            top: 10,
            style: {
              text: '(个)', // 添加单位
              fill: '#A9B6C8',
              fontSize: 12,
            },
          },
          {
            type: 'text',
            right: 20,
            top: 10,
            style: {
              text: '(%)', // 添加单位
              fill: '#A9B6C8',
              fontSize: 12,
            },
          },
        ];
      }
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          show: false, // 隐藏刻度
        },
        grid: {
          left: 35,
          right: 10,
          top: 43,
          bottom: 20,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisTick: {
            show: false, // 隐藏刻度
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#A9B6C8', // 设置 x 轴文字颜色
          },
        },
        yAxis: yAxis,
        series: data,
        graphic: graphic,
      };
    }
    chart.setOption(option);
  }

  // 当切换图表时，重新初始化当前图表
  function changeCurrentType(_type: string) {
    currentType.value = _type;
    type.value = '1';
    dateTime.value = dayjs(new Date()).format('YYYY-MM-DD');
    if (_type === '问题整改情况') {
      nextTick(() => {
        rectifyProblemData(orgCode.value);
      });
    } else if (_type === '检查完成率') {
      nextTick(() => {
        completionRateData(orgCode.value);
      });
    }
  }
  defineExpose({
    init,
  });
</script>

<template>
  <div class="center-main">
    <div v-if="showLeftBoard === true" class="board">
      <a-carousel v-if="cyyList.length > 0" dotPosition="top" :after-change="onChange">
        <div class="swiper-item" v-for="(item, index) in cyyList" :key="index">
          <topo-preview
            v-if="item.pageContentOne && swiperCurrent === index"
            :graphData="JSON.parse(item.pageContentOne)"
            :showApv="false"
            :index="index + ''"
          />
          <img v-else src="../../../assets/images/controlScreen/nodata.png" />
        </div>
      </a-carousel>
      <div class="w-nodata" v-else>
        <img src="../../../assets/images/controlScreen/nodata.png" />
      </div>

      <div class="place-tab">
        <img class="tab-left tab-style" @click="showLeftBoard = true" src="../../../assets/images/controlScreen/park1.png" />
        <img class="tab-right tab-style" @click="showLeftBoard = false" src="../../../assets/images/controlScreen/factory0.png" />
      </div>
    </div>

    <div v-if="showLeftBoard === false" class="board">
      <a-carousel v-if="dcyList.length > 0" dotPosition="top" :after-change="onChange">
        <div class="swiper-item" v-for="(item, index) in dcyList" :key="index">
          <topo-preview
            v-if="item.pageContentOne && swiperCurrent === index"
            :graphData="JSON.parse(item.pageContentOne)"
            :showApv="false"
            :index="index + ''"
          />
          <img v-else src="../../../assets/images/controlScreen/nodata.png" />
        </div>
      </a-carousel>
      <div class="w-nodata" v-else>
        <img src="../../../assets/images/controlScreen/nodata.png" />
      </div>
      <div class="place-tab">
        <img class="tab-left tab-style" @click="showLeftBoard = true" src="../../../assets/images/controlScreen/park0.png" />
        <img class="tab-right tab-style" @click="showLeftBoard = false" src="../../../assets/images/controlScreen/factory1.png" />
      </div>
    </div>

    <div class="column-data">
      <div class="data-title">
        <!-- 问题整改情况 -->
        <div style="width: 4px; height: 32px; background: #54719f"></div>
        <div class="hidden-num" :class="{ on: currentType === '问题整改情况' }" @click="changeCurrentType('问题整改情况')">问题整改情况</div>
        <div style="width: 4px; height: 32px; background: #54719f"></div>

        <!-- 检查完成率 -->
        <div style="width: 4px; height: 32px; background: #54719f; margin-left: 8px"></div>
        <div class="hidden-change" :class="{ on: currentType === '检查完成率' }" @click="changeCurrentType('检查完成率')">检查完成率</div>
        <div style="width: 4px; height: 32px; background: #54719f"></div>

        <!-- 右侧导航条 -->
        <div class="hidden-time">
          <div class="hidden-time-detail">
            <!-- 第一个下拉框，选择时间范围 -->
            <a-space direction="vertical" :size="10">
              <a-select v-model:value="type" class="custom-select" @change="changeType">
                <a-select-option value="1">按日查看</a-select-option>
                <a-select-option value="2">按月查看</a-select-option>
                <a-select-option value="3">按年查看</a-select-option>
              </a-select>
            </a-space>
            <a-space direction="vertical" :size="10">
              <a-date-picker
                v-model:value="dateTime"
                :allow-clear="false"
                :picker="type === '2' ? 'month' : type === '3' ? 'year' : ''"
                :valueFormat="type === '2' ? 'YYYY-MM' : type === '3' ? 'YYYY' : 'YYYY-MM-DD'"
                style="width: 120px; height: 22px"
                bordered:false
                @change="changeTime"
              >
                <template #suffixIcon>
                  <DownOutlined style="color: white" />
                </template>
              </a-date-picker>
            </a-space>
          </div>
        </div>
      </div>
      <!-- 问题整改情况 -->
      <div v-if="currentType === '问题整改情况'">
        <div :id="'alarmChart_' + currentType" class="data-detail"></div>
      </div>

      <!-- 检查完成率 -->
      <div v-if="currentType === '检查完成率'">
        <div :id="'alarmChart_' + currentType" class="data-detail"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .swiper-item {
    text-align: center;
    height: 685px;
    line-height: 685px;
    > img {
      display: inline-block;
    }
  }
  .custom-select >>> .ant-select-selector {
    background-color: rgba(101, 100, 100, 0); /* 背景色设置 */
    border: 0;
    border-radius: 0;
    padding-right: 30px;
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }

  .custom-select >>> .ant-select-selection-item:hover {
    color: RGBA(185, 223, 252, 1);
  }
  .custom-select >>> .ant-select-selection-item {
    color: RGB(180, 180, 180) !important;
    padding-right: 0px;
    font-size: 15px;
    margin-right: 1px;
    text-align: center;
  }
  .custom-select >>> .ant-select-arrow {
    color: white;
    top: 45%;
    font-size: 15px;
    left: 85px;
  }
  .center-main {
    margin-left: 10px;

    .board {
      width: 1082px;
      height: 685px;
      /* background: url('../../../assets/images/controlScreen/centerbg.png') no-repeat ; */
      position: relative;
      .depart-card {
        cursor: pointer;
        width: 171px;
        height: 83px;
        background: url('../../../assets/images/controlScreen/depart1.png') no-repeat;
        position: relative;
        .depart-card-title {
          width: 140px;
          height: 22px;
          margin-left: 14px;
          margin-top: 2px;
          font-size: 16px;
          color: #fcfcfc;
          font-weight: bold;
        }
        .depart-card-contain {
          width: 140px;
          height: 15px;
          font-size: 12px;
          color: #fcfcfc;
          position: absolute;
          top: 35px;
          left: 20px;
        }
      }
      .part1 {
        position: absolute;
        left: 60px;
        top: 102px;
      }
      .part2 {
        position: absolute;
        left: 250px;
        top: 105px;
      }
      .part3 {
        position: absolute;
        left: 278px;
        top: 173px;
      }
      .part4 {
        position: absolute;
        left: 102px;
        top: 211px;
      }
      .part5 {
        position: absolute;
        left: 330px;
        top: 230px;
      }
      .part6 {
        position: absolute;
        left: 440px;
        top: 312px;
      }
      .part7 {
        position: absolute;
        left: 707px;
        top: 240px;
      }
      .part8 {
        position: absolute;
        left: 825px;
        top: 351px;
      }
      .depart-card-detail {
        width: 305px;
        height: 108px;
        background: url('../../../assets/images/controlScreen/park2_body.png') no-repeat;
        position: relative;
        top: 140px;
        left: 532px;
        .depart-card-detail-bg {
          width: 114px;
          height: 22px;
          background: url('../../../assets/images/controlScreen/park2_head.png') no-repeat;
        }
        .depart-card-title {
          width: 110px;
          height: 22px;
          font-size: 22px;
          font-weight: bold;
          position: absolute;
          left: 13px;
          top: -11px;
        }
        .card-contain-top {
          width: 270px;
          height: 20px;
          display: flex;
          padding: 12px 13px 15px 13px;
          .card-contain-l {
            width: 115px;
            height: 21px;
          }
          .card-contain-r {
            width: 115px;
            height: 21px;
            margin-left: 18px;
          }
        }
        .card-contain-bottom {
          width: 270px;
          height: 20px;
          display: flex;
          padding: 12px 13px 15px 13px;
          .card-contain-l {
            width: 115px;
            height: 21px;
          }
          .card-contain-r {
            width: 115px;
            height: 21px;
            margin-left: 18px;
          }
        }
      }
      .place-tab {
        display: flex;
        width: 257px;
        height: 56px;
        position: absolute;
        left: 420px;
        top: 630px;
        .tab-right {
          margin-left: -5px;
        }
        .tab-style {
          cursor: pointer;
        }
      }
      .w-nodata {
        text-align: center;
        line-height: 685px;
        > img {
          display: inline-block;
        }
      }
    }
    .column-data {
      width: 1080px;
      height: 266px;
      margin-top: 10px;
      .data-title {
        display: flex;
        height: 32px;
        .hidden-num {
          cursor: pointer;
          width: 108px;
          height: 32px;
          background: rgba(32, 59, 98, 0.5);
          /* background: #203B62;
        font-weight: bold; */
          color: #b9dffc;
          margin-left: 2px;
          margin-right: 2px;
          font-size: 16px;
          text-align: center;
          line-height: 32px;
          &.on {
            background: #203b62;
            color: white;
          }
        }

        .hidden-change {
          cursor: pointer;
          width: 124px;
          height: 32px;
          margin-left: 2px;
          margin-right: 2px;
          background: rgba(32, 59, 98, 0.5);
          font-size: 16px;
          text-align: center;
          line-height: 32px;
          color: #b9dffc;

          &.on {
            background: #203b62;

            color: white;
          }
        }
        .hidden-time {
          width: 855px;
          height: 32px;
          background: rgba(32, 59, 98, 0.5);
          margin-left: 6px;
          position: relative;
          .hidden-time-detail {
            font-size: 14px;
            color: #ffffff;
            position: absolute;
            right: 5px;
            top: 2px;
          }
          /deep/ .ant-picker {
            background: rgba(100, 100, 100, 0);
            border: 0;
          }
          /deep/.ant-picker-focused {
            box-shadow: 0 0 0 0px rgba(24, 144, 255, 0);
            color: white;
          }

          /deep/.ant-picker-separator {
            color: white;
          }
          /deep/ .ant-picker-input > input {
            color: white;
          }
          /* 选中下划线 */
          /deep/ .ant-picker-active-bar {
            background: rgba(100, 100, 100, 0);
          }
        }
      }
      .data-detail {
        width: 1080px;
        height: 232px;
      }
    }
  }
</style>
