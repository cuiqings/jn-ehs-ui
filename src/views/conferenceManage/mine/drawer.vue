<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="1000"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" layout="vertical" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="24">
        <a-col class="gutter-row" :span="24">
          <a-form-item label="会议主题" name="conferenceTheme" :rules="[{ required: true, message: '请输入会议主题!' }]">
            <InputTextArea :maxlength="100" v-model:value="info.conferenceTheme" placeholder="请输入会议主题" autoSize />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="开始时间" name="startDate" :rules="[{ required: showOkBtn, message: '请选择!' }]">
            <a-date-picker
              style="width: 100%"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择"
              v-model:value="info.startDate"
              :disabled="!showOkBtn"
              :disabledDate="(current) => current && dayjs(current).isBefore(dayjs(), 'second')"
            />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="12">
          <a-form-item label="结束时间" name="endDate" :rules="[{ required: showOkBtn, message: '请选择!' }]">
            <a-date-picker
              style="width: 100%"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择"
              v-model:value="info.endDate"
              :disabled="!showOkBtn"
              :disabledDate="(current) => current && dayjs(current).isBefore(dayjs(info.startDate))"
            />
          </a-form-item>
        </a-col>
         <a-col class="gutter-row" :span="24">
          <a-form-item label="会议地点" name="location" :rules="[{ required: true, message: '请输入会议地点!' }]">
            <InputTextArea :maxlength="100" v-model:value="info.location" placeholder="请输入会议地点" autoSize />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="参会人员(至少1人)" name="userIds" :rules="[{ required: showOkBtn, message: '请输入姓名!' }]">
            <JUserModal @confirm="userChange" type="checkbox" v-model:value="info.userIds" placeholder="请选择" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="组织者" name="userId" :rules="[{ required: showOkBtn, message: '请输入姓名!' }]">
            <JUserModal v-model:value="info.userId" placeholder="请选择" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item
            label="附件"
            name="annex"
          >
            <customize-upload v-model:value="info.annex" :max-count="5" />
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item
            label="签到设置"
            name="file"
          >
            <div class="signsetting">
              <div><a-checkbox v-model:checked="info.sign">开启扫码签到</a-checkbox></div>
              <div class="s-time">签到有效期：会议开始前<a-input style="width: 100px;margin: 0 5px;" v-model:value="info.signStartTime" placeholder="请输入" />分钟至结束后<a-input style="width: 100px;margin: 0 5px;" v-model:value="info.signEndTime" placeholder="请输入" />分钟</div>
            </div>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="24">
          <a-form-item label="备注" name="remark" >
            <a-textarea :maxlength="300" :rows="3" v-model:value="info.remark" placeholder="请输入" autoSize />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </BasicDrawer>
  <cert-modal @register="registerModal" />
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import useDrawer from './hooks/useDrawer';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { Input } from 'ant-design-vue';
  import CertModal from '../../education/student/studyRecord/components/CertModal.vue';
  import CustomizeUpload from '../component/CustomizeUpload.vue';
  import { JUserModal } from '/@/components/Form';
  
  const InputTextArea = Input.TextArea;
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    registerModal,
  } = useDrawer(emit, infoForm);
  
  const userChange = (...list) => {
    let users: any[] = [];
    list[list.length - 1].forEach(val => {
      users.push({
          userId: val.id,
          username: val.username,
          realname: val.realname
      })
    });
    info.value.userList = users;
  };
</script>
<style lang="less" scoped>
  :deep(.signsetting){
    background: #f1f5fd;
    padding: 10px 15px;
    border-radius: 5px;
    .s-time{
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
    }
  }
  /deep/.ant-tabs-nav-add {
    line-height: 40px;
    width: 106px;
  }
  /deep/.ant-tabs {
    overflow: initial;
  }
  .nav {
    color: #1890ff;
    margin-bottom: 10px;
  }
  /deep/.ant-col-8 {
    width: 160px !important;
    flex: none !important;
    max-width: 160px !important;
  }
  /deep/.ant-col-16 {
    width: calc(100% - 160px) !important;
    max-width: calc(100% - 160px) !important;
    flex: none !important;
  }
</style>
