<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1000" title="" :show-ok-btn="false">
      <div style="text-align: center; font-size: 18px" v-if="jnEventReport.reportFile || jnEventReport.reportFile !== ''">
        {{ jnEventReport.name ? jnEventReport.name + '事件' : info.name }}
      </div>
      <investigation-report
        v-if="!(jnEventReport.reportFile || jnEventReport.reportFile !== '')"
        type="view"
        menu-type="query"
        :card-object="jnEventReport"
        id="accidentInquiryView"
      />
      <div class="view-div" v-if="jnEventReport.reportFile || jnEventReport.reportFile !== ''">
        <p>基本情况</p>
        <div class="view-div_text">事件发生单位：{{ jnEventReport.orgCode_dictText ? jnEventReport.orgCode_dictText : info.orgCode_dictText }}</div>
        <div class="view-div_text">损失工作日总数：{{ jnEventReport.lostWorkday ? jnEventReport.lostWorkday + '日' : '--' }}</div>
        <div class="view-div_text">发生时间：{{ jnEventReport.eventTime ? jnEventReport.eventTime : info.eventTime }}</div>
        <div class="view-div_text">事件类型：{{ renderDict(jnEventReport.type ? jnEventReport.type : info.type, 'event_type') }}</div>
        <div class="view-div_text">事件结果：{{ renderDict(info.result, 'event_result') }}</div>
        <div class="view-div_text">事故描述：{{ info.description }}</div>
      </div>
      <div class="view-div">
        <div>
          <a-row type="flex" :gutter="[0, 24]" class="slot_title">
            <a-col :sm="12" align="left">
              <h2>调查资料</h2>
            </a-col>
            <a-col :sm="12" align="right">
              <span style="margin-right: 10px" @click="downloadInveRe">下载调查报告</span>
              <a-button type="primary" @click="onDownloadAll">全部资料下载</a-button>
            </a-col>
          </a-row>
        </div>
        <customize-upload
          v-if="jnEventReport.reportFile || jnEventReport.reportFile !== ''"
          v-model:value="jnEventReport.reportFile"
          type="view"
          lable="事故调查报告"
        />
        <customize-upload v-model:value="jnEventSurveyFile.surveyFile" type="view" lable="现场调查记录（图纸、照片）" />
        <customize-upload v-model:value="jnEventSurveyFile.economicLossesFile" type="view" lable="直接和间接经济损失的材料" />
        <customize-upload v-model:value="jnEventSurveyFile.technologyFile" type="view" lable="技术鉴定和试验报告" />
        <customize-upload v-model:value="jnEventSurveyFile.evidenceFile" type="view" lable="物证、认证调查材料" />
        <customize-upload v-model:value="jnEventSurveyFile.medicineFile" type="view" lable="医疗部门对伤亡情况的报告" />
        <customize-upload v-model:value="jnEventSurveyFile.craftFile" type="view" lable="发生事故时工艺条件、操作情况和设计资料" />
        <customize-upload v-model:value="jnEventSurveyFile.meetingFile" type="view" lable="事故调查分析会议记录" />
        <customize-upload v-model:value="jnEventSurveyFile.reportFile" type="view" lable="有关事故的通报简报及文件" />
        <customize-upload v-model:value="jnEventSurveyFile.trainingFile" type="view" lable="相关人员培训档案" />
        <customize-upload v-model:value="jnEventSurveyFile.otherFile" type="view" lable="与事故相关的其它材料" />
      </div>
      <div class="view-div" v-if="obj.photo && obj.photo !== ''">
        <p>现场照片</p>
        <j-image-upload v-model:value="obj.photo" disabled text="" />
      </div>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="view-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import InvestigationReport from '../incidentExpress/component/InvestigationReport.vue';
  import CustomizeUpload from '../incidentExpress/component/CustomizeUpload.vue';
  import { JImageUpload } from '/@/components/Form';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { details } from './url/index';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { downloadFileAll } from '/@/api/common/api';
  const jnEventReport: any = ref({});
  const jnEventSurveyFile: any = ref({});
  const info: any = ref({});
  const obj = reactive({
    photo: '',
  });
  const eventId = ref();
  const [registerModal] = useModalInner(async (data) => {
    eventId.value = data.eventId;
    await details({ eventId: data.eventId }).then((res) => {
      jnEventReport.value = res.jnEventReport;
      jnEventSurveyFile.value = res.jnEventSurveyFile;
      info.value = res.jnEvent;
      obj.photo = '';
      obj.photo = res.jnEvent?.photo;
    });
  });
  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj?.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  const downloadInveRe = async () => {
    if (jnEventReport.value.reportFile || jnEventReport.value.reportFile !== '') {
      downloadFile(jnEventReport.value.reportFile, trimFileName(jnEventReport.value.reportFile));
    } else {
      const element = document.getElementById('accidentInquiryView');
      if (element) {
        let width = element.offsetWidth / 4;
        let height = element.offsetHeight / 4;
        const limit = 14400;
        if (height > limit) {
          const contentScale = limit / height;
          height = limit;
          width *= contentScale;
        }
        await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
        }).then((canvas) => {
          const context: any = canvas.getContext('2d');
          let orientation;
          if (context) {
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
          }
          const pageData = canvas.toDataURL('image/jpg', 1.0);
          const img = new Image();
          img.src = pageData;
          img.onload = function () {
            img.width /= 2;
            img.height /= 2;
            img.style.transform = 'scale(0.5)';
            let pdf;
            orientation = width > height ? 'l' : 'p';
            // eslint-disable-next-line
            pdf = new jsPDF(orientation, 'mm', [width, height]);
            pdf.addImage(pageData, 'jpeg', 0, 0, width, height);
            pdf.save('调查报告.pdf');
          };
        });
      }
    }
  };
  const trimFileName = (fileName: string) => {
    const index = fileName.lastIndexOf('_');
    if (index !== -1) {
      return fileName.substring(0, index) + fileName.substring(fileName.lastIndexOf('.'));
    }
    return fileName;
  };
  const onDownloadAll = async () => {
    await downloadFileAll(`/eventmanage/jnEventSurveyFile/downloadAll?eventId=${eventId.value}`, '调查资料.zip');
    await downloadInveRe();
  };
</script>
<style lang="less" scoped>
  .view-div {
    padding: 15px;
    p {
      color: #409ffd;
      font-size: 16px;
    }
    .view-div_text {
      margin: 10px 0;
    }
  }
  .slot_title {
    line-height: 62px;
    height: 52px;
    h2 {
      color: rgb(64, 159, 253);
      font-size: 16px;
      margin: 0;
    }
    span {
      color: #02a7f0;
      text-decoration: underline;
      cursor: pointer;
    }
  }
</style>
