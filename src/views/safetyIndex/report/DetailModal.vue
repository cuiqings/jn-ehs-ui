<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="1200" :footer="null">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="总览" :forceRender="true">
        <div class="level">
          <div class="level-1">
            <a-progress
              :strokeColor="colorList[detailData.riskLevel]"
              :width="150"
              stroke-linecap="circle"
              :percent="detailData.totalScore"
              type="dashboard"
            >
              <template #format="percent">
                <span style="font-family: D-DIN; font-weight: bold; font-size: 60px; color: rgba(0, 0, 0, 0.87)">{{ percent }}</span>
              </template></a-progress
            >
            <div class="score-text">实时评分</div>
          </div>
          <div class="line"></div>
          <div class="level-2">
            <div class="label" :style="{ background: colorList[detailData.riskLevel], color: level == detailData.riskLevel ? '#000' : 'fff' }">{{
              level[detailData.riskLevel]
            }}</div>
            <div class="desc">
              <a-tooltip>
                <template #title>{{ detailData.riskLevelRemark }}</template>
                {{ detailData.riskLevelRemark }}
              </a-tooltip>
            </div>
            <div class="suggest">综合建议：</div>
            <div class="suggestion">{{ detailData.suggestion }}</div>
          </div>
        </div>
        <div class="risk">
          <div class="title">
            <div class="left">
              <a-tabs v-model:activeKey="activeKeyIndex">
                <a-tab-pane key="1">
                  <template #tab>
                    <span style="font-size: 18px; color: rgba(0, 0, 0, 0.87)">风险指标</span>
                    <span style="font-size: 18px; color: #f43328">（{{ detailData.riskNum || 0 }}）</span>
                  </template>
                </a-tab-pane>
                <a-tab-pane key="2">
                  <template #tab>
                    <span style="font-size: 18px; color: rgba(0, 0, 0, 0.87)">持续关注指标</span>
                    <span style="font-size: 18px; color: #ff8d04">（{{ detailData.noticeNum || 0 }}）</span>
                  </template>
                </a-tab-pane>
              </a-tabs>
            </div>
            <div class="right"
              ><info-circle-outlined style="margin-right: 5px" />
              <span v-if="activeKeyIndex === '1'">这些指标具有一定风验，请及时采取控制指施！</span>
              <span v-if="activeKeyIndex === '2'">这些指标需要注意持续关注！</span>
            </div>
          </div>
          <div class="detail">
            <div class="chart" ref="chartRefDetail"></div>
            <div class="list" v-show="activeKeyIndex == '1'">
              <div class="item" v-for="(item, index) in detailData.riskList" :key="index">
                <img :src="risk5" alt="" />
                <div class="text">
                  <div class="title">{{ item.indx }}</div>
                  <div class="desc">
                    <a-tooltip placement="topLeft">
                      <template #title>{{ item.riskTip }}</template>
                      {{ item.riskTip }}
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="list" v-show="activeKeyIndex == '2'">
              <div class="item" v-for="(item, index) in detailData.noticeList" :key="index">
                <img :src="risk4" alt="" />
                <div class="text">
                  <div class="title">{{ item.indx }}</div>
                  <div class="desc">
                    <a-tooltip placement="topLeft">
                      <template #title>{{ item.riskTip }}</template>
                      {{ item.riskTip }}
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane :key="itemCase.indx" :tab="itemCase.indx" v-for="itemCase in detailData.indxList">
        <div class="level">
          <div class="level-1">
            <a-progress :strokeColor="colorList[itemCase.riskLevel]" :width="150" stroke-linecap="circle" :percent="itemCase.score" type="dashboard">
              <template #format="percent">
                <span style="font-family: D-DIN; font-weight: bold; font-size: 60px; color: rgba(0, 0, 0, 0.87)">{{ percent }}</span>
              </template></a-progress
            >
            <div class="score-text">实时评分</div>
          </div>
          <div class="line"></div>
          <div class="level-2">
            <div class="label" :style="{ background: colorList[itemCase.riskLevel], color: level == itemCase.riskLevel ? '#000' : 'fff' }">{{
              level[itemCase.riskLevel]
            }}</div>
            <div class="desc">
              <a-tooltip>
                <template #title>{{ itemCase.riskLevelRemark }}</template>
                {{ itemCase.riskLevelRemark }}
              </a-tooltip>
            </div>
            <div class="suggest">综合建议：</div>
            <div class="suggestion" v-html="itemCase.suggestion"></div>
          </div>
        </div>
        <a-table :columns="columns" :data-source="itemCase.itemList" :pagination="false" :bordered="true">
          <template #riskTip="{ text }">
            <div style="text-align: left">{{ text }}</div>
          </template>
          <template #riskLevel="{ text }">
            <a-tag v-if="text == '0'" color="#87d068">无风险</a-tag>
            <a-tag v-if="text == '1'" color="#51d8de">低风险</a-tag>
            <a-tag v-if="text == '2'" color="#ffd902">中风险</a-tag>
            <a-tag v-if="text == '3'" color="#f50">高风险</a-tag>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import * as echarts from 'echarts';
  import risk4 from '/@/assets/images/risk4.png';
  import risk5 from '/@/assets/images/risk5.png';
  const activeKey = ref('1');
  const activeKeyIndex = ref('1');
  const detailData = ref({});
  const chartRefDetail = ref();
  const title = ref('');
  const columns = [
    {
      title: '指标项',
      dataIndex: 'item',
      align: 'center',
      width: '15%',
    },
    {
      title: '得分',
      dataIndex: 'score',
      align: 'center',
      width: '10%',
      customRender: ({ text }) => {
        return `${text}分`;
      },
    },
    {
      title: '风险提示',
      dataIndex: 'riskTip',
      align: 'center',
      slots: { customRender: 'riskTip' },
    },
    {
      title: '风险值',
      dataIndex: 'riskLevel',
      align: 'center',
      width: '10%',
      slots: { customRender: 'riskLevel' },
    },
  ];
  const colorList = {
    '1': '#09C199',
    '2': '#51D8DE',
    '3': '#FFD902',
    '4': '#FF8D04',
    '5': '#F43328',
  };
  const level = {
    '1': '低风险',
    '2': '中低风险',
    '3': '中风险',
    '4': '中高风险',
    '5': '高风险',
  };
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('registerModal detail', data);
    activeKey.value = '1';
    activeKeyIndex.value = '1';
    detailData.value = data.record;
    title.value = data.title;
    if (data.record.indxList && data.record.indxList.length > 0) {
      let indicator = [];
      let objValue = [];
      data.record.indxList.forEach((item) => {
        indicator.push({
          name: item.indx,
          max: 100,
        });
        objValue.push(Number(item.score));
      });
      await getChartView(indicator, objValue);
    }
  });
  function getChartView(indicator, objValue) {
    chartRefDetail.value = echarts.init(chartRefDetail.value);
    let option = {
      title: {
        text: '',
      },
      color: ['#FF917C'],
      grid: {
        left: '2%',
        right: '2%',
        top: '8%',
        bottom: '8%',
      },
      radar: {
        // shape: 'circle',
        indicator: indicator,
        center: ['49%', '50%'],
        radius: 60,
      },
      series: [
        {
          name: '',
          type: 'radar',
          data: [
            {
              value: objValue,
              name: '',
              areaStyle: {
                color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                  {
                    color: 'rgba(255, 145, 124, 0.1)',
                    offset: 0,
                  },
                  {
                    color: 'rgba(255, 145, 124, 0.9)',
                    offset: 1,
                  },
                ]),
              },
            },
          ],
        },
      ],
    };
    option && chartRefDetail.value.setOption(option);
  }
</script>
<style scoped lang="less">
  .level {
    display: flex;
    align-items: center;
    background: #f5f8fb;
    margin-bottom: 20px;
    .level-1 {
      width: 232px;
      position: relative;
      text-align: center;
      .score-text {
        position: absolute;
        bottom: 16px;
        left: 83px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
    .line {
      width: 1px;
      height: 160px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      margin: 25px 0;
    }
    .level-2 {
      margin-left: 32px;
      width: 930px;
      .label {
        width: 63px;
        height: 27px;
        background: #09c199;
        border-radius: 4px 4px 4px 4px;
        font-size: 14px;
        color: #ffffff;
        text-align: center;
        line-height: 27px;
      }
      .desc {
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        text-align: left;
        margin-top: 8px;
        overflow: hidden;
      }
      .suggest {
        margin-top: 16px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
      }
      .suggestion {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 400;
        margin-top: 4px;
      }
    }
  }
  .risk {
    .title {
      display: flex;
      justify-content: space-between;
      .left {
        font-size: 20px;
        color: rgba(0, 0, 0, 0.87);
        margin-left: 266px;
      }
      .right {
        font-weight: 400;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 12px;
      }
    }

    .detail {
      display: flex;
      .chart {
        width: 244px;
        height: 236px;
        background: #f5f8fb;
      }
      .list {
        height: 236px;
        overflow-y: auto;
        background: #fff;
        border-radius: 6px 6px 6px 6px;
        margin-left: 20px;
        .item {
          display: flex;
          align-items: center;

          height: 67px;
          padding: 0 20px;
          background: #f5f8fb;
          border-radius: 4px 4px 4px 4px;
          margin-bottom: 20px;
          img {
            width: 38px;
            height: 35px;
            margin-right: 12px;
          }
          .text {
            .title {
              font-size: 16px;
              color: rgba(0, 0, 0, 0.87);
            }
            .desc {
              width: 827px;
              font-size: 14px;
              color: rgba(0, 0, 0, 0.6);
              // 超出一行显示省略号
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
</style>
