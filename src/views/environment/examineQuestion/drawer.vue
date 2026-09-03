<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="800"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroy-on-close
  >
    <BasicForm v-if="type !== 'view'" @register="registerForm" />
    <a-form v-if="type === 'view'" :model="info" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
      <a-form-item label="所属机构">
        <a-input v-model:value="info.subsidiaryName" disabled />
      </a-form-item>
      <a-form-item label="检查部位">
        <a-textarea auto-size v-model:value="info.checkSite" disabled />
      </a-form-item>
      <a-form-item label="问题描述">
        <a-textarea auto-size v-model:value="info.description" disabled />
      </a-form-item>
      <a-form-item label="问题照片">
        <j-image-upload v-if="info.image" v-model:value="info.image" disabled />
        <span v-else style="color: rgba(0, 0, 0, 0.3)">无</span>
      </a-form-item>
      <a-form-item label="整改期限">
        <a-input v-model:value="info.reviseDate" disabled />
      </a-form-item>
      <a-form-item label="整改责任部门">
        <a-input v-model:value="info.dutyDepart" disabled />
      </a-form-item>
      <a-form-item label="责任人">
        <a-input v-model:value="info.dutyPerson" disabled />
      </a-form-item>
      <div v-for="(item, index) in info.jnEnvironmentalProblemChecklistRecordVos" :key="index">
        <div v-if="item.rectFeedback">
          <a-divider orientation="left" :plain="true" style="color: #1890ff">整改记录</a-divider>
          <a-form-item label="整改结果">
            <a-radio v-model:checked="item.rectResult" disabled>{{ item.rectResult === '0' ? '整改中' : '整改完成' }}</a-radio>
          </a-form-item>
          <a-form-item label="整改反馈">
            <a-textarea v-model:value="item.rectFeedback" auto-size disabled />
          </a-form-item>
          <a-form-item label="整改照片">
            <j-image-upload v-model:value="item.rectImage" disabled />
          </a-form-item>
          <div v-if="item.reviewResult && item.reviewDetail">
            <a-divider orientation="left" :plain="true" style="color: #1890ff">问题复查</a-divider>
            <a-form-item label="复查结果">
              <a-radio v-model:checked="item.reviewResult" disabled>{{ item.reviewResult === '0' ? '通过' : '不通过' }}</a-radio>
            </a-form-item>
            <a-form-item label="复查说明">
              <a-textarea v-model:value="item.reviewDetail" auto-size disabled />
            </a-form-item>
            <a-form-item label="复查照片">
              <j-image-upload v-model:value="item.reviewImage" disabled />
            </a-form-item>
          </div>
        </div>
      </div>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  import { JImageUpload } from '/@/components/Form';
  const emit = defineEmits(['success']);
  const { BasicDrawer, registerDrawer, title, showFooter, showOkBtn, BasicForm, registerForm, handleSubmit, type, info } = useDrawer(emit);
</script>
<style lang="less" scoped></style>
