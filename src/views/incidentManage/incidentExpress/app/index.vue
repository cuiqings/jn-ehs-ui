<template>
  <a-card>
    <p class="go-top"><span @click="viewList">查看上报</span></p>
    <a-form ref="infoRef" :model="info" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
      <a-form-item label="现场照片：" name="photo" :rules="[{ required: true, message: '现场照片' }]">
        <j-image-upload v-model:value="info.photo" :file-max="10" text="" is-watermark />
      </a-form-item>
      <a-form-item label="发生单位：" name="orgCode" :rules="[{ required: true, message: '请选择发生单位' }]">
        <a-select v-model:value="info.orgCode" :options="orgOptions" label-field="departName" value-field="orgCode" placeholder="请选择" />
      </a-form-item>
      <a-form-item label="事件结果：" name="result" :rules="[{ required: true, message: '请选择事件结果' }]">
        <j-dict-select-tag
          v-model:value="info.result"
          dictCode="event_result"
          :show-choose-option="false"
          placeholder="请选择"
          :string-to-number="false"
        />
      </a-form-item>
      <a-form-item label="事件类型：" name="type" :rules="[{ required: true, message: '请选择事件类型' }]">
        <j-dict-select-tag
          v-model:value="info.type"
          dictCode="event_type"
          :show-choose-option="false"
          placeholder="请选择"
          :string-to-number="false"
        />
      </a-form-item>
      <a-form-item label="事件描述：" name="description" :rules="[{ required: true, message: '请输入事件描述' }]">
        <a-textarea v-model:value="info.description" placeholder="请输入" :maxlength="500" :rows="5" />
      </a-form-item>
      <a-form-item label="发生时间：" name="eventTime" :rules="[{ required: true, message: '请选择发生时间' }]">
        <span
          style="display: block; height: 32px; line-height: 30px; width: 100%; border: 1px solid #d9d9d9; border-radius: 2px; padding: 0 10px"
          @click="showPicker = true"
          >{{ info.eventTime }}</span
        >
      </a-form-item>
      <a-form-item label="事件地点：" name="address" :rules="[{ required: true, message: '请输入事件地点' }]">
        <a-input v-model:value="info.address" placeholder="请输入" :maxlength="100" />
      </a-form-item>
      <a-form-item label="临时处置措施：" name="interimMeasures" :rules="[{ required: true, message: '请输入临时处置措施' }]">
        <a-textarea v-model:value="info.interimMeasures" placeholder="请输入" :maxlength="500" :rows="5" />
      </a-form-item>
    </a-form>
    <vant-date-time-picker
      :values="info.eventTime"
      value-format="YYYY-MM-DD HH:mm"
      @change-value="showPicker = false"
      :showPicker="showPicker"
      @confirm="onConfirm"
    />
    <div class="footer">
      <a-button type="primary" :loading="loading" style="width: 120px" @click="handleSubmit">提交</a-button>
    </div>
  </a-card>
</template>
<script setup name="app-incident-add" lang="ts">
  import { JDictSelectTag, JImageUpload } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  import VantDateTimePicker from './VantDateTimePicker.vue';
  import { ref } from 'vue';
  const infoRef = ref(null);
  const { handleSubmit, viewList, info, onConfirm, showPicker, loading, orgOptions } = useContent(infoRef);
</script>
<style lang="less" scoped>
  .go-top {
    text-align: right;
    span {
      color: #02a7f0;
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .footer {
    margin: 10px 0;
    text-align: center;
  }
  /deep/ .ant-upload-list-picture-card-container {
    height: 90px !important;
    width: 90px !important;
  }
</style>
