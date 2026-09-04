<template>
  <div>
    <div class="material-upload-div_block">
      <div class="file-item" v-for="(item, index) in fileList1" :key="index" @click="onPreview(item, index)">
        <!-- 图片 -->
        <van-image v-if="isImg(item.uri)" width="60" height="60" radius="4" :src="item.url" fit="cover" />
        <!-- 视频 -->
        <div class="type-icon video-icon" v-else-if="isVideo(item.uri)">
          <van-icon size="28" color="#ffffff" name="play" />
        </div>
        <!-- Word -->
        <div class="type-icon word-icon" v-else-if="isWord(item.uri)">
          <span class="ext-label">W</span>
        </div>
        <!-- Excel -->
        <div class="type-icon excel-icon" v-else-if="isExcel(item.uri)">
          <span class="ext-label">X</span>
        </div>
        <!-- PDF -->
        <div class="type-icon pdf-icon" v-else-if="isPdf(item.uri)">
          <span class="ext-label">P</span>
        </div>
        <!-- 其他 -->
        <div class="type-icon other-icon" v-else>
          <van-icon size="28" color="#ffffff" name="description" />
        </div>
        <!-- 上传中蒙层 -->
        <div v-if="item.status === 'uploading'" class="uploading-mask">
          <van-loading size="18" color="#fff" />
        </div>
        <van-icon v-if="!disabled" class="material-upload-div_del" @click.stop="onDel(index)" name="cross" />
      </div>
    </div>
    <van-uploader
      v-model="fileList1"
      :multiple="multiple"
      :max-count="maxCount"
      :max-size="maxSize * 1024 * 1024"
      :accept="accept"
      :after-read="afterRead"
      :disabled="disabled"
      :deletable="!disabled"
      :preview-image="false"
      @oversize="onOversize"
      :before-read="beforeRead"
    >
      <van-button :loading="loading" size="mini" v-if="fileList1.length < maxCount && !disabled" plain type="primary">添加附件</van-button>
    </van-uploader>
  </div>
  <basic-modal
    v-bind="$attrs"
    :close-icon="false"
    wrapClassName="sm-modal_preview"
    @register="registerModal"
    :width="1000"
    title="预览"
    :footer="false"
    destroy-on-close
  >
    <iframe :src="previewUrl" frameborder="0" style="width: 100%; height: calc(100vh - 86px)"></iframe>
  </basic-modal>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { previewFile } from '/@/api/common/api';
  import { showToast } from 'vant';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { showImagePreview } from 'vant';

  const emit = defineEmits(['update:fileList', 'change']);
  const props = defineProps({
    fileList: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    maxCount: { type: Number, default: 10 },
    maxSize: { type: Number, default: 300 }, // 300M
    accept: {
      type: String,
      default: 'docx,doc,xlsx,xls,pdf,png,jpeg,jpg,mp4',
    },
    disabled: { type: Boolean, default: false },
  });

  const [registerModal, { openModal }] = useModal();
  const previewUrl = ref('');
  const fileList1 = ref<any[]>([]);
  const loading = ref(false);

  // 文件类型判断
  const isImg   = (str?: string) => /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i.test(str || '');
  const isVideo = (str?: string) => /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(str || '');
  const isWord  = (str?: string) => /\.(doc|docx)$/i.test(str || '');
  const isExcel = (str?: string) => /\.(xls|xlsx)$/i.test(str || '');
  const isPdf   = (str?: string) => /\.pdf$/i.test(str || '');

  const trimFileName = (fileName: string) => {
    const index = fileName.lastIndexOf('_');
    const pointIndex = fileName.lastIndexOf('.');
    if (index !== -1) {
      return fileName.substring(0, index).replace('app/', '').replace('temp/', '') + '.' + fileName.substring(pointIndex + 1);
    }
    return fileName;
  };

  watch(
    () => props.fileList,
    (v: any) => {
      if (v) {
        fileList1.value = [];
        v.split(',').forEach((item) => {
          fileList1.value.push({
            url: getFileAccessHttpUrl(item),
            uri: item,
            fileName: trimFileName(item),
          });
        });
      } else {
        fileList1.value = [];
      }
    },
    { immediate: true }
  );

  // 文件上传完毕后会触发
  const afterRead = async (file) => {
    loading.value = true;
    const doUpload = (item) => {
      item.status = 'uploading';
      item.message = '上传中...';
      uploadFile({ file: item.file, data: { biz: 'app' } }, (res) => {
        if (res.success) {
          item.status = 'done';
          item.message = '';
          item.objectUrl = '';
          item.content = '';
          item.url = getFileAccessHttpUrl(res.message);
          item.uri = res.message;
          item.fileName = trimFileName(res.message);
          const val = fileList1.value.filter((f) => f.uri).map((f) => f.uri);
          emit('update:fileList', val.join(','));
        } else {
          showToast(res.message);
          item.status = 'failed';
          item.message = '上传失败';
        }
        loading.value = false;
      }).finally(() => {
        loading.value = false;
      });
    };

    if (Array.isArray(file)) {
      file.forEach(doUpload);
    } else {
      doUpload(file);
    }
  };

  const onOversize = () => {
    showToast('文件大小不能超过 300M');
  };

  const beforeRead = (file) => {
    const allowedTypes: string[] = [];
    if (props.accept.includes('docx')) allowedTypes.push('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (props.accept.includes('doc'))  allowedTypes.push('application/msword');
    if (props.accept.includes('xlsx')) allowedTypes.push('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    if (props.accept.includes('xls'))  allowedTypes.push('application/vnd.ms-excel');
    if (props.accept.includes('pdf'))  allowedTypes.push('application/pdf');
    if (props.accept.includes('png'))  allowedTypes.push('image/png');
    if (props.accept.includes('jpeg')) allowedTypes.push('image/jpeg');
    if (props.accept.includes('jpg'))  allowedTypes.push('image/jpg');
    if (props.accept.includes('mp4'))  allowedTypes.push('video/mp4');
    if (allowedTypes.includes(file.type)) {
      return file;
    } else {
      showToast(`上传格式为 ${props.accept}`);
      return false;
    }
  };

  // 预览
  const onPreview = (file, idx) => {
    // 未上传完成不做任何操作
    if (!file.uri) return;

    if (isImg(file.uri)) {
      // 图片：找出当前文件在图片子列表中的位置
      const imgList = fileList1.value.filter((f) => isImg(f.uri));
      const imgIdx = imgList.findIndex((f) => f.uri === file.uri);
      showImagePreview({
        images: imgList.map((f) => getFileAccessHttpUrl(f.uri)),
        startPosition: imgIdx >= 0 ? imgIdx : 0,
      });
    } else if (isVideo(file.uri)) {
      // 视频：直接在新标签页打开
      window.open(getFileAccessHttpUrl(file.uri), '_blank');
    } else {
      // word / excel / pdf：走后端预览接口
      previewUrl.value = '';
      previewFile(file.uri).then((res) => {
        previewUrl.value = res;
        openModal(true);
      }).catch(() => {
        showToast('预览失败，请稍后重试');
      });
    }
  };

  // 删除
  const onDel = (index: number) => {
    fileList1.value.splice(index, 1);
    const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
    emit('update:fileList', val.join(','));
  };
</script>

<style lang="less" scoped>
  .material-upload-div_block {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .file-item {
      width: 60px;
      height: 60px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 5px;
      margin-bottom: 5px;

      .material-upload-div_del {
        color: red;
        position: absolute;
        right: -5px;
        top: -5px;
        font-size: 14px;
        background: #fff;
        border-radius: 50%;
      }

      // 上传中蒙层
      .uploading-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      // 通用类型图标底座
      .type-icon {
        width: 60px;
        height: 60px;
        display: flex;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .ext-label {
          font-size: 22px;
          font-weight: bold;
          color: #fff;
          line-height: 1;
        }
      }

      .video-icon { background-color: #1989fa; }
      .word-icon  { background-color: #2b5fbe; }
      .excel-icon { background-color: #217346; }
      .pdf-icon   { background-color: #e03e2d; }
      .other-icon { background-color: #909399; }
    }
  }

  /deep/.jeecg-modal-content > .scroll-container {
    padding: 0;
  }
</style>

<style lang="less">
  .sm-modal_preview {
    z-index: 999999 !important;
    .ant-modal {
      height: 100% !important;
      top: 0;
      margin: 0;
      z-index: 9999;
      max-width: 100% !important;
      .ant-modal-content {
        height: 100% !important;
        .ant-modal-body {
          height: calc(100% - 57px) !important;
          .scrollbar__view {
            height: 100%;
            & > div {
              min-height: 100% !important;
              max-height: 100% !important;
            }
          }
        }
      }
    }
  }
</style>
