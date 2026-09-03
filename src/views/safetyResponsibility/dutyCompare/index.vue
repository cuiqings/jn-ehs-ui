<template>
  <div class="duty-compare-container">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="岗位">
              <a-select v-model:value="queryParam.post" placeholder="请选择岗位" @change="getCycleOptions">
                <template v-for="item in postOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="考评周期">
              <a-select v-model:value="queryParam.cycle" placeholder="请选择考评周期">
                <template v-for="item in cycleOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            <!--          增加是否职能部室的勾选-->
          </a-col>
          <a-col :md="2" :sm="6">
            <div style="vertical-align: middle">
              <a-checkbox v-model:checked="queryParam.znOrg" class="checkbox">职能部室</a-checkbox>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="chart-content">
      <div ref="chartRef" class="chart-wrapper"></div>
    </div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="“双清单”履职考评">
        <div class="tab-content" v-if="htmlData1">
          <iframe ref="iframe1Ref" :srcdoc="htmlData1" frameborder="0" style="width: 100%" @load="() => adjustIframeHeight(iframe1Ref)"></iframe>
          <a-button class="download-btn" type="primary" preIcon="ant-design:download-outlined" @click="downloadDoubleExport">下载</a-button>
        </div>
        <a-empty v-else />
      </a-tab-pane>
      <a-tab-pane key="2" tab="扣分明细表">
        <div class="tab-content" v-if="htmlData2">
          <iframe ref="iframe2Ref" :srcdoc="htmlData2" frameborder="0" style="width: 100%" @load="() => adjustIframeHeight(iframe2Ref)"></iframe>

          <a-button class="download-btn" type="primary" preIcon="ant-design:download-outlined" @click="downloadDeductExport">下载</a-button>
        </div>
        <a-empty v-else />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup name="safetyResponsibility-dutyCompare">
  import { ref, onMounted, Ref } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import type { EChartsOption } from 'echarts';
  import { getSamePostList, getRateList, getDoubleList, getDeductList, doubleExport, deductExport } from './dutyCompare.api';
  import { downloadFileAll } from '/@/api/common/api';

  // 图表容器引用
  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
  // iframe 引用
  const iframe1Ref = ref<HTMLIFrameElement | null>(null);
  const iframe2Ref = ref<HTMLIFrameElement | null>(null);
  const postOptions = ref([
    { value: '部长', label: '部长' },
    { value: '安全副部长', label: '安全副部长' },
  ]);
  const queryParam = ref({
    post: postOptions.value[0].value,
    cycle: undefined,
    znOrg: false,
  });
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };

  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 19 },
  };

  const cycleOptions = ref<Array<{ value: string; label: string }>>([]);

  const seriesData = ref([]);
  const xData = ref([]);
  const htmlData1 = ref(null);
  const htmlData2 = ref(null);
  const activeKey = ref('1');
  /**
   * 根据分数获取柱状图颜色
   * @param score 分数
   * @returns 颜色值
   */
  const getBarColor = (score: number): string => {
    if (score >= 86) {
      return '#52c41a'; // 绿色 - 合格
    } else if (score >= 76) {
      return '#1890ff'; // 蓝色 - 基本合格
    } else {
      return '#ff4d4f'; // 红色 - 不合格
    }
  };
  onMounted(() => {
    getCycleOptions(queryParam.value.post);
  });

  async function getSamePost() {
    await getSamePostList({
      post: queryParam.value.post,
      cycle: queryParam.value.cycle,
      znOrg: queryParam.value.znOrg,
    }).then((res) => {
      console.log('getSamePostList res', res);
      if (res) {
        seriesData.value = res.series;
        xData.value = res.xdata;
      }
      initChart();
    });
  }
  async function getCycleOptions(post: string) {
    console.log('getCycleOptions post', post);
    cycleOptions.value = [];
    queryParam.value.cycle = undefined;
    await getRateList({
      post: post,
    }).then((res) => {
      console.log('getRateList res', res);
      if (res && res.length > 0) {
        cycleOptions.value = res.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
        queryParam.value.cycle = res[0];
        searchQuery();
      } else {
        resetData();
      }
    });
  }
  function resetData() {
    activeKey.value = '1';
    htmlData1.value = null;
    htmlData2.value = null;
    seriesData.value = [];
    xData.value = [];
    initChart();
  }
  function searchReset() {
    queryParam.value = {
      post: postOptions.value[0].value,
      cycle: undefined,
    };
    getCycleOptions(queryParam.value.post);
  }
  function searchQuery() {
    if (queryParam.value.post && queryParam.value.cycle) {
      getSamePost();
      getDouble();
      getDeduct();
    } else {
      resetData();
    }
  }
  function getDouble() {
    getDoubleList({
      post: queryParam.value.post,
      cycle: queryParam.value.cycle,
      znOrg: queryParam.value.znOrg,
    }).then((res) => {
      console.log('getDoubleList res', res);
      if (res) {
        htmlData1.value = res;
        // 等待 DOM 更新后调整高度
        setTimeout(() => {
          adjustIframeHeight(iframe1Ref);
        }, 100);
      }
    });
  }
  function getDeduct() {
    getDeductList({
      post: queryParam.value.post,
      cycle: queryParam.value.cycle,
      znOrg: queryParam.value.znOrg,
    }).then((res) => {
      console.log('getDeductList res', res);
      if (res) {
        htmlData2.value = res;
        // 等待 DOM 更新后调整高度
        setTimeout(() => {
          adjustIframeHeight(iframe2Ref);
        }, 100);
      } else {
        htmlData2.value =null;
      }
    });
  }

  /**
   * 初始化图表
   */
  const initChart = () => {
    const option: EChartsOption = {
      title: {
        text: '同岗位人员履职评比',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 700,
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          const score = data.value;
          let level = '';
          if (score >= 86) {
            level = '合格';
          } else if (score >= 76) {
            level = '基本合格';
          } else {
            level = '不合格';
          }
          return `${data.name}<br/>分数: ${score}分<br/>等级: ${level}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xData.value,
      },
      yAxis: {
        type: 'value',
        name: '',
        min: 0,
        max: 100,
      },
      series: [
        {
          name: '履职分数',
          type: 'bar',
          data: seriesData.value.map((item: any) => ({
            value: item.value || item,
            itemStyle: {
              color: getBarColor(item.value || item),
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}分',
          },
        },
      ],
    };

    setOptions(option);
  };
  function downloadDoubleExport() {
    downloadFileAll(doubleExport, `${queryParam.value.post}-${queryParam.value.cycle}-双清单履职考评.pdf`, {
      post: queryParam.value.post,
      cycle: queryParam.value.cycle,
    });
  }
  function downloadDeductExport() {
    downloadFileAll(deductExport, `${queryParam.value.post}-${queryParam.value.cycle}-扣分明细.pdf`, {
      post: queryParam.value.post,
      cycle: queryParam.value.cycle,
      znOrg: znOrg.value,
    });
  }

  /**
   * 调整 iframe 高度自适应
   */
  const adjustIframeHeight = (iframeRef: Ref<HTMLIFrameElement | null> | HTMLIFrameElement | null) => {
    const iframe = iframeRef && typeof iframeRef === 'object' && 'value' in iframeRef ? iframeRef.value : iframeRef;
    if (!iframe) return;
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        const body = iframeDocument.body;
        const html = iframeDocument.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        iframe.style.height = height + 'px';
      }
    } catch (error) {
      console.error('调整 iframe 高度失败:', error);
    }
  };
</script>

<style lang="less" scoped>
  .duty-compare-container {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    .chart-content {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 50px 0;
      .chart-wrapper {
        width: 1000px;
        height: 400px;
      }
    }
  }
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
  .tab-content {
    padding: 40px 20px;
    position: relative;
  }
  .download-btn {
    position: absolute;
    top: -6px;
    right: 20px;
  }
</style>
