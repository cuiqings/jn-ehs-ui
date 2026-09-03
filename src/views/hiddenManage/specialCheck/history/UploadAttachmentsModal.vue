<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="上传影像资料"
    :width="800"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
    :show-footer="showFooter"
    :show-ok-btn="showFooter"
    :cancel-text="showFooter ? '取消' : '关闭'"
  >
    <div class="upload-container">
      <!-- 图片上传区域 -->
      <div class="upload-section">
        <h3>图片上传</h3>
        <div class="upload-area">
          <a-upload
            v-model:file-list="imageList"
            :action="uploadUrl"
            :headers="headers"
            :data="{ biz: 'attachments' }"
            list-type="picture-card"
            :multiple="true"
            :before-upload="beforeImageUpload"
            @change="handleImageChange"
            @preview="handlePreview"
            accept="image/*"
          >
            <div v-if="imageList.length < 10 && showFooter">
              <PlusOutlined />
              <div class="ant-upload-text">上传图片</div>
            </div>
          </a-upload>
        </div>
      </div>

      <!-- 视频上传区域 -->
      <div class="upload-section">
        <h3>视频上传</h3>
        <div class="upload-area">
          <a-upload
            v-model:file-list="videoList"
            :action="uploadUrl"
            :headers="headers"
            :data="{ biz: 'attachments' }"
            :multiple="true"
            :before-upload="beforeVideoUpload"
            @change="handleVideoChange"
            accept="video/*"
            :show-upload-list="{ showPreviewIcon: false, showDownloadIcon: true }"
          >
            <a-button v-if="videoList.length < 10 && showFooter" type="primary">
              <UploadOutlined />
              上传视频
            </a-button>
          </a-upload>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <a-modal
      v-model:visible="previewVisible"
      :footer="null"
      :title="previewTitle"
      @cancel="handleCancelPreview"
    >
      <img :src="previewImage" style="width: 100%" />
    </a-modal>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { uploadUrl } from '/@/api/common/api';
  import { getToken } from '/@/utils/auth';
  import { uploadAttachments } from './history.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import type { UploadFile } from 'ant-design-vue';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();

  // 上传配置
  const headers = reactive({
    'X-Access-Token': getToken(),
  });

  // 文件列表
  const imageList = ref<UploadFile[]>([]);
  const videoList = ref<UploadFile[]>([]);
  
  // 预览相关
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');

  // 当前记录
  const currentRecord = ref<any>(null);
  const showFooter = ref(true);

  // 注册弹窗
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    // 重置数据
    imageList.value = [];
    videoList.value = [];
    currentRecord.value = data.record;
    showFooter.value = !!data?.showFooter;
    if (data.record.images) {
      imageList.value = data.record.images.split(',').map((i, index) => {
        return {
          uid: `image-${index}`,
          name: `图片${index + 1}`,
          status: 'done',
          url: getFileAccessHttpUrl(i),
          response: { message: i }
        } as UploadFile;
      });
    }
    if (data.record.videos) {
      videoList.value = data.record.videos.split(',').map((i, index) => {
        return {
          uid: `video-${index}`,
          name: `视频${index + 1}`,
          status: 'done',
          url: getFileAccessHttpUrl(i),
          response: { message: i }
        } as UploadFile;
      });
    }
  });

  // 图片上传前验证
  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      createMessage.error('只能上传图片格式文件！');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      createMessage.error('图片大小不能超过10MB！');
      return false;
    }
    return true;
  };

  // 视频上传前验证
  const beforeVideoUpload = (file) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      createMessage.error('只能上传视频格式文件！');
      return false;
    }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      createMessage.error('视频大小不能超过100MB！');
      return false;
    }
    return true;
  };

  // 图片上传变化处理
  const handleImageChange = (info) => {
    const { file } = info;
    if (file.status === 'error') {
      createMessage.error(`${file.name} 上传失败`);
    } else if (file.status === 'done') {
      createMessage.success(`${file.name} 上传成功`);
    }
  };

  // 视频上传变化处理
  const handleVideoChange = (info) => {
    const { file } = info;
    if (file.status === 'error') {
      createMessage.error(`${file.name} 上传失败`);
    } else if (file.status === 'done') {
      createMessage.success(`${file.name} 上传成功`);
    }
  };

  // 图片预览
  const handlePreview = (file) => {
    previewImage.value = file.url || file.thumbUrl || file.response?.message || '';
    previewVisible.value = true;
    previewTitle.value = file.name;
  };

  // 关闭预览
  const handleCancelPreview = () => {
    previewVisible.value = false;
  };

  // 确定按钮处理
  const handleOk = async () => {
    try {
      // 获取所有上传成功的文件
      const uploadedImages = imageList.value
        .filter(file => file.status === 'done')
        .map(file => file.response?.message || file.url);
      
      const uploadedVideos = videoList.value
        .filter(file => file.status === 'done')
        .map(file => file.response?.message || file.url);

      if (uploadedImages.length === 0 && uploadedVideos.length === 0) {
        createMessage.warning('请至少上传一个文件！');
        return;
      }

      // 调用后端接口
      const params = {
        id: currentRecord.value?.id,
        images: uploadedImages.join(','),
        videos: uploadedVideos.join(','),
      };

      await uploadAttachments(params);
      createMessage.success('上传成功！');
      emit('success');
      closeModal();
    } catch (error) {
      createMessage.error('上传失败，请重试！');
    }
  };

  // 取消按钮处理
  const handleCancel = () => {
    closeModal();
  };
</script>

<style lang="less" scoped>
  .upload-container {
    .upload-section {
      margin-bottom: 24px;
      
      h3 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #262626;
      }
      
      .upload-area {
        .ant-upload-select-picture-card {
          width: 104px;
          height: 104px;
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }
</style> 