<template>
  <a-card>
    <div class="step">
      <div v-if="currentStatus !== ''">
        <div class="posit">
          <div class="radius speed-bg-color1"> </div>
        </div>
        <div class="line"></div>
        <div class="text">
          <h1 class="fonts" style="color: red">{{ currentStatus }}</h1>
        </div>
      </div>
      <div v-if="current === 11 || current === 4">
        <div class="posit">
          <div class="radius speed-bg-color"> </div>
        </div>
        <div class="line"></div>
        <div class="text">
          <h1 class="fonts">结案&nbsp;&nbsp;{{ current === 4 ? investigationConfirm.createTime : closedFilingInfo.createTime }}</h1>
        </div>
      </div>
      <template v-for="(item, index) in rectifyInfoArr" :key="index">
        <div v-if="current > 9 && item.jnEventAffirmLog">
          <div class="posit">
            <div class="radius speed-bg-color"> </div>
          </div>
          <div class="line"></div>
          <div class="text">
            <h1 class="fonts">整改落实审核&nbsp;&nbsp;{{ item.jnEventAffirmLog.updateTime }}</h1>
            <div>
              <a-row type="flex" :gutter="[0, 24]">
                <a-col :sm="3" align="right">审核人： </a-col>
                <a-col :sm="21"> {{ item.jnEventAffirmLog.affirmerName }} </a-col>
              </a-row>
              <a-row type="flex" :gutter="[0, 24]">
                <a-col :sm="3" align="right">审核结果： </a-col>
                <a-col :sm="21"> {{ item.jnEventAffirmLog.result }} </a-col>
              </a-row>
            </div>
          </div>
        </div>
        <div v-if="current > 8 && item.jnEventRectify">
          <div class="posit">
            <div class="radius speed-bg-color"> </div>
          </div>
          <div class="line"></div>
          <div class="text">
            <h1 class="fonts"
              >{{ index === rectifyInfoArr.length - 1 ? '整改落实' : '整改落实修改' }}&nbsp;&nbsp;{{ item.jnEventRectify.updateTime }}</h1
            >
            <div>
              <a-row type="flex" :gutter="[0, 24]">
                <a-col :sm="3" align="right">整改说明： </a-col>
                <a-col :sm="21"> {{ item.jnEventRectify.name }} </a-col>
              </a-row>
              <a-row type="flex" :gutter="[0, 24]" v-if="item.jnEventRectify.filePath">
                <a-col :sm="3" align="right">附件： </a-col>
                <a-col :sm="21" class="ant-col-sm-21-none"> <customize-upload v-model:value="item.jnEventRectify.filePath" type="view" /> </a-col>
              </a-row>
            </div>
          </div>
        </div>
      </template>
      <template v-for="(item, index) in jnEventReportArr" :key="index">
        <div v-if="current > 6 && item.jnEventAffirmLog">
          <div class="posit">
            <div class="radius speed-bg-color"> </div>
          </div>
          <div class="line"></div>
          <div class="text">
            <h1 class="fonts">调查报告审核&nbsp;&nbsp;{{ item.jnEventAffirmLog.updateTime }}</h1>
            <div>
              <a-row type="flex" :gutter="[0, 24]">
                <a-col :sm="3" align="right">审核人： </a-col>
                <a-col :sm="21"> {{ item.jnEventAffirmLog.affirmerName }} </a-col>
              </a-row>
              <a-row type="flex" :gutter="[0, 24]">
                <a-col :sm="3" align="right">审核结果： </a-col>
                <a-col :sm="21"> {{ item.jnEventAffirmLog.result }} </a-col>
              </a-row>
            </div>
          </div>
        </div>
        <div v-if="current > 5">
          <div class="posit">
            <div class="radius speed-bg-color"> </div>
          </div>
          <div class="line"></div>
          <div class="text">
            <h1 class="fonts"
              >{{ index === jnEventReportArr.length - 1 ? '调查报告上传' : '调查报告修改' }}&nbsp;&nbsp;{{ item.jnEventSurveyFile.updateTime }}</h1
            >
            <investigation-report type="view" is-type="app" :card-object="item.jnEventReport" :id="'investigationReport' + index" />
            <div class="material">
              <div>调查资料</div>
              <div class="investigationReport">
                <customize-upload v-model:value="item.jnEventSurveyFile.surveyFile" is-type="app" type="view" lable="现场调查记录（图纸、照片）" />
                <customize-upload
                  v-model:value="item.jnEventSurveyFile.economicLossesFile"
                  is-type="app"
                  type="view"
                  lable="直接和间接经济损失的材料"
                />
                <customize-upload v-model:value="item.jnEventSurveyFile.technologyFile" is-type="app" type="view" lable="技术鉴定和试验报告" />
                <customize-upload v-model:value="item.jnEventSurveyFile.evidenceFile" is-type="app" type="view" lable="物证、认证调查材料" />
                <customize-upload v-model:value="item.jnEventSurveyFile.medicineFile" is-type="app" type="view" lable="医疗部门对伤亡情况的报告" />
                <customize-upload
                  v-model:value="item.jnEventSurveyFile.craftFile"
                  is-type="app"
                  type="view"
                  lable="发生事故时工艺条件、操作情况和设计资料"
                />
                <customize-upload v-model:value="item.jnEventSurveyFile.meetingFile" is-type="app" type="view" lable="事故调查分析会议记录" />
                <customize-upload v-model:value="item.jnEventSurveyFile.reportFile" is-type="app" type="view" lable="有关事故的通报简报及文件" />
                <customize-upload v-model:value="item.jnEventSurveyFile.trainingFile" is-type="app" type="view" lable="相关人员培训档案" />
                <customize-upload v-model:value="item.jnEventSurveyFile.otherFile" is-type="app" type="view" lable="与事故相关的其它材料" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-if="current > 3">
        <div class="posit">
          <div class="radius speed-bg-color"> </div>
        </div>
        <div class="line"></div>
        <div class="text">
          <h1 class="fonts">调查确认&nbsp;&nbsp;{{ investigationConfirm.createTime }}</h1>
          <div>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">确认人： </a-col>
              <a-col :sm="21"> {{ investigationConfirm.affirmerName }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">确认结果： </a-col>
              <a-col :sm="21"> {{ investigationConfirm.result }} </a-col>
            </a-row>
          </div>
        </div>
      </div>
      <div v-if="current > 0">
        <div class="posit">
          <div class="radius speed-bg-color"> </div>
        </div>
        <div class="line"></div>
        <div class="text">
          <h1 class="fonts">事故确认&nbsp;&nbsp;{{ accidentConfirm.createTime }}</h1>
          <div>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">确认人： </a-col>
              <a-col :sm="21"> {{ accidentConfirm.affirmerName }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">确认结果： </a-col>
              <a-col :sm="21"> {{ accidentConfirm.result }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]" v-if="accidentConfirm.repeatEventName && accidentConfirm.repeatEventName !== ''">
              <a-col :sm="3" align="right" />
              <a-col :sm="21" class="underline" @click="goDetails(accidentConfirm.repeatEventId)"> {{ accidentConfirm.repeatEventName }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]" v-if="accidentConfirm.closeInfo && accidentConfirm.closeInfo !== ''">
              <a-col :sm="3" align="right">关闭说明： </a-col>
              <a-col :sm="21"> {{ accidentConfirm.closeInfo }} </a-col>
            </a-row>
          </div>
        </div>
      </div>
      <div>
        <div class="posit">
          <div class="radius speed-bg-color"> </div>
        </div>
        <div class="text">
          <h1 class="fonts">事故快报&nbsp;&nbsp;{{ info.createTime }}</h1>
          <div>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">发生单位： </a-col>
              <a-col :sm="21"> {{ info.orgCode }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">事件结果： </a-col>
              <a-col :sm="21"> {{ renderDict(info.result, 'event_result') }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">事件类型： </a-col>
              <a-col :sm="21"> {{ renderDict(info.type, 'event_type') }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">事件描述： </a-col>
              <a-col :sm="21"> {{ info.description }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">发生时间： </a-col>
              <a-col :sm="21"> {{ info.eventTime }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">事件地点： </a-col>
              <a-col :sm="21"> {{ info.address }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">临时处置措施： </a-col>
              <a-col :sm="21"> {{ info.interimMeasures }} </a-col>
            </a-row>
            <a-row type="flex" :gutter="[0, 24]">
              <a-col :sm="3" align="right">现场照片： </a-col>
              <a-col :sm="21" class="ant-col-sm-21-none"> <JImageUpload disabled text="" :value="info.photo" /> </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>
<script setup name="app-incident-details" lang="ts">
  import { JImageUpload } from '/@/components/Form';
  import { useDetails } from './hooks/useDetails';
  import InvestigationReport from '../component/InvestigationReport.vue';
  import CustomizeUpload from '../component/CustomizeUpload.vue';
  const {
    current,
    info,
    renderDict,
    currentStatus,
    accidentConfirm,
    investigationConfirm,
    jnEventReportArr,
    rectifyInfoArr,
    closedFilingInfo,
    goDetails,
  } = useDetails();
</script>
<style lang="less" scoped>
  /deep/.ant-card-body {
    padding: 10px 15px 0;
  }
  /deep/ .ant-col-sm-3 {
    flex: 0 0 98px;
    max-width: 98px;
    height: 30px;
    line-height: 30px;
  }
  /deep/ .ant-col-sm-21 {
    flex: 0 0 calc(100% - 98px);
    max-width: calc(100% - 98px);
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 4px;
    padding: 0 5px;
    height: auto;
    line-height: 30px;
    word-break: break-all;
  }
  .ant-col-sm-21-none {
    border: none;
  }
  .underline {
    border: none;
    text-decoration: underline;
    color: #409ffd;
  }
  /deep/ .ant-row {
    margin-bottom: 10px;
  }
  /deep/.ant-upload-list-item {
    padding: 0;
    border: none;
  }
  /deep/ .ant-upload-list-picture-card-container {
    margin: 0 8px 0 0;
  }
  h1 {
    color: #999;
    padding-left: 28px;
  }
  .step {
    width: 100%;

    & > div {
      height: auto;
      margin-bottom: 5px;
      position: relative;
      .posit {
        position: absolute;
        left: 5px;
        top: 4px;
        .radius {
          margin-top: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #999;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .speed-bg-color {
          border: 2px solid #1890ff;
        }
        .speed-bg-color1 {
          border: 2px solid #999;
        }
      }
      .line {
        height: calc(100% - 20px);
        width: 1px;
        background: #999;
        position: absolute;
        left: 10px;
        top: 23px;
      }
      .text {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .fonts {
          color: #1890ff;
        }
        .material {
          margin-left: 28px;
          padding: 10px 10px;
          background-color: #eeeeee;
          & > div:nth-child(1) {
            color: rgb(9, 247, 247);
          }
        }
      }
    }
  }
  /deep/ .ant-upload-list-picture-card-container {
    height: 90px !important;
    width: 90px !important;
  }
</style>
