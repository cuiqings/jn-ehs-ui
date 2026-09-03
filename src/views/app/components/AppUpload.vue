<template>
  <div>
    <div class="material-upload-div_block">
      <div class="file-item" v-for="(item, index) in fileList1" @click="onPreview(item, index)">
        <van-image v-if="isImg(item.uri)" width="60" height="60" radius="4" :src="item.url" />
        <div class="video-icon" v-else>
          <van-icon size="32" color="#ffffff" name="play" />
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
      default: 'docx,doc,xlsx,xls,pdf,png.jpeg,jpg',
    },
    disabled: { type: Boolean, default: false },
  });
  const [registerModal, { openModal }] = useModal();
  const previewUrl = ref('');
  const fileList1 = ref<any[]>([]);
  const loading = ref(false);
  const reg = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i;
  const isImg = (str) => reg.test(str);
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
    {
      immediate: true,
    }
  );
  // 文件上传完毕后会触发
  const afterRead = async (file) => {
    loading.value = true;
    if (file instanceof Array && file.length) {
      file.forEach(async (item) => {
        let params = {};
        params = {
          file: item.file,
          data: { biz: 'app' },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            item.status = 'done';
            item.message = '';
            item.objectUrl = '';
            item.content = '';
            item.url = getFileAccessHttpUrl(res.message);
            item.uri = res.message;
            const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
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
      });
    } else {
      file.status = 'uploading';
      file.message = '上传中...';
      let params = {};
      params = {
        file: file.file,
        data: { biz: 'app' },
      };
      uploadFile(params, (res) => {
        if (res.success) {
          file.status = 'done';
          file.message = '';
          file.objectUrl = '';
          file.content = '';
          file.url = getFileAccessHttpUrl(res.message);
          file.uri = res.message;
          file.fileName = trimFileName(res.message);
          const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
          emit('update:fileList', val.join(','));
        } else {
          showToast(res.message);
          file.status = 'failed';
          file.message = '上传失败';
        }
        loading.value = false;
      }).finally(() => {
        loading.value = false;
      });
    }
  };
  const onOversize = () => {
    showToast('文件大小不能超过 300M');
  };
  const beforeRead = (file) => {
    const type: string[] = [];
    if (props.accept.includes('docx')) type.push('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (props.accept.includes('doc')) type.push('application/msword');
    if (props.accept.includes('xlsx')) type.push('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    if (props.accept.includes('xls')) type.push('application/vnd.ms-excel');
    if (props.accept.includes('pdf')) type.push('application/pdf');
    if (props.accept.includes('png')) type.push('image/png');
    if (props.accept.includes('jpeg')) type.push('image/jpeg');
    if (props.accept.includes('jpg')) type.push('image/jpg');
    if (props.accept.includes('mp4')) type.push('video/mp4');
    if (type.includes(file.type)) {
      return file;
    } else {
      showToast(`上传格式为${props.accept}！`);
      return false;
    }
  };
  // 预览
  const onPreview = (file, idx) => {
    if(isImg(file.uri)){
      preview(idx);
    } else {
      previewUrl.value = '';
      previewFile(file.uri).then((res) => {
        previewUrl.value = res;
        openModal(true);
      });
    }
  };

  // 删除
  const onDel = (index: number) => {
    fileList1.value.splice(index, 1);
    const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
    emit('update:fileList', val.join(','));
  };
  // const previewUrl = ref('');
  const getImages = () => {
    let arr: string[] = [];
    fileList1.value.forEach((item) => {
      if (isImg(item.uri)) {
        arr.push(getFileAccessHttpUrl(item.uri));
      }
    });
    return arr;
  };
  async function preview (idx: any) {
    console.log(idx);
    
    showImagePreview({
      images: getImages(),
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .underline {
    color: #02a7f0;
    text-decoration: underline;
    cursor: pointer;
    width: 200px;
  }
  .material-upload-div_block {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .break-word {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 90%;
    }
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
      }
      .video-icon {
        width: 60px;
        height: 60px;
        display: flex;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        background-color: #1988fa;
      }
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
