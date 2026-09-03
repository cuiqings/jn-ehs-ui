<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="事故/事件快报"
    ok-text="提交"
    :width="1100"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-steps v-if="currentStatus || currentStatus === 0" :current="current + 1" label-placement="vertical" class="accident-report-steps">
      <a-step>
        <template #title>事故快报</template>
        <template #description>
          <div style="text-align: center">
            <span>{{ accidentReportInfo.reporterName }}</span>
            <p>{{ accidentReportInfo.createTime }}</p>
          </div>
        </template>
      </a-step>
      <a-step>
        <template #title>事故确认</template>
        <template #description>
          <span style="color: red" v-if="currentStatus === 0">待确认</span>
          <div style="text-align: center">
            <span>{{ accidentConfirm.affirmerName }}</span>
            <p style="margin: 0">{{ accidentConfirm.createTime }}</p>
            <span style="color: red" v-if="currentStatus === 1">重复关闭</span>
            <span style="color: red" v-if="currentStatus === 2">非事故关闭</span>
          </div>
        </template>
      </a-step>
      <a-step v-if="currentStatus !== 1 && currentStatus !== 2">
        <template #title>调查确认</template>
        <template #description>
          <span style="color: red" v-if="currentStatus === 3">待确认</span>
          <div style="text-align: center">
            <span>{{ investigationConfirm.affirmerName }}</span>
            <p>{{ investigationConfirm.createTime }}</p>
          </div>
        </template>
      </a-step>
      <a-step v-if="currentStatus !== 1 && currentStatus !== 2 && currentStatus !== 4">
        <template #title>调查报告</template>
        <template #description>
          <span style="color: red" v-if="currentStatus === 5">待上传</span>
          <span style="color: red" v-if="currentStatus === 6">待审核</span>
          <span style="color: red" v-if="currentStatus === 7">报告审核不通过</span>
          <div style="text-align: center" v-if="currentStatus >= 8">
            <span>{{ investigationReportForm.affirmerName }}</span>
            <p>{{ investigationReportForm.updateTime }}</p>
          </div>
        </template>
      </a-step>
      <a-step v-if="currentStatus !== 1 && currentStatus !== 2 && currentStatus !== 4">
        <template #title>整改落实</template>
        <template #description>
          <span style="color: red" v-if="currentStatus === 8">待整改落实</span>
          <span style="color: red" v-if="currentStatus === 9">整改落实待审核</span>
          <span style="color: red" v-if="currentStatus === 10">审核不通过</span>
          <div style="text-align: center" v-if="currentStatus === 11">
            <span>{{ newsImplementInfo.affirmerName }}</span>
            <p>{{ newsImplementInfo.updateTime }}</p>
          </div>
        </template>
      </a-step>
      <a-step v-if="currentStatus !== 1 && currentStatus !== 2">
        <template #title>结案归档</template>
        <template #description>
          <div style="text-align: center" v-if="currentStatus === 4">
            <span>{{ investigationConfirm.affirmerName }}</span>
            <p>{{ investigationConfirm.createTime }}</p>
          </div>
          <div style="text-align: center" v-else>
            <span>{{ closedFilingInfo.affirmerName }}</span>
            <p>{{ closedFilingInfo.createTime }}</p>
          </div>
        </template>
      </a-step>
    </a-steps>
    <BasicForm class="edit" v-if="!currentStatus && currentStatus !== 0" @register="registerForm" />
    <div v-for="(item, index) in rectifyInfoArr" :key="index">
      <process-card
        v-if="(currentStatus > 9 || item.jnEventAffirmLog) && currentStatus != 11 && (drawerType === 'view' || isDetails)"
        nav-title="整改落实审核"
        :card-object="item.jnEventAffirmLog"
        :current-status="currentStatus"
      />
      <process-card
        nav-title="整改落实"
        is-slot
        v-if="(currentStatus > 8 && currentStatus != 11 && (drawerType === 'view' || isDetails)) || (drawerType !== 'view' && currentStatus === 9)"
      >
        <div class="implementation-content">
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
            <a-col :sm="3" align="right" class="implementation-content-row_label">整改说明： </a-col>
            <a-col :sm="21">
              <a-textarea v-model:value="item.jnEventRectify.name" placeholder="请输入" disabled :rows="5" />
            </a-col>
          </a-row>
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row" v-if="item.jnEventRectify.filePath">
            <a-col :sm="3" align="right" class="implementation-content-row_label">附件： </a-col>
            <a-col :sm="21">
              <customize-upload v-model:value="item.jnEventRectify.filePath" type="view" />
            </a-col>
          </a-row>
        </div>
      </process-card>
      <process-card nav-title="整改落实" is-slot v-if="currentStatus === 10 && drawerType !== 'view' && !isDetails">
        <div class="implementation-content">
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
            <a-col :sm="3" align="right" class="implementation-content-row_label"
              ><span v-if="currentStatus === 8 || currentStatus === 10" style="color: red">*</span>整改说明：
            </a-col>
            <a-col :sm="21">
              <a-textarea v-model:value="rectifyInfo.name" placeholder="请输入" :maxlength="500" :rows="5" />
            </a-col>
          </a-row>
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
            <a-col :sm="3" align="right" class="implementation-content-row_label">附件： </a-col>
            <a-col :sm="21">
              <customize-upload v-model:value="rectifyInfo.filePath" />
            </a-col>
          </a-row>
        </div>
      </process-card>
    </div>
    <div v-for="(item, index) in jnEventReportArr" :key="index">
      <process-card
        v-if="(currentStatus > 6 || item.jnEventAffirmLog) && currentStatus != 11 && (drawerType === 'view' || isDetails)"
        nav-title="调查报告审核"
        :card-object="item.jnEventAffirmLog"
        :current-status="currentStatus"
      />
      <process-card v-if="currentStatus === 7 && !isDetails && drawerType !== 'view'" nav-title="调查报告" is-slot>
        <investigation-report :card-object="item.jnEventReport" type="edit" @data-obj="dataObj" />
      </process-card>
      <process-card
        :is-title="false"
        v-if="(currentStatus > 5 && currentStatus != 11 && (drawerType === 'view' || isDetails)) || (drawerType !== 'view' && currentStatus === 6)"
        is-slot
      >
        <template #title>
          <div>
            <a-row type="flex" :gutter="[0, 24]" class="slot_title">
              <a-col :sm="12" align="left">
                <h2>调查报告</h2>
              </a-col>
              <a-col :sm="12" align="right">
                <span style="margin-right: 10px" @click="downloadInveRe(index)">下载调查报告</span>
                <a-button type="primary" @click="onDownloadAll(index)">全部资料下载</a-button>
              </a-col>
            </a-row>
          </div>
        </template>
        <investigation-report type="view" :card-object="item.jnEventReport" :id="'investigationReport' + index" @data-obj="dataObj" />
      </process-card>
      <process-card nav-title="调查资料" v-if="currentStatus > 5 && currentStatus != 11 && (drawerType === 'view' || isDetails)" is-slot>
        <div class="investigationReport">
          <customize-upload v-model:value="item.jnEventSurveyFile.surveyFile" type="view" lable="现场调查记录（图纸、照片）" />
          <customize-upload v-model:value="item.jnEventSurveyFile.economicLossesFile" type="view" lable="直接和间接经济损失的材料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.technologyFile" type="view" lable="技术鉴定和试验报告" />
          <customize-upload v-model:value="item.jnEventSurveyFile.evidenceFile" type="view" lable="物证、认证调查材料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.medicineFile" type="view" lable="医疗部门对伤亡情况的报告" />
          <customize-upload v-model:value="item.jnEventSurveyFile.craftFile" type="view" lable="发生事故时工艺条件、操作情况和设计资料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.meetingFile" type="view" lable="事故调查分析会议记录" />
          <customize-upload v-model:value="item.jnEventSurveyFile.reportFile" type="view" lable="有关事故的通报简报及文件" />
          <customize-upload v-model:value="item.jnEventSurveyFile.trainingFile" type="view" lable="相关人员培训档案" />
          <customize-upload v-model:value="item.jnEventSurveyFile.otherFile" type="view" lable="与事故相关的其它材料" />
        </div>
      </process-card>
      <process-card nav-title="调查资料" v-if="drawerType !== 'view' && !isDetails && (currentStatus === 6 || currentStatus === 7)" is-slot>
        <div class="investigationReport">
          <customize-upload
            v-model:value="surveyInformation.surveyFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="现场调查记录（图纸、照片）"
          />
          <customize-upload
            v-model:value="surveyInformation.economicLossesFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="直接和间接经济损失的材料"
          />
          <customize-upload
            v-model:value="surveyInformation.technologyFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="技术鉴定和试验报告"
          />
          <customize-upload v-model:value="surveyInformation.evidenceFile" :type="currentStatus === 6 ? 'view' : 'add'" lable="物证、认证调查材料" />
          <customize-upload
            v-model:value="surveyInformation.medicineFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="医疗部门对伤亡情况的报告"
          />
          <customize-upload
            v-model:value="surveyInformation.craftFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="发生事故时工艺条件、操作情况和设计资料"
          />
          <customize-upload v-model:value="surveyInformation.meetingFile" :type="currentStatus === 6 ? 'view' : 'add'" lable="事故调查分析会议记录" />
          <customize-upload
            v-model:value="surveyInformation.reportFile"
            :type="currentStatus === 6 ? 'view' : 'add'"
            lable="有关事故的通报简报及文件"
          />
          <customize-upload v-model:value="surveyInformation.trainingFile" :type="currentStatus === 6 ? 'view' : 'add'" lable="相关人员培训档案" />
          <customize-upload v-model:value="surveyInformation.otherFile" :type="currentStatus === 6 ? 'view' : 'add'" lable="与事故相关的其它材料" />
        </div>
      </process-card>
    </div>
    <process-card
      v-if="currentStatus > 3 && currentStatus != 11 && (drawerType === 'view' || isDetails)"
      nav-title="调查确认"
      :card-object="investigationConfirm"
    />
    <process-card
      v-if="currentStatus > 0 && currentStatus != 11 && (drawerType === 'view' || isDetails)"
      nav-title="事故确认"
      :card-object="accidentConfirm"
      :current-status="currentStatus"
      is-repeat-accident
      @go-details="goDetails"
    />
    <process-card v-if="currentStatus >= 0 && (drawerType === 'view' || isDetails || currentStatus <= 3)" nav-title="事故快报" is-slot>
      <BasicForm @register="registerForm" />
    </process-card>
    <process-card
      v-if="currentStatus === 11"
      nav-title="事故确认"
      :card-object="accidentConfirm"
      :current-status="currentStatus"
      is-repeat-accident
      @go-details="goDetails"
    />
    <process-card v-if="currentStatus === 11" nav-title="调查确认" :card-object="investigationConfirm" />
    <div v-for="(item, index) in jnEventReportArr" :key="index">
      <process-card :is-title="false" is-slot v-if="currentStatus === 11">
        <template #title>
          <div>
            <a-row type="flex" :gutter="[0, 24]" class="slot_title">
              <a-col :sm="12" align="left">
                <h2>调查报告</h2>
              </a-col>
              <a-col :sm="12" align="right">
                <span style="margin-right: 10px" @click="downloadInveRe(index)">下载调查报告</span>
                <a-button type="primary" @click="onDownloadAll(index)">全部资料下载</a-button>
              </a-col>
            </a-row>
          </div>
        </template>
        <investigation-report
          v-if="currentStatus === 11"
          type="view"
          :card-object="item.jnEventReport"
          :id="'investigationReport' + index"
          @data-obj="dataObj"
        />
      </process-card>
      <process-card nav-title="调查资料" v-if="currentStatus === 11" is-slot>
        <div class="investigationReport">
          <customize-upload v-model:value="item.jnEventSurveyFile.surveyFile" type="view" lable="现场调查记录（图纸、照片）" />
          <customize-upload v-model:value="item.jnEventSurveyFile.economicLossesFile" type="view" lable="直接和间接经济损失的材料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.technologyFile" type="view" lable="技术鉴定和试验报告" />
          <customize-upload v-model:value="item.jnEventSurveyFile.evidenceFile" type="view" lable="物证、认证调查材料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.medicineFile" type="view" lable="医疗部门对伤亡情况的报告" />
          <customize-upload v-model:value="item.jnEventSurveyFile.craftFile" type="view" lable="发生事故时工艺条件、操作情况和设计资料" />
          <customize-upload v-model:value="item.jnEventSurveyFile.meetingFile" type="view" lable="事故调查分析会议记录" />
          <customize-upload v-model:value="item.jnEventSurveyFile.reportFile" type="view" lable="有关事故的通报简报及文件" />
          <customize-upload v-model:value="item.jnEventSurveyFile.trainingFile" type="view" lable="相关人员培训档案" />
          <customize-upload v-model:value="item.jnEventSurveyFile.otherFile" type="view" lable="与事故相关的其它材料" />
        </div>
      </process-card>
      <process-card v-if="currentStatus === 11" nav-title="调查报告审核" :card-object="item.jnEventAffirmLog" :current-status="currentStatus" />
    </div>
    <div v-for="(item, index) in rectifyInfoArr" :key="index">
      <process-card nav-title="整改落实" is-slot v-if="currentStatus === 11">
        <div class="implementation-content">
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
            <a-col :sm="3" align="right" class="implementation-content-row_label">整改说明： </a-col>
            <a-col :sm="21">
              <a-textarea v-model:value="item.jnEventRectify.name" placeholder="请输入" disabled :rows="5" />
            </a-col>
          </a-row>
          <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row" v-if="item.jnEventRectify.filePath">
            <a-col :sm="3" align="right" class="implementation-content-row_label">附件： </a-col>
            <a-col :sm="21">
              <customize-upload v-model:value="item.jnEventRectify.filePath" type="view" />
            </a-col>
          </a-row>
        </div>
      </process-card>
      <process-card v-if="currentStatus === 11" nav-title="整改落实审核" :card-object="item.jnEventAffirmLog" :current-status="currentStatus" />
    </div>
    <process-card v-if="currentStatus === 5 && !isDetails && drawerType !== 'view'" nav-title="调查报告" is-slot>
      <investigation-report :card-object="record" @data-obj="dataObj" />
    </process-card>
    <process-card nav-title="调查资料" v-if="currentStatus === 5 && !isDetails && drawerType !== 'view'" is-slot>
      <div class="investigationReport">
        <customize-upload v-model:value="surveyInformation.surveyFile" lable="现场调查记录（图纸、照片）" />
        <customize-upload v-model:value="surveyInformation.economicLossesFile" lable="直接和间接经济损失的材料" />
        <customize-upload v-model:value="surveyInformation.technologyFile" lable="技术鉴定和试验报告" />
        <customize-upload v-model:value="surveyInformation.evidenceFile" lable="物证、认证调查材料" />
        <customize-upload v-model:value="surveyInformation.medicineFile" lable="医疗部门对伤亡情况的报告" />
        <customize-upload v-model:value="surveyInformation.craftFile" lable="发生事故时工艺条件、操作情况和设计资料" />
        <customize-upload v-model:value="surveyInformation.meetingFile" lable="事故调查分析会议记录" />
        <customize-upload v-model:value="surveyInformation.reportFile" lable="有关事故的通报简报及文件" />
        <customize-upload v-model:value="surveyInformation.trainingFile" lable="相关人员培训档案" />
        <customize-upload v-model:value="surveyInformation.otherFile" lable="与事故相关的其它材料" />
      </div>
    </process-card>
    <process-card nav-title="整改落实" is-slot v-if="currentStatus === 8 && !isDetails && drawerType !== 'view'">
      <div class="implementation-content">
        <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
          <a-col :sm="3" align="right" class="implementation-content-row_label"
            ><span v-if="currentStatus === 8 || currentStatus === 10" style="color: red">*</span>整改说明：
          </a-col>
          <a-col :sm="21">
            <a-textarea v-model:value="rectifyInfo.name" placeholder="请输入" :maxlength="500" :rows="5" />
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="implementation-content-row">
          <a-col :sm="3" align="right" class="implementation-content-row_label">附件： </a-col>
          <a-col :sm="21">
            <customize-upload v-model:value="rectifyInfo.filePath" />
          </a-col>
        </a-row>
      </div>
    </process-card>
    <template #footer v-if="(currentStatus || currentStatus === 0) && drawerType !== 'view' && !isDetails">
      <div class="accident-drawer_footer" v-if="currentStatus === 0">
        <a-button style="margin-right: 15px" @click="onRepeat">重复上报</a-button>
        <a-button style="margin-right: 15px" type="primary" @click="nonAccidentClose">非事故关闭</a-button>
        <a-button
          style="margin-right: 15px; background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1)"
          type="primary"
          v-auth="'incidentExpress:cactc'"
          @click="confirmAndCtc"
          >确认并结案</a-button
        >
        <a-button
          style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1)"
          type="primary"
          :loading="investigationLoading"
          v-auth="'incidentExpress:cai'"
          @click="confirmAndInvestigation"
          >确认并调查</a-button
        >
        <a-button
          type="primary"
          :loading="accidentLoading"
          v-auth="'incidentExpress:ctiar'"
          style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1)"
          @click="confirmAccident"
          >确认事故并上报</a-button
        >
      </div>
      <div class="accident-drawer_footer" v-if="currentStatus === 3">
        <a-button style="margin-right: 15px; width: 170px; height: auto; border-radius: 5px" type="primary" @click="confirmAndCtc"
          >确认并结案<br /><span style="font-size: 11px">不需要调查报告</span></a-button
        >
        <a-button
          type="primary"
          :loading="investigationLoading"
          style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1); width: 170px; height: auto; border-radius: 5px"
          @click="confirmAndInvestigation"
          >确认并调查<br />
          <span style="font-size: 11px">需要调上传查报告</span></a-button
        >
      </div>
      <div class="accident-drawer_footer" v-if="currentStatus === 5 || currentStatus === 7">
        <a-button type="primary" :loading="reviewLoading" @click="confirmReview">提交审核</a-button>
      </div>
      <div class="accident-drawer_footer" v-if="currentStatus === 6 || currentStatus === 9">
        <a-button style="margin-right: 15px" @click="onClose">取消</a-button>
        <a-button
          type="primary"
          style="background: rgba(245, 154, 35, 1); border: 1px solid rgba(245, 154, 35, 1); margin-right: 15px"
          @click="reviewFail"
          >审核不通过</a-button
        >
        <a-button type="primary" @click="reviewPass">审核通过</a-button>
      </div>
      <div class="accident-drawer_footer" v-if="currentStatus === 8 || currentStatus === 10">
        <a-button style="margin-right: 15px" @click="rectifyClose">取消</a-button>
        <a-button type="primary" :loading="rectifyConfirmReviewLoading" @click="rectifyConfirmReview">提交审核</a-button>
      </div>
    </template>
  </BasicDrawer>
  <repeat-modal @register="registerModal" @success="onSuccess" />
  <non-accident-modal @register="nonAccidentCloseModal" @success="onSuccess" />
  <reviewer-modal @register="reviewerCloseModal" @success="onSuccess" />
  <report-review @register="reportReviewModal" @success="onSuccess" />
</template>
<script lang="ts" name="accident-report-drawer" setup>
  import { useAccidentReportDrawer } from '../hooks/useAccidentReportDrawer';
  import repeatModal from '../repeatModal.vue';
  import processCard from './ProcessCard.vue';
  import nonAccidentModal from '../nonAccidentModal.vue';
  import CustomizeUpload from './CustomizeUpload.vue';
  import reviewerModal from '../reviewerModal.vue';
  import InvestigationReport from './InvestigationReport.vue';
  import reportReview from '../reportReview.vue';
  const emit = defineEmits(['success']);
  const {
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    showFooter,
    showOkBtn,
    drawerType,
    current,
    registerModal,
    onRepeat,
    onSuccess,
    nonAccidentClose,
    nonAccidentCloseModal,
    currentStatus,
    confirmAccident,
    confirmAndCtc,
    confirmAndInvestigation,
    confirmReview,
    reviewerCloseModal,
    dataObj,
    onClose,
    reviewPass,
    reviewFail,
    downloadInveRe,
    surveyInformation,
    accidentConfirm,
    investigationConfirm,
    investigationReportForm,
    jnEventReportArr,
    reportReviewModal,
    rectifyClose,
    rectifyConfirmReview,
    rectifyInfo,
    rectifyInfoArr,
    newsImplementInfo,
    closedFilingInfo,
    accidentReportInfo,
    isDetails,
    record,
    onDownloadAll,
    goDetails,
    investigationLoading,
    accidentLoading,
    reviewLoading,
    rectifyConfirmReviewLoading,
  } = useAccidentReportDrawer(emit);
</script>
<style lang="less" scoped>
  .accident-report-steps {
    position: sticky;
    top: -16px;
    background: #ffffff;
    z-index: 99999;
  }
  /deep/.ant-steps-item-content {
    width: 128px;
  }
  /deep/.ant-steps-item-icon {
    margin-left: 48px;
  }
  /*覆盖ant-design-vue 样式**/
  /deep/.ant-input[disabled],
  /deep/.ant-input-affix-wrapper-disabled,
  /deep/.ant-select-disabled,
  /deep/.ant-select-selector,
  /deep/.ant-picker-disabled {
    color: rgba(0, 0, 0, 0.6);
    background: #ffffff !important;
    // cursor: not-allowed;
  }
  /deep/.ant-picker-input > input[disabled] {
    color: rgba(0, 0, 0, 0.6);
  }
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
  .edit {
    /deep/.ant-select-disabled {
      background: #f5f5f5 !important;
      .ant-select-selector {
        background: #f5f5f5 !important;
      }
    }
  }
  .investigationReport {
    margin: 10px 0 10px 20px;
    border-radius: 5px;
  }
  /deep/ .ant-radio-wrapper-checked {
    color: #1890ff;
  }
  .slot_title {
    line-height: 62px;
    height: 52px;
    h2 {
      color: rgb(64, 159, 253);
      padding-left: 20px;
      font-size: 16px;
      margin: 0;
    }
    span {
      color: #02a7f0;
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .accident-drawer_footer {
    text-align: center;
    line-height: initial;
    margin: 10px 0;
  }
  .implementation-content {
    margin-top: 5px;
    padding: 15px;
    &-row {
      &_label {
        line-height: 35px;
      }
    }
  }
</style>
