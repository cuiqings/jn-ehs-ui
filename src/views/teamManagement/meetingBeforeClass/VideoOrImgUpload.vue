<template>
  <div class="clearfix">
    <a-upload
      :listType="listType"
      :accept="accept"
      :multiple="multiple"
      :action="uploadUrl"
      :headers="headers"
      :data="{ biz: bizPath }"
      v-model:fileList="uploadFileList"
      :beforeUpload="beforeUpload"
      :disabled="disabled"
      :max-count="fileMax"
      @change="handleChange"
      @preview="handlePreview"
    >
      <template v-if="!showRemoveIcon" #removeIcon><span class="remove-icon">x</span></template>
      <div v-if="uploadVisible && !disabled">
        <div v-if="listType == 'picture-card'">
          <LoadingOutlined v-if="loading" />
          <UploadOutlined v-if="!loading && !isName" />
          <div class="ant-upload-text">{{ text }}</div>
        </div>
        <a-button v-if="listType == 'picture'" :disabled="disabled">
          <UploadOutlined />
          {{ text }}
        </a-button>
      </div>
    </a-upload>
    <player-modal @register="registerModal" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { LoadingOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { propTypes } from '/@/utils/propTypes';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl, getRandom } from '/@/utils/common/compUtils';
  import { uploadUrl } from '/@/api/common/api';
  import { getToken } from '/@/utils/auth';
  import { createImgPreview } from '/@/components/Preview/index';
  import PlayerModal from '/@/views/studyTraining/resourceManage/video/playedu-player/playerModal.vue';
  import { useModal } from '/@/components/Modal';
  const props = defineProps({
    value: propTypes.oneOfType([propTypes.string, propTypes.array]),
    listType: {
      type: String,
      required: false,
      default: 'picture-card',
    },
    text: {
      type: String,
      required: false,
      default: '上传',
    },
    bizPath: {
      type: String,
      required: false,
      default: 'teamManagement',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    fileMax: {
      type: Number,
      required: false,
      default: 10,
    },
    isName: {
      type: Boolean,
      default: false,
    },
    showRemoveIcon: {
      type: Boolean,
      default: true,
    },
    accept: {
      type: String,
      default: 'image/*,video/mp4',
    },
  });
  const emit = defineEmits(['options-change', 'change', 'update:value']);
  const [registerModal, { openModal }] = useModal();
  const { createMessage } = useMessage();
  const emitData = ref<any[]>([]);
  const [state] = useRuleFormItem(props, 'value', 'change', emitData);
  const getFileName = (path: string) => {
    if (path.lastIndexOf('\\') >= 0) {
      let reg = new RegExp('\\\\', 'g');
      path = path.replace(reg, '/');
    }
    return path.substring(path.lastIndexOf('/') + 1);
  };

  const headers = ref<object>({
    'X-Access-Token': getToken(),
  });

  const loading = ref<boolean>(false);
  const uploadFileList = ref<any[]>([]);

  const multiple = computed(() => {
    return props.fileMax > 1;
  });

  const uploadVisible = computed(() => {
    return uploadFileList.value.length < props.fileMax;
  });
  // 获取视频首帧
  function getVideoFirstFrame(videoSrc) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous'; // 避免跨域问题
      video.currentTime = 0.1; // 取第0.1秒的画面
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx: any = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  }

  watch(
    () => props.value,
    (val) => {
      if (val && val instanceof Array) {
        val = val.join(',');
      }
      initFileList(val as string);
    },
    { immediate: true }
  );

  async function initFileList(paths: string) {
    if (!paths || paths.length == 0) {
      uploadFileList.value = [];
      return;
    }
    let arr = paths.split(',');
    const files = await Promise.all(
      arr.map(async (value) => {
        let url = /^http/i.test(value) ? value : getFileAccessHttpUrl(value);
        const isVideo = value.toLowerCase().endsWith('.mp4');
        return {
          uid: getRandom(10),
          name: getFileName(value),
          status: 'done',
          url: url,
          thumbUrl: isVideo ? await getVideoFirstFrame(url) : url,
          type: isVideo ? 'video/mp4' : 'image',
          response: {
            message: value,
          },
        };
      })
    );
    uploadFileList.value = files;
  }

  async function beforeUpload(file: File) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type === 'video/mp4';

    if (!isImage && !isVideo) {
      createMessage.error('请上传图片或MP4视频文件');
      return false;
    }

    if (isVideo) {
      // 视频大小限制，这里设置为100MB
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        createMessage.error('视频大小不能超过100MB！');
        return false;
      }
    }

    return true;
  }

  async function handleChange({ file, fileList }: any) {
    if ((!file.status || ['error'].includes(file.status)) && fileList.length > 0) {
      fileList = fileList.filter((item: any) => !!item.status && !['error'].includes(item.status));
    }
    if (file.status === 'done' && file.response.code != 200) {
      createMessage.error(`${file.response.message}`);
      fileList = fileList.filter((item: any) => !(item.status === 'done' && item.response.code != 200));
    }

    // 如果是视频文件且上传完成，生成封面图
    if (file.status === 'done' && file.type === 'video/mp4') {
      // 先更新文件列表
      uploadFileList.value = fileList;
      // 异步处理视频封面图
      (async () => {
        try {
          const videoUrl = file.response.message;
          const fullVideoUrl = getFileAccessHttpUrl(videoUrl);
          const thumbnailUrl = await getVideoFirstFrame(fullVideoUrl);
          // 更新文件列表中的缩略图
          const index = fileList.findIndex((item) => item.uid === file.uid);
          if (index !== -1) {
            fileList[index] = {
              ...fileList[index],
              thumbUrl: thumbnailUrl,
              url: fullVideoUrl,
              type: 'video/mp4',
              status: 'done',
            };
            // 更新文件列表
            uploadFileList.value = [...fileList];
          }
        } catch (error) {
          console.error('生成视频封面图失败:', error);
          createMessage.error('生成视频封面图失败，请重试');
        }
      })();
    } else {
      uploadFileList.value = fileList;
    }
    if (file.status === 'error') {
      createMessage.error(`${file.name} 上传失败.`);
    }
    let fileUrls: any = [];
    if (file.status != 'uploading') {
      fileList.forEach((file: any) => {
        if (file.status === 'done') {
          fileUrls.push(file.response.message);
        }
      });
      if (file.status === 'removed') {
        handleDelete(file);
      }
    }
    if (fileList.every((item: any) => item.status === 'done')) {
      state.value = fileUrls.join(',');
      emit('update:value', fileUrls.join(','));
    }
  }

  function handleDelete(file: any) {
    console.log('Delete file:', file);
  }

  function handlePreview(file: any) {
    if (!file) return;
    const url = file.url || file.thumbUrl;
    if (file.type === 'video/mp4') {
      // 使用 playerModal 预览视频
      const videoUrl = file.response?.message || url;
      openModal(true, {
        url: [getFileAccessHttpUrl(videoUrl)],
        id: getRandom(10),
      });
    } else {
      createImgPreview({
        scaleStep: 5,
        imageList: [url],
      });
    }
  }
</script>

<style scoped>
  .ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
  }
  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
  .remove-icon {
    color: #ffffff;
    font-size: 16px;
  }
</style>
