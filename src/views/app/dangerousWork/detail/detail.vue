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
            <van-field name="delayReason" label-align="top" input-align="left" label="是否转交权限">
              <template #input>
                <div v-if="item.transfer !== '1'">未转交</div>
                <div v-else>
                  <div style="margin-bottom: 4px"><span style="color: #1890ff; font-weight: 600">(1)</span> 已转交</div>
                  <div style="margin-bottom: 8px">
                    <div><span style="color: #1890ff; font-weight: 600">(2)</span> 转交人:</div>
                    <div style="padding: 4px 0; color: #333">{{ item.assignName }}</div>
                  </div>
                  <div style="margin-bottom: 8px">
                    <div><span style="color: #1890ff; font-weight: 600">(3)</span> 转交原因:</div>
                    <div style="padding: 4px 0; color: #333">{{ item.roleAssignRemark }}</div>
                  </div>
                  <div v-if="item.annex && item.annex.length">
                    <div style="margin-bottom: 4px"><span style="color: #1890ff; font-weight: 600">(4)</span> 转交附件:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px">
                      <template v-for="(url, idx) in item.annex" :key="idx">
                        <AppUpload v-if="isAnnexImg(url)" :fileList="url" :disabled="true" />
                        <span v-else style="color: #1890ff" @click="previewAnnexFile(url)">{{ url.split('/').pop() }}</span>
                      </template>
                    </div>
                  </div>
                </div>
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
            <!-- 删除按钮：仅进行中/作业中断状态且属于当前用户的检查记录显示 -->
            <div v-if="canDeleteCheck && isMyCheckRecord(item)" class="check-delete-row">
              <van-button
                type="danger"
                size="small"
                plain
                @click="handleDeleteCheck(item)"
              >删除</van-button>
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
  import { getWorkJobWorkDetail, getWorkDetail, getWorkCheckList, postStartWork, deleteWorkCheck } from '../../../hazardousOperation/api/index';
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
  import { showSuccessToast, showConfirmDialog } from 'vant';
  import { useUserStore } from '/@/store/modules/user';

  setAppTitle();
  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);

  const userStore = useUserStore();
  // 只有从作业管理（showDelete=1）且状态为进行中/作业中断时才允许删除
  const canDeleteCheck = computed(() => {
    if (route.query.showDelete !== '1') return false;
    const s = String(route.query.workState || '');
    return s === '3' || s === '7' || s === '作业中' || s === '作业中断';
  });
  // 判断转交附件是否是图片
  const annexImgExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const isAnnexImg = (url: string) => annexImgExts.includes(url.split('.').pop()?.toLowerCase() || '');
  // 预览非图片附件
  const previewAnnexFile = (url: string) => window.open(getFileAccessHttpUrl(url), '_blank');

  // 判断该检查记录是否属于当前登录用户（用 realname 比对 head 姓名）
  const isMyCheckRecord = (item) => {
    const realname = String(userStore.getUserInfo?.realname || '');
    if (!realname) return false;
    return String(item.head || '') === realname;
  };
  // 删除检查记录
  const handleDeleteCheck = (item) => {
    showConfirmDialog({ title: '提示', message: '确认删除该检查记录？' })
      .then(async () => {
        await deleteWorkCheck({ id: item.id });
        showSuccessToast('删除成功');
        // 刷新检查列表
        getWorkCheckList({ workApplyId: route.query.id }).then((res) => {
          workCheckList.value = res;
        });
      })
      .catch(() => {});
  };

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
  .check-delete-row {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px 12px;
    background-color: #f5f5f5;
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
