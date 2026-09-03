<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="历史事件存档"
    show-footer
    ok-text="提交"
    :width="800"
    @ok="handleSubmit"
    @close="onClose"
    destroyOnClose
  >
    <a-form :model="info" ref="infoRef" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
      <a-form-item label="事件发生单位：" name="orgCode" :rules="[{ required: true, message: '请选择事件发生单位！' }]">
        <a-select v-model:value="info.orgCode" :options="orgOptions" label-field="departName" value-field="orgCode" placeholder="请选择" />
      </a-form-item>
      <a-form-item label="损失工作日：" name="lostWorkday">
        <a-input-number v-model:value="info.lostWorkday" style="width: 100%" :min="0" :max="99999.9" :precision="1" placeholder="请输入">
          <template #addonAfter>天</template>
        </a-input-number>
      </a-form-item>
      <a-form-item label="发生时间：" name="eventTime" :rules="[{ required: true, message: '请选择发生时间！' }]">
        <a-date-picker
          v-model:value="info.eventTime"
          :show-time="{ format: 'HH:mm' }"
          style="width: 100%"
          valueFormat="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="请选择"
        />
      </a-form-item>
      <a-form-item label="事件类型：" name="type" :rules="[{ required: true, message: '请选择事件类型！' }]">
        <j-dict-select-tag
          v-model:value="info.type"
          dictCode="event_type"
          :show-choose-option="false"
          placeholder="请选择"
          :string-to-number="false"
        />
      </a-form-item>
      <a-form-item label="事件结果：" name="result" :rules="[{ required: true, message: '请选择事件结果！' }]">
        <j-dict-select-tag
          v-model:value="info.result"
          dictCode="event_result"
          :show-choose-option="false"
          placeholder="请选择"
          :string-to-number="false"
        />
      </a-form-item>
      <a-form-item label="事故描述：" name="description" :rules="[{ required: true, message: '请输入事故描述！' }]">
        <a-textarea v-model:value="info.description" placeholder="请输入" :maxlength="500" :rows="5" />
      </a-form-item>
      <a-form-item label="现场照片：" name="photo">
        <j-image-upload v-model:value="info.photo" is-watermark :file-max="10" text="" />
      </a-form-item>
      <a-form-item label="事故调查报告：" name="reportFile" :rules="[{ required: true, message: '请上传事故调查报告！' }]">
        <customize-upload v-model:value="info.reportFile" :max-count="1" accept=".pdf,.docx,.doc,.xls,.xlsx" />
      </a-form-item>
      <a-form-item label="其它相关资料：" name="photo">
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
      </a-form-item>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" name="event-history-archive" setup>
  import { useEventHistoryArchive } from './hooks/useEventHistoryArchive';
  import CustomizeUpload from '../incidentExpress/component/CustomizeUpload.vue';
  import { JDictSelectTag, JImageUpload } from '/@/components/Form';
  import { ref } from 'vue';
  const infoRef = ref(null);
  const emit = defineEmits(['success']);
  const { BasicDrawer, registerDrawer, surveyInformation, handleSubmit, info, onClose, orgOptions } = useEventHistoryArchive(emit, infoRef);
</script>
<style lang="less" scoped>
  /deep/.ant-select-selection-placeholder {
    color: #bfbfbf !important;
  }
</style>
