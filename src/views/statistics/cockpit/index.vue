<template>
  <div class="cockpit" v-loading="loading">
    <div class="top">
      <div class="left">
        <div v-loading="loading1" ref="chartRef" class="chart-wrap"></div>
      </div>
      <div class="right">
        <div class="hd">
          <div class="tit">事业部综合排名</div>
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 15px;">
              按月：<a-checkbox v-model:checked="month" @change="randomdate = !month"></a-checkbox> &nbsp;&nbsp;
              任意时间：<a-checkbox v-model:checked="randomdate" @change="month = !randomdate" style="margin: 0;"></a-checkbox>
            </div>
            
            <span>选择日期：</span>
            <!-- <a-range-picker v-if="month" :allowClear="false" format="YYYY-MM" valueFormat="YYYY-MM" v-model:value="date" @change="dateChange" picker="month" /> -->
             <a-date-picker v-if="month" :allowClear="false" format="YYYY-MM" valueFormat="YYYY-MM" v-model:value="Mdate" @change="dateChange" picker="month" />
            <a-range-picker v-else :allowClear="false" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" @change="dateChange" v-model:value="date" />
          </div>
        </div>

        <div class="item" v-for="(item, idx) in barData">
          <div class="l">{{ item.orgName }}</div>
          <div class="c">
            <div class="bar" :style="{width: item.score * 1 + '%'}" :class="{bar2: idx > barData.length - 4}"></div>
            <div class="num"><span :class="{oragne: idx > barData.length - 4}">{{ item.score }}</span><i>分</i></div>
          </div>
          <div class="r">第<i :class="{oragne: idx > barData.length - 4}">{{ idx + 1 }}</i>名</div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="list" v-for="item in itemList">
        <div class="hd">{{ item.title }}<span>{{item.avgScore}}</span></div>
        <div class="content">
          <div class="item" v-for="(value, idx) in item.items">
            <div class="l"><span v-if="value.score > 0" :class="{high: idx < 3}">{{ value.serialNumber }}</span>{{ value.orgName }}</div>
            <div class="r" v-if="value.score > 0">{{value.score}}分</div>
            <div class="c" v-else>--</div>
          </div>
        </div>
        <div class="hold">
          <div class="tit">待改进项</div>
          <ul>
            <li v-if="item.improveOne">{{item.improveOne}}</li>
            <li v-if="item.improveTwo">{{item.improveTwo}}</li>
            <li v-if="item.improveThree">{{item.improveThree}}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, Ref, onMounted, reactive, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { statistics23 } from './api';
  import dayjs from 'dayjs';

  const Mdate = ref(dayjs().subtract(1, 'month').format('YYYY-MM'));
  const date = ref([dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);
  const chartRef = ref<HTMLDivElement | null>(null);
  const month = ref(true);
  const randomdate = ref(false);
  const loading1 = ref(false);
  const barData = ref<any[]>([
          { "score": 0, "orgName": "第三炼铁事业部" },
          { "score": 0, "orgName": "辅料事业部" },
          { "score": 0, "orgName": "第二炼铁事业部" },
          { "score": 0, "orgName": "第一炼钢事业部" },
          { "score": 0, "orgName": "维修事业部" },
          { "score": 0, "orgName": "动力事业部" },
          { "score": 0, "orgName": "棒材事业部" },
          { "score": 0, "orgName": "第二炼钢事业部" },
          { "score": 0, "orgName": "第一炼铁事业部" },
          { "score": 0, "orgName": "热卷板事业部" },
          { "score": 0, "orgName": "高品钢科技有限公司" },
          { "score": 0, "orgName": "原料管理部" }
        ]);
  const loading = ref(false);
  
  const itemList = ref<any[]>([
    {title: '年度安全教育培训', key: 'trainData'},
    {title: '高危作业', key: 'workData'},
    {title: '煤气预警设备在线率', key: 'alarmData'},
    {title: '隐患整改情况', key: 'yhData'},
  ]);
  
  const count = ref(0)

  onMounted(async () => {
    pageInit();
    nextTick(() => { 
      count.value = 10;
    });
  });
  const pageInit = async () => {
    loading.value = true;
    if(month.value) {
      date.value = [dayjs(Mdate.value).startOf('month').format('YYYY-MM-DD'), dayjs(Mdate.value).endOf('month').format('YYYY-MM-DD')];
    }
    statistics23({
      startDate: date.value[0],
      endDate: date.value[1]
    }).then(res => {
      let map = {
        trainData: '年度安全教育培训',
        alarmData: '煤气预警设备在线率',
        yhData: '隐患整改情况',
        workData: '高危作业',
      }
      barData.value = res.deptList;
      Object.keys(res).forEach(key => { 
        if(map[key]){
          map[key] = res[key].avgScore
        }
        itemList.value.forEach(item => { 
          if(item.key == key) {
            Object.assign(item, res[key])
          }
        })
      });
      chartInit1(Object.keys(map).map(key => map[key]));
    }).finally(() => {
      loading.value = false;
    });
  };

  const chartInit1 = (data) => {
    const { setOptions, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);
    const option = reactive<any>({
        title: {
          text: '安全管理模块得分',
        },
        legend: {
          show: false,
          bottom: 0,
          data: ['得分'],
        },
        grid: {
          top: '30%',
          bottom: 100,
          left: 100,
          right: 100,
        },
        radar: {
          indicator: [
            { name: '年度安全教育培训', max: 100, color: '#333733' },
            { name: '煤气预警设备\n在线率', max: 100, color: '#333733' },
            { name: '隐患整改情况', max: 100, color: '#333733' },
            { name: '高危作业', max: 100, color: '#333733' },
          ],
        },
        tooltip: {
          trigger: 'axis'
        },
        series: [
          {
            type: 'radar',
            tooltip: {
        trigger: 'item'
      },
            data: [
              {
                value: data,
                name: '得分',
                areaStyle: {
                  color: 'rgba(55, 162, 218, 0.6)'
                }
              },
            ],
          },
        ],
      });
    setOptions(option);
  };

  const dateChange = (D) => {
    // if(month.value) {
    //   date.value[0] = dayjs(D[0]).startOf('month').format('YYYY-MM-DD');
    //   date.value[1] = dayjs(D[1]).endOf('month').format('YYYY-MM-DD');
    // }
    // console.log(date.value);
    
    pageInit();
  };
</script>
<style lang="less">
  .cockpit {
    width: 100%;
    padding: 10px;
    .top {
      width: 100%;
      height: auto;
      display: flex;
      justify-content: space-between;
      .left {
        width: 430px;
        height: 100%;
        min-height: 300px;
        background-color: #ffffff;
        border-radius: 8px;
        margin-right: 10px;
        padding: 15px;
        position: relative;
        .chart-wrap{
          width: 100%;
          position: absolute;
          top: 15px;
          bottom: 15px;
        }
      }
      .right {
        flex: 1;
        height: 100%;
        background-color: #ffffff;
        border-radius: 8px;
        position: relative;
        padding: 15px;
        padding-top: 50px;
        .hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: absolute;
          right: 15px;
          top: 10px;
          left: 15px;
          .tit{
            font-size: 16px;
            font-weight: 600;
          }
        }
        .item{
          width: 100%;
          height: 20px;
          display: flex;
          align-items: center;
          padding: 4px 0;
          .l{
            width: 160px;
            text-align: right;
            padding-right: 15px;
          }
          .c{
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #666;
            .bar{
              width: 0px;
              height: 100%;
              background-color: #1677ff;
              border-radius: 0 10px 10px 0;
              transition: width 0.6s ease;
            }
            .bar2{
              background-color: orange;
            }
            .num{
              width: 75px;
              vertical-align: baseline;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              span{
                font-size: 18px;
                font-weight: 600;
                color: #1677ff;
              }
              i{
                font-style: normal;
                transform: translateY(2px);
              }
            }
          }
          .oragne{
              color: orange !important;
              span{
                color: orange !important;
              }
            }
          .r{
            width: 78px;
            height: 100%;
            display: flex;
            align-items: center;
            text-align: left;
            padding-left: 15px;
            i{
              font-size: 18px;
              font-weight: 600;
              color: #1677ff;
              padding: 0 5px;
            }
          }
        }
      }
    }
    .main {
      width: 100%;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-top: 10px;
      .list {
        width: calc(25% - 7px);
        height: auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 10px 15px;
        .hd{
          padding-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          span{
            font-size: 20px;
            color: #1677ff;
          }
        }
        .content{
          width: 100%;
          .item{
            padding: 2px 0;
            display: flex;
            justify-content: space-between;
            .l{
              font-size: 13px;
              display: flex;
              align-items: center;
              span{
                color: #ffffff;
                width: 18px;
                height: 18px;
                border-radius: 3px;
                background-color: #a3a3a3;
                text-align: center;
                line-height: 18px;
                margin-right: 10px;
              }
              .high{
                background-color: #1677ff;
              }
            }
            .r{
              font-size: 14px;
              font-weight: 600;
              color: #7ccf00;
            }
          }
        }
        .hold{
          .tit{
            color: #ff4d4f;
            display: flex;
            align-items: center;
            &::before{
              content: '';
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
              background-color: #ff4d4f;
              margin-right: 5px;
            }
          }
          ul{
            li{
              font-size: 13px;
               &::before{
                content: '';
                width: 5px;
                height: 5px;
                border-radius: 50%;
                display: inline-block;
                background-color: #ff4d4f;
                margin-right: 5px;
                transform: translateY(-3px);
              }
            }
          }
        }
      }
    }
  }
</style>
