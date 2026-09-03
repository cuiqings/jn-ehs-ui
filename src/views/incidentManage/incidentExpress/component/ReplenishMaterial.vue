<template>
  <div>
    <basic-modal v-bind="$attrs" title="调查资料补充" width="900px" @register="registerModal" @ok="onSubmit">
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
    </basic-modal>
  </div>
</template>
<script setup name="replenish-material" lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import CustomizeUpload from './CustomizeUpload.vue';
  import { obtainMaterial, saveOrUpdateMaterial } from '../url/index';
  import { reactive } from 'vue';
  const surveyInformation = reactive({
    id: '',
    eventId: '',
    surveyFile: '',
    economicLossesFile: '',
    technologyFile: '',
    evidenceFile: '',
    medicineFile: '',
    craftFile: '',
    meetingFile: '',
    reportFile: '',
    trainingFile: '',
    otherFile: '',
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    const keys = Object.keys(surveyInformation);
    keys.forEach((item) => {
      surveyInformation[item] = '';
    });
    try {
      const obj = await obtainMaterial({ eventId: data.id });
      Object.assign(surveyInformation, obj);
      surveyInformation.eventId = data.id;
    } catch (e) {}
  });
  const onSubmit = async () => {
    try {
      const obj = await saveOrUpdateMaterial(surveyInformation);
      Object.assign(surveyInformation, obj);
      closeModal();
    } catch (e) {}
  };
</script>
