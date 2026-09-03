<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      :width="1300"
      title="报警记录"
      wrap-class-name="video-modal"
      destroyOnClose
      @cancel="close"
    >
      <template #closeIcon> <CloseOutlined /></template>
      <div class="modal-body">
        <div>
          <video
            id="video"
            style="object-fit: fill; width: 100%; height: 350px; margin-bottom: 10px"
            controls
            autoplay
            autobuffer
            muted
            preload="auto"
          ></video>
          <div>
            <div>摄像头名称：{{ info.cameraName }}</div>
            <div>{{ info.time }}</div>
          </div>
          <div v-if="cameraType.includes('温度') || cameraType.includes('OCR识别')">
            <div
              ><a-date-picker v-model:value="date" value-format="YYYY-MM-DD" style="width: 180px" /><a-button
                type="primary"
                style="margin-left: 15px"
                @click="searchEcharts"
                >查询</a-button
              ></div
            >
            <div ref="temperatureRef" style="width: 100%; height: 250px"></div>
          </div>
        </div>
        <div>
          <a-table
            :columns="cameraType.includes('温度') || cameraType.includes('OCR识别') ? columns : columns1"
            :data-source="dataSource"
            :pagination="false"
            bordered
            :scroll="{ y: '604px' }"
          >
            <template #collectImg="{ record }">
              <img
                v-if="record.imgUrl"
                :src="fmtImg(record)"
                style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                @click="openImg(record)"
              />
              <span v-if="!record.imgUrl">无</span>
            </template>
          </a-table>
        </div>
      </div>
      <!-- 分页 -->
      <div class="bottom-page" v-if="dataSource.length > 0">
        <pagination
          v-model:current="page.pageNo"
          v-model:pageSize="page.pageSize"
          style="margin: 10px 0"
          size="small"
          :pageSizeOptions="[]"
          show-quick-jumper
          :total="page.total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="onChange"
        />
      </div>
      <template #footer>
        <div>
          <a-button @click="close">取消</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="video-modal" setup>
  import { ref, nextTick, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import * as echarts from 'echarts';
  import { details, viewChart } from './url/index';
  import { useGlobSetting } from '/@/hooks/setting';
  import { Pagination } from 'ant-design-vue';
  const globSetting = useGlobSetting();
  const cameraRtcUrl = globSetting.cameraRtcUrl;
  const date = ref(dateFormat(new Date(), 'yyyy-MM-dd'));
  const temperatureRef = ref();
  const dataSource = ref([]);
  const webRtcServerModel = ref();
  const cameraType = ref('');
  const columns = [
    {
      title: '采集时间',
      dataIndex: 'gatherTime',
      align: 'center',
    },
    {
      title: '采集数值',
      dataIndex: 'gatherValue',
      align: 'center',
    },
    {
      title: '采集图像',
      dataIndex: 'imgUrl',
      align: 'center',
      slots: { customRender: 'collectImg' },
    },
  ];
  const columns1 = [
    {
      title: '采集时间',
      dataIndex: 'gatherTime',
      align: 'center',
    },
    {
      title: '采集图像',
      dataIndex: 'imgUrl',
      align: 'center',
      slots: { customRender: 'collectImg' },
    },
  ];
  const info: any = ref({
    cameraName: '',
    time: '',
  });
  const id = ref('');
  const timer = ref();
  const page = reactive({
    total: 0, // 共多少条
    pageSize: 10,
    pageNo: 1,
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    id.value = data.data.id;
    cameraType.value = data.data.cameraType;
    info.value.cameraName = data.data.cameraName;
    info.value.time = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
    timer.value = setInterval(() => {
      info.value.time = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
    }, 1000);
    initWebRtcServer(
      `rtsp://${data.data.userName}:${data.data.password}@${data.data.cameraIp}:${data.data.cameraPort}/h264/ch1/Streaming/Channels/101`,
      'video'
    );
    initRecord();
    if (cameraType.value.includes('温度') || cameraType.value.includes('OCR识别')) {
      init();
    }
  });
  const initRecord = () => {
    details({ id: id.value, pageNo: page.pageNo, pageSize: page.pageSize }).then((res) => {
      if (res) {
        dataSource.value = res?.records;
        page.total = res?.total;
      }
    });
  };
  const init = () => {
    viewChart({
      id: id.value,
      queryTime: date.value,
    }).then((res) => {
      const data = res.xData;
      const colorArr = ['#FF745A', '#FFAD6A', '#ffe0ab', '#c08ef2', '#6bc5f4', '#159AFF', '#66E1DF', '#E3F170', '#66E193'];
      const series = res.data.map((item, index) => {
        item.type = 'line';
        item.showSymbol = false;
        item.symbol = 'none';
        item.smooth = true;
        item.itemStyle = {
          //折线拐点标志的样式
          color: colorArr[index],
          borderColor: colorArr[index],
          borderWidth: 1,
        };
        item.data = item.data.map((item, index) => {
          return [data[index], item.v];
        });
        return item;
      });
      temperatureEcharts(series, colorArr);
    });
  };
  const temperatureEcharts = (series, colorArr) => {
    const myChart = echarts.init(temperatureRef.value);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            color: '#4B87FF',
          },
        },
        formatter: function (params) {
          let html = '';
          params.forEach((v) => {
            const date = new Date(v.data[0]);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const formattedHours = hours < 10 ? '0' + hours : hours;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
            html += `<div style="color: #666;font-size: 14px;line-height: 24px">
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
                  colorArr[v.componentIndex]
                };"></span>
                ${v.seriesName}
                <span style="color:${colorArr[v.componentIndex]};font-size: 14px"> ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${
              v.data[1]
            }${cameraType.value.includes('OCR识别') ? '' : '℃'}</span>`;
          });

          return html;
        },
      },
      grid: {
        top: '10%', //上边距
        right: '20', //右边距
        left: '20', //左边距
        bottom: '12%', //下边距
        containLabel: true,
      },
      dataZoom: [
        {
          show: true,
          height: 12,
          xAxisIndex: [0],
          bottom: '6%',
          start: 0,
          end: 100,
          handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
          handleSize: '110%',
          handleStyle: {
            color: '#d3dee5',
          },
          color: '#fff',
          borderColor: '#90979c',
        },
        {
          type: 'inside',
          show: true,
          height: 15,
          start: 1,
          end: 35,
        },
      ],
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisTick: {
          show: false, //隐藏X轴刻度
        },
        axisLine: {
          lineStyle: {
            color: '#CCCCCC',
          },
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#000',
            fontSize: 14,
            fontFamily: 'Source Han Sans CN-Regular',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          boundaryGap: [0, '100%'],
          nameTextStyle: {
            color: 'rgba(0,0,0,0.65)',
            fontSize: 14,
            fontFamily: 'Source Han Sans CN-Regular',
            verticalAlign: 'center',
          },
          axisLabel: {
            color: 'rgba(0,0,0,0.65)',
            textStyle: {
              fontSize: 14,
            },
            formatter: cameraType.value.includes('OCR识别') ? '{value}' : '{value}℃',
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: 'rgba(223, 223, 223, 1)',
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(223, 223, 223, 1)',
              type: 'dashed',
            },
          },
        },
      ],
      series,
    };
    myChart.setOption(option);
  };
  const searchEcharts = () => {
    init();
  };
  const initWebRtcServer = async (videoUrls: any, id) => {
    nextTick(() => {
      webRtcServerModel.value = new WebRtcStreamer(id, cameraRtcUrl);
      webRtcServerModel.value.connect(videoUrls, null);
    });
  };
  const onChange = (pageNumber: number) => {
    page.pageNo = pageNumber;
    initRecord();
  };
  const openImg = (record) => {
    const imageList = record.imgUrl.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const fmtImg = (record: any) => {
    const firstImg = record.imgUrl.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
  const close = () => {
    if (webRtcServerModel.value) webRtcServerModel.value.disconnect();
    clearInterval(timer.value);
    closeModal();
  };
</script>
<style lang="less" scoped>
  .modal-body {
    display: flex;
    justify-content: space-between;
    height: 673px;
    overflow: hidden;
    & > div:nth-child(1) {
      width: calc(60% - 30px);
      & > div:nth-child(2) {
        display: flex;
        justify-content: space-between;
        margin: 0 10px;
        margin-bottom: 15px;
      }
    }
    & > div:nth-child(2) {
      width: 40%;
      & > div {
        margin-bottom: 10px;
        & > div {
          margin-bottom: 10px;
        }
      }
    }
  }
  .bottom-page {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 20px;
  }
  /deep/ .ant-table-tbody {
    max-height: 565px;
    overflow-y: auto;
  }
</style>
<style lang="less">
  .video-modal {
    .scroll-container {
      .scrollbar__wrap {
        margin-bottom: 0 !important;
      }
    }
  }
</style>
