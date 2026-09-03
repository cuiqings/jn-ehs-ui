<template>
  <div class="hazardous-apply">
    <div class="hazardous-apply-main-nav">
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
              <div v-for="item in detailInfo.examineInfoList">
                <ul>
                  <li class="tit">{{ item.nodeName }}</li>
                  <li>
                    <SafetyDetail
                      v-if="item.nodeName.includes('安全交底') && workList[0].safetyDisclosureContent"
                      :readonly="true"
                      :formData="workList[0]"
                    />
                  </li>
                  <template v-for="citem in item.examineInfoItemList">
                    <template v-if="item.nodeName != '安全交底(作业负责人)'">
                      <li>{{ citem.operatorName }} {{ citem.createTime }}</li>
                      <li><img :src="reviewImg(citem.sign)" alt="" /></li>
                    </template>
                  </template>
                </ul>
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
        <van-tab title="安全作业检查" :name="5" v-if="workCheckList.length > 0">
          <div class="work-checkitem" v-for="item in workCheckList" :key="item.id">
            <van-field label-width="110" readonly v-model="item.head" name="applicant" input-align="right" label="检查人" />
            <van-field label-width="110" readonly v-model="item.checkTime" name="applicationTime" input-align="right" label="检查时间" />
            <van-field name="delayReason" input-align="right" label="检查结果">
              <template #input>
                {{ item.result }}
              </template>
            </van-field>
            <van-field label-width="60" v-if="item.result == '不合格'" name="delayReason" label="隐患描述">
              <template #input>
                <span style="color: #ff4d4f">{{ item.remark }}</span>
              </template>
            </van-field>
            <van-field label-align="top" input-align="left" v-if="hasCheckImg(item)">
              <template #input>
                <CheckImgView :record="item" />
              </template>
            </van-field>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <div class="footer" v-if="!readonly && isExam">
      <van-button v-if="btnText != '安全交底'" @click="back" type="primary" plain size="small" color="#1f7cf8">取消</van-button>
      <van-button v-if="!['接受交底'].includes(btnText)" @click="exchangePerson" type="primary" plain size="small" color="#1f7cf8"
        >转处理</van-button
      >
      <van-button v-if="!['安全交底', '接受交底'].includes(btnText)" @click="delayBack" type="primary" plain size="small" color="#1f7cf8"
        >审批退回</van-button
      >
      <van-button v-if="!route.query.delayedMark && !route.query.fType" @click="next" type="primary" size="small" color="#1f7cf8">
        {{ btnText }}
      </van-button>
      <van-button v-if="route.query.fType" @click="next" type="primary" size="small" color="#1f7cf8">确认</van-button>
    </div>
    <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
    </van-dialog>
    <CurLoading v-if="loading" />
    <van-popup v-model:show="workUnitGuardian" position="bottom">
      <van-picker
        :columns="userList"
        :columns-field-names="{ text: 'realname', value: 'id' }"
        @cancel="workUnitGuardian = false"
        @confirm="onConfirm($event, 'workUnitGuardian')"
      />
    </van-popup>
    <van-popup v-model:show="workUserListPickerShow" position="bottom">
      <van-picker
        :columns="workUserList"
        :columns-field-names="{ text: 'realname', value: 'id' }"
        @cancel="workUserListPickerShow = false"
        @confirm="onConfirm($event, 'nodeOperatorText')"
      />
    </van-popup>
    <van-dialog v-model:show="backShow" title="审批退回" show-cancel-button>
      <van-form ref="backForm" style="padding-bottom: 60px">
        <van-field
          v-model="delayBackFormData.delayReason"
          label-width="0"
          type="textarea"
          :maxlength="50"
          placeholder="请输入退回原因"
          name="delayReason"
          autosize
          label=" "
          :rules="[{ required: true, message: '请输入退回原因' }]"
        />
      </van-form>
      <template #footer>
        <div class="footer">
          <van-button type="default" @click="backCancle">取消</van-button>
          <van-button :loading="loading" type="primary" @click="backConfirm">确定</van-button>
        </div>
      </template>
    </van-dialog>
    <!-- 任务转处理 -->
    <van-dialog v-model:show="exchangePersonShow" title="任务转处理" show-cancel-button>
      <van-form ref="exchangeForm" style="padding-bottom: 60px">
        
        <!-- <JUserModal
            v-if="!curNodeName.includes('作业单位负责人(车间主任)')"
            url="/edu/common/pageUserList"
            :params="{roleCode: 'workshop_director', orgCode: detailInfo.workUnit}"
            :elInfo="{
              type: 'vant',
              attr: {
                label: '处理人',
                labelWidth: '60px',
                required: true,
                rules: [
                  { required: true, message: '请选择' }
                ],
              },
            }"
            v-model:value="exchangePersonData.exchangePersonId"
          /> -->
          <JUserModal
            :elInfo="{
              type: 'vant',
              attr: {
                label: '处理人',
                labelWidth: '60px',
                required: true,
                rules: [
                  { required: true, message: '请选择' }
                ],
              },
            }"
            v-model:value="exchangePersonData.exchangePersonId"
          />
      </van-form>
      <template #footer>
        <div class="footer">
          <van-button type="default" @click="exchangeCancle">取消</van-button>
          <van-button :loading="loading" type="primary" @click="exchangeConfirm">确定</van-button>
        </div>
      </template>
    </van-dialog>
    <!-- 安全交底 -->
    <van-popup v-model:show="safetySubmitShow" position="bottom" style="height: 100%">
      <SafetySubmit ref="safetySubmitRef" :formData="formData" />
      <div class="footer" v-if="!readonly && isExam">
        <van-button @click="cancelSafetySubmit" type="primary" plain size="small" color="#1f7cf8">取消</van-button>
        <van-button @click="confirmSafetySubmit" type="primary" size="small" color="#1f7cf8">签字确认</van-button>
      </div>
    </van-popup>
    <DateTimePicker
      :values="delformData.delayDate"
      @changeValue="startShow = false"
      :showPicker="startShow"
      @confirm="calendarConfirm($event, 'delayTime')"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue';
  import ApprovalProcess from './components/approvalProcess.vue';
  import SafetyDetail from '../detail/components/safetySubmit.vue';
   import JUserModal from '/@/components/App/JUserModal.vue';
  import SafetySubmit from './components/safetySubmit.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import {
    getWorkExamineBack,
    getWorkExamineInfo,
    getWorkExaminePass,
    getWorkJobWorkDetail,
    getCompleteAcceptance,
    getWorkCheckList,
    workTransferTask
  } from '../../../hazardousOperation/api/index';
  import CurLoading from '../../components/loading.vue';
  import { showSuccessToast, showFailToast, FormInstance } from 'vant';
  import { useRoute, useRouter } from 'vue-router';
  import Sign from '../../components/sign.vue';
  import StepCircle from '../../components/stepCircle.vue';
  import CheckImgView from '../components/checkImgView.vue';
  import { hasCheckImg } from '/@/views/hazardousOperation/constants/checkImg';
  import { setAppTitle } from '/@/utils/index';
  import WorkMain from '../ask/workMain.vue';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  setAppTitle();
  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);

  const readonly = computed(() => route.query.pageType === 'detail');
  const isExam = computed(() => route.query.exam);
  const loading = ref(false);
  const route = useRoute();
  const router = useRouter();
  const componentRef = ref<InstanceType<typeof WorkMain> | null>(null);
  const active = ref(1);
  const detailInfo = reactive<any>({});
  const approvalProcessRef = ref();
  const workType = ref('1');
  const workGrade = ref('');
  const signShow = ref(false);
  const signature = ref('');
  const userList = ref([]);
  const workUserList = ref([]);
  const workUserListPickerShow = ref(false);
  // 转处理
  const exchangePersonShow = ref(false);
  const exchangePersonData = reactive<any>({
    exchangePersonId: '',
  });

  const safetySubmitShow = ref(false);

  const isUnhazardousWork = computed(() => {
    return route.name === 'AppUnhazardousWorkApprovedetail';
  });

  // 按钮状态
  const btnText = computed(() => {
    let str = '审批通过';
    if (detailInfo && detailInfo.examineInfoList && detailInfo.examineInfoList[detailInfo.examineInfoList.length - 1].nodeName.includes('安全交底')) {
      str = '安全交底';
    }
    if (
      detailInfo &&
      detailInfo.examineInfoList &&
      (['接受交底'].includes(detailInfo.examineInfoList[detailInfo.examineInfoList.length - 1].nodeName) || (route.query && route.query.increment == 2))
    ) {
      str = '接受交底';
    }
    return str;
  });

  // 指定属地人

  const workUnitGuardian = ref(false);
  const backShow = ref(false);
  const examFormData = reactive({
    nodeOperator: '',
    nodeOperatorText: '',
    reviewComments: '同意',
    reviewImg: '',
    recognizance: '',
  });
  const delformData = reactive({
    applicant: '',
    applicationTime: '',
    delayDate: '',
    delayReason: '',
    id: '',
  });
  const delayBackFormData = reactive({
    delayReason: '',
  });
  const workCheckList = ref<any[]>([]);
  pageInit();
  async function pageInit() {
    // 获取作业详情
    if (route.query.id) {
      loading.value = true;
      getWorkExamineInfo({ id: route.query.id }).then((res) => {
        Object.assign(detailInfo, res);
        // componentRef.value?.pageInit(detailInfo);
        workStore.setWorkList([initItem(res)]);
        if (res.otherWorkApply && res.otherWorkApply.length > 0) {
          res.otherWorkApply.forEach((item) => {
            workStore.updateWorkList(initItem(item));
          });
        }
        workType.value = res.workType;
        loading.value = false;
        getStepList();
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
    if (item.checkAdmin === null) item.checkAdmin = '1'
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

  const beforeChange = () => {
    return true;
  };

  // 确认审批提交
  const beforeClose = (c) => {
    if (c == 'cancel') {
      signShow.value = false;
      return true;
    }
    return new Promise(async (resolve, reject) => {
      if (!signature.value) {
        showFailToast('请签名！');
        resolve(false);
      } else {
        let promisrAll = componentRef.value?.map((item) => item.submitForm());
        await Promise.all(promisrAll).then(async (res) => {
          let formData = JSON.parse(JSON.stringify(workStore.getWorkList));
          if (Array.isArray(formData[0].securityMeasuresIds)) {
            formData[0].securityMeasuresIds = formData[0].securityMeasuresIds.join(',');
          }
          if (formData[0].possibleDanger && Array.isArray(formData[0].possibleDanger)) {
            let idx = formData[0].possibleDanger.indexOf('其他伤害');
            if (idx > -1 && Array.isArray(formData[0].possibleDanger)) {
              formData[0].possibleDanger[idx] = formData[0].possibleDanger[idx] + '-' + formData[0].otherText;
            }
            formData[0].possibleDanger = formData[0].possibleDanger.join(',');
          }
          let workExamineId = formData[0].examineInfoList[detailInfo.examineInfoList.length - 1].id;
          if(route.query && route.query.increment == '2'){
            formData[0].examineInfoList.map(item=>{
              if(item.nodeName == '接受交底'){
                workExamineId = item.id;
              }
            })
          }
          if(formData[0].securityMeasuresIdList && formData[0].securityMeasuresIdList.length > 0) {
            formData[0].securityMeasuresIdList.forEach(item=>{
              if(item.annex && Array.isArray(item.annex)) {
                item.annex = item.annex.join(',');
              }
            })
          }
          
          let params: any = {
            workApplyId: formData[0].id,
            workExamineId: workExamineId,
            possibleDanger: formData[0].possibleDanger,
            otherText: formData[0].otherText,
            securityMeasuresIdList: formData[0].securityMeasuresIdList,
            securityMeasuresIds: formData[0].securityMeasuresIds,
            otherSecurityMeasures: formData[0].otherSecurityMeasures,
            otherSecurityMeasuresAnnex: formData[0].otherSecurityMeasuresAnnex,
            reviewComments: examFormData.reviewComments,
            nodeOperator: examFormData.nodeOperator,
            sign: signature.value,
            reviewImg: examFormData.reviewImg,
            annexUrl: formData[0].annexUrl,
            workContent: formData[0].workContent,
            hazardFactors: formData[0].hazardFactors,
            safetyDisclosureContent: {},
          };
          if (formData.length > 1) {
            params.otherWorkApply = formData.slice(1).map((item) => setOtherWorkSubmitData(item));
            if(params.otherWorkApply && params.otherWorkApply.length > 0) {
              params.otherWorkApply.forEach(item=>{
                if(item.securityMeasuresIdList && Array.isArray(item.securityMeasuresIdList)) {
                  item.securityMeasuresIdList.forEach(subItem=>{
                    if(subItem.annex && Array.isArray(subItem.annex)) {
                      subItem.annex = subItem.annex.join(',');
                    }
                  });
                }
              });
            }
          }
          // 后加人员 增量审批
          if (route.query.increment) {
            params.type = route.query.increment;
          }
          // if(formData.length > 1) {
          //   params.otherWorkApply = formData.slice(1);
          // }
          if (btnText.value === '安全交底') {
            let safetyData = await safetySubmitRef.value?.getData();
            params = { ...params, safetyDisclosureContent: safetyData };
            safetySubmitShow.value = false;
          }

          if (route.query.fType) {
            getCompleteAcceptance(params).then((res) => {
              if (res) {
                showSuccessToast('操作成功！');
                opendetail();
              }
            });
            return false;
          }
          getWorkExaminePass(params)
            .then(async (res) => {
              await clearPhotoCache();
              if (res) {
                showSuccessToast('操作成功！');
                opendetail();
              }
            })
            .catch((err) => {
              console.log(err);
              resolve(false);
            });
        });
      }
    });
  };

  async function clearPhotoCache() {
    await Promise.all(componentRef.value?.map((item) => item.clearPhotoCache()) || []);
  }

  function setOtherWorkSubmitData(item) {
    if (Array.isArray(item.securityMeasuresIds)) {
      item.securityMeasuresIds = item.securityMeasuresIds.join(',');
    }
    if (item.possibleDanger && Array.isArray(item.possibleDanger)) {
      let idx = item.possibleDanger.indexOf('其他伤害');
      if (idx > -1 && Array.isArray(item.possibleDanger)) {
        item.possibleDanger[idx] = item.possibleDanger[idx] + '-' + item.otherText;
      }
      item.possibleDanger = item.possibleDanger.join(',');
    }
    return {
      workType: item.workType,
      possibleDanger: item.possibleDanger,
      securityMeasuresIds: item.securityMeasuresIds,
      otherSecurityMeasures: item.otherSecurityMeasures,
      otherSecurityMeasuresAnnex: item.otherSecurityMeasuresAnnex,
      securityMeasuresIdList: item.securityMeasuresIdList,
    };
  }
  const dialogConfirm = (s) => {
    console.log(s);
  };

  const opendetail = () => {
    let url = `/app/dangerousWork/detail`;
    if (isUnhazardousWork.value) {
      url = `/app/unhazardousWork/detail`;
    }
    router.replace({ path: url, query: { id: route.query.id, workType: route.query.workType, pageType: 'detail' } });
  };

  const formData = ref<any>({});
  // 确认风险
  const next = async () => {
    let promisrAll = componentRef.value?.map((item) => item.validateForm());
    await Promise.all(promisrAll)
      .then(async (res) => {
        if (btnText.value == '安全交底') {
          formData.value = workStore.getWorkList[0];
          safetySubmitShow.value = true;
          nextTick(() => {
            safetySubmitRef.value?.init(formData.value);
          });
          return false;
        } else {
          signShow.value = true;
        }
      })
      .catch((err) => {
        showFailToast('请检查必填项');
      });
  };

  // 上一步
  const prev = () => {
    active.value = 1;
  };

  // 转处理
  const exchangeForm = ref<FormInstance|null>(null)
  const curNodeName = ref('');
  const transforming = ref(false)
  const exchangePerson = async () => {
    curNodeName.value = detailInfo.examineInfoList[detailInfo.examineInfoList.length - 1].nodeName;
    console.log(curNodeName.value);
    exchangePersonShow.value = true;
  }
  const exchangeCancle = () => {
    exchangePersonShow.value = false;
    exchangePersonData.exchangePersonId = ''
  }
  const exchangeConfirm = async () => { 
    await exchangeForm.value?.validate();
    transforming.value = true
    workTransferTask({
      id: detailInfo.id,
      userId: exchangePersonData.exchangePersonId,
    }).then((res) => { 
      showSuccessToast({ message: '转处理成功！', duration: 300 });
      router.back();
    }).finally(() => {
      transforming.value = false
      exchangeCancle();
    })
  };

  // 审批退回
  const back = () => {
    if (examFormData.reviewComments == '同意') {
      examFormData.reviewComments = '';
    }
    if (btnText.value === '审批退回') {
      backShow.value = true;
      return;
    }
    showConfirmDialog({
      title: '审批退回',
      message: '是否确认退回当前申请！',
    })
      .then(() => {
        getWorkExamineBack({
          workApplyId: detailInfo.id,
          workExamineId: detailInfo.examineInfoList[detailInfo.examineInfoList.length - 1].id,
          reviewComments: examFormData.reviewComments,
        }).then((res) => {
          showSuccessToast({ message: '删除成功！', duration: 300 });
          setTimeout(() => {
            router.back();
          }, 300);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 延迟时间
  const startShow = ref(false);
  const calendarConfirm = (val: any, key) => {
    delformData.delayDate = val;
    delformData.delayTime = val;
    startShow.value = false;
  };

  const delayBack = () => {
    backShow.value = true;
  };
  const backForm = ref(null);
  const backCancle = () => {
    delayBackFormData.delayReason = '';
    backShow.value = false;
  };

  const backConfirm = async () => {
    await backForm.value?.validate();
    loading.value = true;
    getWorkExamineBack({
      workApplyId: detailInfo.id,
      workExamineId: detailInfo.examineInfoList[detailInfo.examineInfoList.length - 1].id,
      reviewComments: delayBackFormData.delayReason,
    })
      .then(() => {
        showSuccessToast({ message: '操作成功！', duration: 300 });
        router.back();
      })
      .finally(() => {
        loading.value = false;
        backShow.value = false;
      });
  };

  const onConfirm = (e, key) => {
    switch (key) {
      case 'workUnitGuardian':
        examFormData.nodeOperator = e.selectedOptions[0].id;
        examFormData.nodeOperatorText = e.selectedOptions[0].realname;
        workUnitGuardian.value = false;
        break;
      case 'nodeOperatorText':
        examFormData.nodeOperator = e.selectedOptions[0].id;
        examFormData.nodeOperatorText = e.selectedOptions[0].realname;
        workUserListPickerShow.value = false;
        break;
      default:
        formData[key] = e.selectedOptions[0].value;
        formData[key + 'Text'] = e.selectedOptions[0].text;
    }
  };

  const cancelSafetySubmit = () => {
    safetySubmitShow.value = false;
  };
  const safetySubmitRef = ref<InstanceType<typeof SafetySubmit> | null>(null);
  const confirmSafetySubmit = async () => {
    await safetySubmitRef.value?.validate().then(value => {
      signShow.value = true;
    }).catch((err) => { 
      showFailToast('请检查必填项'); 
      return false;
    });
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
  .personitem {
    background-color: #ffffff;
    margin-top: 10px;
    padding: 16px 0;
    .tit {
      display: flex;
      padding: 0 16px;
      justify-content: space-between;
      span {
        color: #1989fa;
      }
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
</style>
