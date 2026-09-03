<template>
  <div class="gas-warning-page">
    <!-- 基本信息展示 -->
    <div class="basic-info">
      <van-divider style="margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #1890ff">基本信息</van-divider>
      <van-form label-width="auto">
        <van-field readonly name="orgCodeName" label="所属单位：">
          <template #input>
            {{ detailInfo.orgCodeName }}
          </template>
        </van-field>
        <van-field readonly name="workshopName" label="所属车间：">
          <template #input>
            {{ detailInfo.workshopName }}
          </template>
        </van-field>
        <van-field readonly name="probePosition" label="探头位置：">
          <template #input>
            {{ detailInfo.probePosition }}
          </template>
        </van-field>
        <van-field readonly name="deviceCode" label="设备编号：">
          <template #input>
            {{ detailInfo.deviceCode }}
          </template>
        </van-field>
        <van-field readonly name="concentration" label="上报浓度：">
          <template #input>
            {{ detailInfo.concentration }}
          </template>
        </van-field>
        <van-field readonly name="alarmStatus" label="报警状态：">
          <template #input>
            <span :class="getAlarmStatusClass(detailInfo.alarmStatus)">
              {{ detailInfo.alarmStatus }}
            </span>
          </template>
        </van-field>
        <van-field readonly name="alarmTime" label="报警开始/结束时间：">
          <template #input>
            {{ detailInfo.alarmTime }}
          </template>
        </van-field>
      </van-form>
    </div>
    <!-- 处理信息表单 -->
    <div class="process-form" v-if="route.query.type === 'task'">
      <van-divider style="margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #1890ff">处理信息</van-divider>
      <van-form @submit="onSubmit" ref="processFormRef">
        <van-field
          v-model="processingName"
          is-link
          readonly
          name="picker"
          label="报警类型："
          placeholder="请选择"
          required
          @click="showPicker = true"
          :rules="[{ required: true, message: '请选择报警类型' }]"
        />
        <van-field
          v-model="processForm.description"
          name="description"
          label="报警说明："
          type="textarea"
          placeholder="请输入报警说明"
          autosize
          required
          :rules="[{ required: true, message: '请输入报警说明' }]"
        />
        <van-field
          v-model="processForm.result"
          name="result"
          label="处理结果："
          type="textarea"
          placeholder="请输入处理结果"
          autosize
          required
          :rules="[{ required: true, message: '请输入处理结果' }]"
        />
        <van-field name="fileUrl" label="上传图片:" required :rules="[{ required: true, message: '请上传图片' }]">
          <template #input>
            <AppUpload v-model:fileList="processForm.fileUrl" :watermark="false" bizPath="gasWarning" />
          </template>
        </van-field>
        <div class="form-buttons">
          <van-button round block type="primary" native-type="submit" :loading="submitLoading">提交</van-button>
        </div>
      </van-form>
      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker :columns="columns" @confirm="onConfirm" @cancel="showPicker = false" />
      </van-popup>
    </div>
    <!-- 已处理状态显示 -->
    <div class="processed-info" v-if="route.query.type === 'view'">
      <van-divider style="margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #1890ff">处理信息</van-divider>
      <van-form label-width="auto">
        <van-field readonly name="userName" label="处理人：">
          <template #input>
            {{ detailInfo.userName }}
          </template>
        </van-field>
        <van-field readonly name="processingTime" label="处理时间：">
          <template #input>
            {{ detailInfo.processingTime }}
          </template>
        </van-field>
        <van-field readonly name="processingType" label="报警类型：">
          <template #input>
            {{ render.renderDictText(detailInfo.processingType, 'alarm_warnType') }}
          </template>
        </van-field>
        <van-field readonly name="description" label="报警说明：">
          <template #input>
            {{ detailInfo.description }}
          </template>
        </van-field>
        <van-field readonly name="result" label="处理结果：">
          <template #input>
            {{ detailInfo.result }}
          </template>
        </van-field>
        <van-field readonly name="fileUrl" label="处理图片：" v-if="detailInfo.fileUrl">
          <template #input>
            <div class="img-wrap">
              <van-image
                v-for="(item, index) in detailInfo.fileUrl.split(',')"
                @click.stop="previewImage(index, detailInfo.fileUrl.split(','))"
                :key="index"
                width="80"
                height="80"
                :src="getFileAccessHttpUrl(item)"
                fit="cover"
              />
            </div>
          </template>
        </van-field>
      </van-form>
    </div>
  </div>
</template>

<script setup name="AppGasWarning" lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { showToast, showImagePreview } from 'vant';
  import { detail, handle } from './index.api';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import uni from '@dcloudio/uni-webview-js';
  import { initDictOptions } from '/@/utils/dict';
  import { render } from '/@/utils/common/renderUtils';
  const route = useRoute();
  const detailInfo = ref<any>({});
  const processForm = ref({
    description: '',
    fileUrl: '',
    result: '',
    processingType: '',
  });
  const processingName = ref('');
  const columns = ref([]);
  const showPicker = ref(false);
  const processFormRef = ref();
  const submitLoading = ref(false);
  // 获取报警状态样式类
  const getAlarmStatusClass = (status) => {
    return {
      tag: true,
      danger: status === '报警中',
      success: status === '已结束',
    };
  };
  const onConfirm = (value) => {
    processingName.value = value.selectedOptions[0].title;
    processForm.value.processingType = value.selectedValues[0];
    showPicker.value = false;
  };
  // 获取详情数据
  const getDetail = async () => {
    try {
      const id: any = route.query.id;
      if (!id) {
        showToast('缺少报警ID参数');
        return;
      }
      const data = await detail({ id });
      data.alarmStatus = data.alarmStatus === '1' ? '报警中' : '已结束';
      if (data.startTime && data.endTime) {
        data.alarmTime = `${data.startTime} / ${data.endTime}`;
      } else if (data.startTime && !data.endTime) {
        data.alarmTime = `${data.startTime} / 还未结束`;
      }
      detailInfo.value = data;
    } catch (error) {
      showToast('获取详情失败');
    }
  };
  // 预览图片
  const previewImage = (index, images) => {
    let imagesArr = [];
    imagesArr = images.map((item) => getFileAccessHttpUrl(item));
    showImagePreview({
      images: imagesArr,
      startPosition: index,
      showIndex: true,
    });
  };
  // 提交处理
  const onSubmit = async () => {
    try {
      await processFormRef.value.validate();
      submitLoading.value = true;
      const id = route.query.id;
      await handle({
        id,
        description: processForm.value.description,
        fileUrl: processForm.value.fileUrl,
        processingType: processForm.value.processingType,
        result: processForm.value.result,
      });
      uni.switchTab({
        url: '/pages/index/index',
      });
    } finally {
      submitLoading.value = false;
    }
  };
  onMounted(async () => {
    getDetail();
    columns.value = await initDictOptions('alarm_warnType');
  });
</script>

<style lang="less" scoped>
  .gas-warning-page {
    padding: 10px;
    height: auto;
    background-color: #f5f5f5;
    .basic-info,
    .processed-info {
      background: #fff;
      border-radius: 8px;
      margin-bottom: 10px;
      padding: 16px;
    }
    .process-form {
      background: #fff;
      border-radius: 8px;
      padding: 16px 16px 0 16px;
    }
    :deep(.van-field) {
      padding: 12px 0;

      .van-field__label {
        color: #666;
        font-weight: 500;
      }

      .van-field__value {
        color: #333;
      }
    }

    .tag {
      padding: 0 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.success {
        background-color: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
      }

      &.warning {
        background-color: #fff7e6;
        color: #fa8c16;
        border: 1px solid #ffd591;
      }

      &.danger {
        background-color: #fff2f0;
        color: #ff4d4f;
        border: 1px solid #ffb3b3;
      }
    }

    .form-buttons {
      padding: 20px 0;
    }

    :deep(.van-divider) {
      margin: 20px 0;
      color: #333;
      font-weight: 600;
    }

    .img-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .van-image {
        border-radius: 4px;
        cursor: pointer;
      }
    }

    :deep(.van-uploader) {
      .van-uploader__wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .van-uploader__preview {
        margin: 0;
      }
    }
  }
</style>
