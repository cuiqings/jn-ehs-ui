<!-- 报警处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-form ref="formRef" label-width="70px">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="detailInfo.sysDepartName" name="sysDepartName" label="所属机构" />
            <van-field readonly v-model="detailInfo.deviceName" name="deviceName" label="设备名称" />
            <van-field readonly v-model="detailInfo.warnLevel" name="warnLevel" label="报警等级">
              <template #input>
                {{ filterDictTextByCache('warn_level', detailInfo.warnLevel) }}
              </template>
            </van-field>
            <van-field readonly v-model="detailInfo.warnConfigName" name="warnConfigName" label="报警名称" />
            <van-field readonly v-model="detailInfo.warnDate" name="warnDate" label="报警时间" />
            <van-field readonly v-model="detailInfo.notWarnState" name="notWarnState" label="销警方式">
              <template #input>
                {{ filterDictTextByCache('warn_dis_type', detailInfo.notWarnState) }}
              </template>
            </van-field>
            <van-field readonly v-model="detailInfo.warnState" name="warnState" label="报警状态">
              <template #input>
                {{ filterDictTextByCache('warn_state', detailInfo.warnState) }}
              </template>
            </van-field>
            <van-field
              label-class="blue"
              label-align="top"
              label-width="200"
              readonly
              v-model="detailInfo.name"
              name="name"
              autosize
              v-if="detailInfo.relatedPointId"
              label="最近10分钟相关指标数据"
            >
              <template #input>
                <div ref="chartRef" class="chart"></div>
              </template>
            </van-field>
          </van-collapse-item>
          <van-collapse-item title="报警处理" name="2">
            <template v-if="detailInfo.handleRecordVOList && detailInfo.handleRecordVOList.length > 0">
              <div v-for="(item, index) in detailInfo.handleRecordVOList" :key="index">
                <div class="info" v-if="item.warnRecordAssignLog">
                  <van-field readonly label-width="60" v-model="item.warnRecordAssignLog.handlerName" name="handlerName" label="处理人" />
                  <van-field readonly label-width="60" v-model="item.warnRecordAssignLog.description" name="description" label="处理说明" type="textarea" />
                </div>
                <div class="info" v-if="item.warnRecordHandleLog">
                  <van-field readonly label-width="60" v-model="item.warnRecordHandleLog.handlerName" name="handlerName" label="处理人" />
                  <van-field readonly label-width="60" v-model="item.warnRecordHandleLog.updateTime" name="updateTime" label="处理时间" />
                  <van-field readonly label-width="60" v-model="item.warnRecordHandleLog.description" name="description" label="处理说明" type="textarea" />
                  <van-field name="handleExplain" label-width="0">
                    <template #input>
                      <AppUpload disabled v-model:fileList="item.warnRecordHandleLog.fileUrl" />
                    </template>
                  </van-field>
                </div>
                <div v-if="item.warnRecordCheckLog">
                  <van-field label-width="60" readonly v-model="item.warnRecordHandleLog.handlerName" name="handlerName" label="验收结论">
                    <template #input>
                      {{ ['验收不通过', '验收通过'][item.warnRecordCheckLog.checkResult]}}
                    </template>
                  </van-field>
                  <van-field label-width="60" readonly v-model="item.warnRecordCheckLog.description" name="description" label="处理说明" type="textarea" />
                  <van-field name="handleExplain" label-width="0" v-if="item.warnRecordCheckLog.fileUrl">
                    <template #input>
                      <AppUpload disabled v-model:fileList="item.warnRecordCheckLog.fileUrl" />
                    </template>
                  </van-field>
                </div>
              </div>
            </template>
            <!-- 处理 -->
            <template v-if="route.query.taskType == '0' && detailInfo.taskStatus as number < 3 && userStore.getUserInfo.username != detailInfo.handleUserName">
              <van-field
                label-align="top"
                v-model="formData.description"
                name="handleExplain"
                maxlength="200"
                autosize
                required
                type="textarea"
                label="处理说明"
                placeholder="请填写处理说明"
                :rules="[{ required: true, message: '请输入' }]"
              />
              <van-field name="fileUrl" label-width="0">
                <template #input>
                  <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.fileUrl" />
                </template>
              </van-field>
            </template>
            <!-- 验收 -->
            <template v-if="route.query.taskType == '1' && detailInfo.taskStatus as number < 4 && detailInfo.taskStatus as number > 2">
              <van-field required v-model="formData.checkResult" name="checkResult" label="验收结论" :rules="[{ required: true, message: '请选择' }]">
                <template #input>
                  <van-radio-group v-model="formData.checkResult" direction="horizontal">
                    <van-radio name="1">验收通过</van-radio>
                    <van-radio name="0">验收不通过</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
              <van-field
                label-align="top"
                v-model="formData.description"
                name="description"
                maxlength="200"
                autosize
                required
                type="textarea"
                label="处理说明"
                placeholder="请填写处理说明"
                :rules="[{ required: true, message: '请输入' }]"
              />
              <van-field name="fileUrl" label-width="0">
                <template #input>
                  <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.fileUrl" />
                </template>
              </van-field>
            </template>
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>

    <div class="foot">
      <van-button size="small" v-if="canAssign()" :loading="submitIng" @click="assignClick" plain>指派</van-button>
      <van-button size="small" v-if="canHandleS()" :loading="submitIng" @click="submitFn" type="primary">提交</van-button>
      <van-button size="small" v-if="route.query.taskType == '1' && detailInfo.taskStatus == 3" :loading="submitIng" @click="checkFn" type="primary"
        >提交</van-button
      >
    </div>
    <SelectPersonWithOrg @confirm="peConfirm" v-model:show="personShow" />
  </div>
</template>

<script setup lang="ts">
  import { getWarnDetailById, assignWarn, handleWarn, selectNormalChartByPointIds, checkWarn } from './index.api';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { ref, reactive, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import CurLoading from '../components/loading.vue';
  import * as echarts from 'echarts';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { showSuccessToast } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import SelectPersonWithOrg from '../components/personOrg.vue';
  import type { FormInstance } from 'vant';

  const activeNames = ref(['1', '2']);
  const route = useRoute();
  const loading = ref(false); // 页面加载动画
  const submitIng = ref(false); // 提交按钮动画

  const detailInfo = reactive<{
    handleRecordVOList: any[];
    taskStatus?: number;
    assignUserId?: string|null;
    handleUserName?: string|null;
    relatedPointId?: string|null;
    warnDate?: string|null;
    sysDepartName?: string|null;
    deviceName?: string|null;
    warnLevel?: string|null;
    warnConfigName?: string|null;
    notWarnState?: number;
    warnState?: number;
    name?: string|null;
  }>({
    handleRecordVOList: []
  });

  const formData = reactive({
    description: '',
    fileUrl: '',
    checkResult: '',
  });
  
  const userStore: any = useUserStore();
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const personShow = ref(false);

  const chartRef = ref<HTMLElement>();
  let myChart:any = null;

  const canAssign = () => {
    if (detailInfo.taskStatus == 2) {
      return false;
    }
    if (detailInfo.taskStatus == 1 && userStore.getUserInfo.id == detailInfo.assignUserId) {
      return false;
    }
    if (detailInfo.taskStatus == 1 && !detailInfo.assignUserId && !detailInfo.handleUserName) {
      return true;
    }
  };

  const canHandleS = () => {
    if(route.query.taskType != '0') return false;
    if(detailInfo.taskStatus as number > 2) return false;
    if(detailInfo.assignUserId && detailInfo.assignUserId != userStore.getUserInfo.id) return false;
    return true
  }

  onMounted(() => {
    pageInit();
  });
  function pageInit() {
    getDetail(() => {
      if (!detailInfo.relatedPointId) return;
      selectNormalChartByPointIds({
        relatedPointId: detailInfo.relatedPointId,
        warnTime: detailInfo.warnDate,
      }).then((res) => {
        createChart(res);
      });
    });
  }

  function createChart(data) {
    myChart = echarts.init(chartRef.value);
    console.log(myChart);
    let series = Object.keys(data.data).map((key) => {
      let arr = Object.keys(data.data[key]).map((k) => {
        return data.data[key][k];
      });
      return {
        name: key,
        data: arr,
        type: 'line',
      };
    });
    let option = {
      xAxis: {
        type: 'category',
        data: data.xaxisList.map((val) => val.substr(11, 5)),
      },
      tooltip: {
        trigger: 'axis',
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
        data: data.legend,
      },
      series: series,
    };
    option && myChart.setOption(option);
  }

  function getDetail(cb) {
    getWarnDetailById({
      warnRecordId: route.query.id,
    }).then((res) => {
      Object.assign(detailInfo, res);
      cb();
    });
  }

  const peConfirm = (data) => {
    loading.value = true;
    assignWarn({
      warnRecordId: route.query.id,
      assignUserId: data.userId
    })
      .then(() => {
        loading.value = false;
        showSuccessToast('操作成功');
        pageInit()
      })
      .catch(() => {
        loading.value = false;
      });
  };

  const assignClick = () => {
    personShow.value = true;
  };

  const formRef = ref<FormInstance>();
  // 处理提交
  const submitFn = async () => {
    submitIng.value = true;
    let warnAssignLogId = '';
    let warnHandleLogId = '';
    if(detailInfo.handleRecordVOList.length > 0 && 
    detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordAssignLog &&
    route.query.taskType == '0'){
      warnAssignLogId = detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordAssignLog.id
    }
    if(detailInfo.handleRecordVOList.length > 0 && 
    detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordHandleLog &&
    route.query.taskType == '1'){
      warnHandleLogId = detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordHandleLog.id
    }
    formRef.value?.validate().then(() => {
      handleWarn({
        ...formData,
        warnRecordId: route.query.id,
        warnAssignLogId,
        warnHandleLogId
      })
        .then(() => {
          pageInit();
          submitIng.value = false;
        })
        .catch(() => (submitIng.value = false));
    });
  };

  const checkFn = () => {
    submitIng.value = true;
    let warnHandleLogId = '';
    if (detailInfo.handleRecordVOList.length && detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordHandleLog) {
      warnHandleLogId = detailInfo.handleRecordVOList[detailInfo.handleRecordVOList.length - 1].warnRecordHandleLog.id;
    }
    formRef.value?.validate().then(() => {
      checkWarn({
        ...formData,
        warnRecordId: route.query.id,
        warnHandleLogId,
      })
        .then(() => {
          pageInit();
          submitIng.value = false;
        })
        .catch(() => (submitIng.value = false));
    });
  };
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
    .info {
      border-bottom: 2px solid #e5e4e4;
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
  :deep(.van-field__body textarea) {
    // background-color: #ecebeb;
    border: 1px solid #e5e5e5;
    padding: 0 10px;
  }
</style>
<style lang="less">
  .blue {
    label {
      color: #1989fa !important;
    }
  }
</style>
