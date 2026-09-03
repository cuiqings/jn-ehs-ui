<!-- 报警处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-form label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="所属机构" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="设备名称" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="报警等级" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="报警名称" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="报警时间" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="销警方式" />
            <van-field readonly v-model="detailInfo.name" name="name" autosize label="报警状态" />
            <van-field
              label-class="blue"
              label-align="top"
              label-width="200"
              readonly
              v-model="detailInfo.name"
              name="name"
              autosize
              label="最近10分钟相关指标数据"
            >
              <template #input>
                <div ref="chartRef" class="chart"></div>
              </template>
            </van-field>
          </van-collapse-item>
          <van-collapse-item title="报警处理" name="2">
            <template v-if="true">
              <van-field readonly v-model="detailInfo.name" name="name" autosize label="处理人" />
              <van-field readonly v-model="detailInfo.name" name="name" autosize label="处理时间" />
              <van-field readonly v-model="detailInfo.name" name="name" autosize label="处理说明" type="textarea" />
              <van-field name="handleExplain" label-width="0">
                <template #input>
                  <AppUpload :watermarkText="watermarkText" disabled :maxCount="10" v-model:fileList="formData.handlePicture" />
                </template>
              </van-field>
            </template>
            <!-- 处理 -->
            <template v-if="true">
              <van-field
                label-align="top"
                v-model="formData.handleExplain"
                name="handleExplain"
                maxlength="200"
                autosize
                type="textarea"
                label="处理说明"
                placeholder="请填写处理说明"
              />
              <van-field name="handleExplain" label-width="0">
                <template #input>
                  <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.handlePicture" />
                </template>
              </van-field>
            </template>
            <!-- 验收 -->
            <template v-if="true">
              <van-field
                v-model="formData.handleExplain"
                name="handleExplain"
                label="验收结论"
                placeholder="请填写处理说明"
              >
                <template #input>
                  <van-radio-group v-model="formData.handleExplain" direction="horizontal">
                    <van-radio name="1">验收通过</van-radio>
                    <van-radio name="0">验收不通过</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
              <van-field
                label-align="top"
                v-model="formData.handleExplain"
                name="handleExplain"
                maxlength="200"
                autosize
                type="textarea"
                label="处理说明"
                placeholder="请填写处理说明"
              />
              <van-field name="handleExplain" label-width="0">
                <template #input>
                  <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.handlePicture" />
                </template>
              </van-field>
            </template>
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { showImagePreview } from 'vant';
  import { getWarnDetailById } from './index.api'
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { ref, reactive, watch, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import CurLoading from '../components/loading.vue';
  import * as echarts from 'echarts';
  import { showSuccessToast, showConfirmDialog } from 'vant';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  interface IFormData {
    confirm: any;
  }

  const activeNames = ref(['1', '2']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false); // 页面加载动画
  const submitIng = ref(false); // 提交按钮动画
  const detailInfo: IFormData = reactive({});
  const formData = reactive({
    handleExplain: '',
    handlePicture: '',
  });

  const personShow = ref(false);

  const chartRef = ref<HTMLElement>();
  const myChart = ref<any>();
  onMounted(() => {
    pageInit();
  });
  function pageInit() {
    getDetail();
    createChart({});
  }
  function createChart(data) {
    myChart.value = echarts.init(chartRef.value);
    console.log(myChart.value);

    let option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      grid: {
        right: '2%',
        top: '10%',
        bottom: '10%',
      },
      yAxis: {
        type: 'value',
      },
      legend: {
        data: ['一号线'],
      },
      series: [
        {
          name: '一号线',
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line',
        },
      ],
    };
    option && myChart.value.setOption(option);
  }

  function getDetail() {
    getWarnDetailById({
      id: route.query.id,
    }).then(res => {
      console.log(res);
      
    })
  }

  const goBack = () => {
    personShow.value = true;
  };

  function splitImg(res) {
    if (!res.departName) res.departName = res.orgName;
    if (res.yhPicture) {
      let arr = res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      let arr = res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item));
      res.repairPicture = arr;
    }
  }

  // 处理提交
  const submitFn = async () => {};
</script>
<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;

    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
    }
    .chart {
      width: 100%;
      height: 230px;
    }

    .foot {
      width: 100%;
      height: 55px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;

      .van-button {
        margin-right: 15px;
      }
    }
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .blue {
    label {
      color: #1989fa !important;
    }
  }
</style>
<style lang="less">
  .blue {
    label {
      color: #1989fa !important;
    }
  }
</style>
