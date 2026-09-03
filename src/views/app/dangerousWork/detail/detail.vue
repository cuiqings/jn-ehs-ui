<template>
  <div class="hazardous-apply">
    <div class="hazardous-apply-main-nav" v-loading="loading">
      <van-tabs v-model:active="active" :before-change="beforeChange">
        <van-tab title="作业信息" :name="1">
          <div class="tab-inner">
            <StepCircle v-if="stepArrs && stepArrs.length > 0" :active="active" :steps="stepArrs" />
            <WorkMain
              v-if="!loading"
              v-for="(item, index) in workList"
              :key="index"
              :work-index="index"
              :disabled="true"
              ref="componentRef"
              :detailInfo="item"
            />
            <div class="exam-list">
              <div class="tit1">作业审批</div>
              <ul v-if="detailInfo.examineInfoList && detailInfo.examineInfoList.length > 0" v-for="item in detailInfo.examineInfoList">
                <li class="tit">{{ item.nodeName }}</li>
                <li style="padding: 0" v-if="['接受交底'].includes(item.nodeName)" title="安全交底" name="1">
                  <SafetySubmit :readonly="true" ref="safetySubmitRef" :formData="detailInfo" />
                </li>
                <template v-for="citem in item.examineInfoItemList">
                  <li>{{ citem.operatorName }} {{ citem.createTime }}</li>
                  <li><img :src="reviewImg(citem.sign)" alt="" /></li>
                </template>
                <li v-if="item.nodeName == '作业前安全检查(现场监护人)'" title="安全检查：" name="2">
                  <DealyDialogReview :nodeInfo="item" :formData="detailInfo" />
                </li>
              </ul>
              <div v-if="kjList.length > 0 && showAnalysis()">
                <div class="tit">气体检测分析</div>
                <GasList workType="2" :readonly="true" :nodeInfo="{}" :workAnalysisList="kjList" />
              </div>
              <div v-if="dhList.length > 0 && showAnalysis()">
                <div class="tit">动火分析</div>
                <GasList workType="3" :readonly="true" :nodeInfo="{}" :workAnalysisList="dhList" />
              </div>
              <div v-if="workList[0].accessSpaceList && workList[0].accessSpaceList.length > 0">
                <div class="tit">进出有限空间作业登记表</div>
                <InoutList :accessSpaceList="workList[0].accessSpaceList" />
              </div>
              <div v-if="workList[0].procedureList && workList[0].procedureList.length > 0">
                <div class="tit">操作步骤完成情况</div>
                <HandleStep :procedureList="workList[0].procedureList" />
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="审批流程" :name="2">
          <div class="tab-inner">
            <StepCircle v-if="stepArrs && stepArrs.length > 0" :active="active" :steps="stepArrs" />
            <ApprovalProcess :workType="workType" :workGrade="workGrade" ref="approvalProcessRef" :detailInfo="detailInfo" />
          </div>
        </van-tab>
        <van-tab title="安全作业检查" :name="3" v-if="workCheckList.length > 0">
          <div class="zrr">责任人：{{ workList[0].sceneHeadName }}</div>
          <div class="work-checkitem" v-for="item in workCheckList" :key="item.id">
            <van-field label-width="110" readonly v-model="item.head" name="applicant" input-align="right" label="检查人" />
            <van-field label-width="110" readonly v-model="item.unitType" name="applicant" input-align="right" label="检查层级">
              <template #input v-if="item.unitType === '1'"> 安全部 </template>
              <template #input v-if="item.unitType === '2'"> 副部长 </template>
              <template #input v-if="item.unitType === '6'"> 安全科长 </template>
              <template #input v-if="item.unitType === '3'"> 安全科 </template>
              <template #input v-if="item.unitType === '4'"> 车间主任 </template>
              <template #input v-if="item.unitType === '5'"> 班组长 </template>
            </van-field>
            <van-field label-width="110" readonly v-model="item.checkTime" name="applicationTime" input-align="right" label="检查时间" />
            <van-field name="delayReason" input-align="right" label="检查结果">
              <template #input>
                {{ item.result }}
              </template>
            </van-field>
            <van-field name="delayReason" input-align="right" label="是否转交权限">
              <template #input>
                {{ item.transfer == '1' ? '是' : '否' }}
              </template>
            </van-field>
            <van-field name="delayReason" input-align="right" label="隐患类别">
              <template #input>
                {{ item.yhlb }}
              </template>
            </van-field>
            <van-field name="delayReason" input-align="right" label="检查描述">
              <template #input>
                {{ item.remark }}
              </template>
            </van-field>
            <van-field label-align="top" input-align="left" v-if="hasCheckImg(item)">
              <template #input>
                <CheckImgView :record="item" />
              </template>
            </van-field>
            <div class="item-info" v-for="(citem, idx) in item.reformList" :key="idx">
              <van-field label-width="110" readonly v-model="citem.headName" name="applicant" input-align="right" label="整改人" />
              <van-field label-width="110" readonly v-model="citem.reformTime" name="reformTime" input-align="right" label="整改时间" />
              <van-field name="result" input-align="right" label="整改措施">
                <template #input>
                  {{ citem.result }}
                </template>
              </van-field>
              <van-field label-align="top" input-align="left" v-if="citem.imgUrl">
                <template #input>
                  <AppUpload v-model:fileList="citem.imgUrl" :disabled="true" />
                </template>
              </van-field>
              <van-field label-width="110" readonly v-model="citem.confirmResult" name="confirmResult" input-align="right" label="整改确认" />
              <van-field label-width="110" readonly v-model="citem.confirmHeadName" name="confirmHeadName" input-align="right" label="确认人" />
              <van-field label-width="110" readonly v-model="citem.confirmTime" name="confirmTime" input-align="right" label="确认时间" />
            </div>
          </div>
        </van-tab>
      </van-tabs>
      <div class="foot" v-if="route.query.taskStatus">
        <van-button type="primary" @click="ecsDialogShow = true">开始作业</van-button>
      </div>
    </div>
    <ecsDialog :item="detailInfo" @submit="ecsSubmit" v-model:show="ecsDialogShow" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onBeforeUnmount } from 'vue';
  import ApprovalProcess from './components/approvalProcess.vue';
  import ecsDialog from '../components/ecsDialog.vue';
  import SafetySubmit from './components/safetySubmit.vue';
  import { getWorkJobWorkDetail, getWorkDetail, getWorkCheckList, postStartWork } from '../../../hazardousOperation/api/index';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useRoute, useRouter } from 'vue-router';
  import DealyDialogReview from '../components/delayDialogReview.vue';
  import StepCircle from '../../components/stepCircle.vue';
  import { setAppTitle } from '/@/utils/index';
  import WorkMain from '../ask/workMain.vue';
  import GasList from './components/gasList.vue';
  import InoutList from './components/inoutList.vue';
  import HandleStep from './components/handleStep.vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import CheckImgView from '../components/checkImgView.vue';
  import { hasCheckImg } from '/@/views/hazardousOperation/constants/checkImg';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import { showSuccessToast } from 'vant';

  setAppTitle();
  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);

  const loading = ref(false);
  const route = useRoute();
  const router = useRouter();
  const componentRef = ref<InstanceType<typeof WorkMain> | null>(null);
  const active = ref(1);
  const detailInfo = reactive<any>({});
  const approvalProcessRef = ref();
  const workType = ref('1');
  const workGrade = ref('');

  pageInit();
  const workCheckList = ref<any[]>([]);
  async function pageInit() {
    // 获取作业详情
    if (route.query.id) {
      loading.value = true;
      getWorkDetail(route.query.id as string).then((res) => {
        Object.assign(detailInfo, res);
        workStore.setWorkList([initItem(res)]);
        if (res.otherWorkApply && res.otherWorkApply.length > 0) {
          res.otherWorkApply.forEach((item) => {
            workStore.updateWorkList(initItem(item));
          });
        }
        analysisDataSplit(workStore.getWorkList);
        getStepList();
        loading.value = false;
      });
      getWorkCheckList({ workApplyId: route.query.id }).then((res) => {
        workCheckList.value = res;
      });
    }
  }

  function initItem(item) {
    let otherText = '';
    const possibleDanger = item.possibleDanger?.split(',').map((item) => {
      if (item.includes('其他伤害')) {
        otherText = item.split('-')[1];
        return item.split('-')[0];
      }
      return item;
    });
    if (item.securityMeasuresIds && item.securityMeasuresIds.length > 0) {
      item.securityMeasuresIds = item.securityMeasuresIds?.split(',').map((item) => item.toString());
    } else {
      item.securityMeasuresIds = [];
    }
    item.possibleDanger = possibleDanger;
    item.otherText = otherText;
    item.start = [item.startTimeStr, item.endTimeStr];
    item.workAnalysis = item.workAnalysisList;
    item.examineInfoList = item.examineInfoList && item.examineInfoList.length > 0 ? item.examineInfoList : [];
    item.reviewComments = '';
    item.operateMethod = item.operateMethod?.split(',');
    item.hoistingIdNumber = item.hoistingIdNumber?.split(',');
    item.hoistingCommander = item.hoistingCommander?.split(','); //@ts-ignore
    return item;
  }

  // 是否展示气体分析
  const showAnalysis = () => {
    let show = false;
    if (detailInfo.workAnalysisList && detailInfo.workAnalysisList.length > 0) {
      show = true;
    }
    return show;
  };
  const dhList = ref<any[]>([]);
  const kjList = ref<any[]>([]);
  // 多个作业处理分析逻辑
  function analysisDataSplit(data) {
    // if(data.length == 1) return;
    let donghuo: any[] = [];
    let kongjiian: any[] = [];
    if (data[0].workAnalysisList && data[0].workAnalysisList.length > 0) {
      data[0].workAnalysisList.forEach((item) => {
        if (item.analysisData) {
          donghuo.push(item);
        } else {
          kongjiian.push(item);
        }
      });
      dhList.value = donghuo;
      kjList.value = kongjiian;
    }
  }

  const beforeChange = () => {
    return true;
  };

  const stepArrs = ref<any[]>([]);
  function getStepList() {
    getWorkJobWorkDetail(detailInfo.id).then((res) => {
      stepArrs.value = res.workExamine;
    });
  }
  const reviewImg = (img) => {
    if (!img) return '';
    return getFileAccessHttpUrl(img);
  };
  const ecsDialogShow = ref(false);
  // 开始作业
  const ecsSubmit = () => {
    let workExamineId = '';
    stepArrs.value.map((item) => {
      if (item.nodeName.includes('开始作业')) {
        workExamineId = item.id;
      }
    });
    postStartWork({ workApplyId: detailInfo?.id, workExamineId: workExamineId }).then((res) => {
      showSuccessToast('操作成功！');
      router.back();
    });
  };
  // 组件销毁，清除workList的数据
  onBeforeUnmount(() => {
    workStore.resetWorkList();
  });
</script>

<style lang="less" scoped>
  ::-webkit-scrollbar {
    display: none;
  }

  .hazardous-apply {
    width: 100%;
    height: 100%;
  }

  .tab-inner {
    height: calc(100vh - 88px);
    overflow-y: scroll;
    background: #eff1f5;
    padding-bottom: 280px;
  }

  .hazardous-apply-main-nav {
    height: calc(100vh - 44px);
  }

  .footer {
    background-color: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .examineInfo {
    margin-top: 10px;
    background: #fff;
    padding: 15px;

    .tit {
      color: #1989fa;
      padding: 15px;
    }
  }

  .sig-pic {
    width: 160px;
    height: 56px;
    margin: 8px 16px;
  }

  .step-icon {
    width: 15px;
    height: 15px;
    display: flex;
    border-radius: 50%;
    justify-content: center;
    background: #a0a1a2;
    align-items: center;
    color: #ffffff;
    font-size: 12px;
    line-height: 15px;
  }

  .step-icon-active {
    background: #1989fa;
  }
  :deep(.van-field__body textarea) {
    // background-color: #ecebeb;
    border: 1px solid #e5e5e5;
    padding: 10px;
  }
  .work-record {
    background-color: #ffffff;
  }
  .work-checkitem {
    background-color: #f5f5f5;
    margin-top: 10px;
    width: calc(100% - 20px);
    margin-left: 10px;
    :deep(.van-cell) {
      background-color: transparent;
    }
  }
  .exam-list {
    background-color: #fff;
    padding: 0 16px;
    .tit1 {
      padding: 10px 0;
      color: #1989fa;
      font-weight: 600;
    }
    .tit {
      color: #1989fa;
    }
    img {
      height: 60px;
    }
  }
  .item-info {
    background-color: #ffffff;
    padding-left: 12px;
  }
  .foot {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .zrr {
    padding-left: 15px;
    font-weight: 500;
  }
</style>
