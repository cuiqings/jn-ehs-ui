<template>
  <div>
    <div
      v-for="(item, index) in fileList1"
      class="material-upload-div_block"
      :key="index"
      @mouseover="uploadMouseover($event, index)"
      @mouseout="uploadMouseout($event, index)"
      ><span class="underline break-word" @click="onPreview(item)">{{ item.fileName }}</span
      ><DeleteOutlined v-if="item.fileName && !disabled" class="material-upload-div_del" @click="onDel(index)"
    /></div>
    <van-uploader
      v-if="fileList1.length < maxCount && !disabled"
      v-model="fileList1"
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
      <div class="underline" v-if="fileList1.length < maxCount && !disabled">添加附件</div>
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
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  const emit = defineEmits(['update:fileList', 'change']);
  const props = defineProps({
    fileList: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    maxCount: { type: Number, default: 10 },
    maxSize: { type: Number, default: 300 }, // 300M
    accept: {
      type: String,
      default: 'docx,doc,xlsx,xls,pdf,png,jpeg,jpg',
    },
    disabled: { type: Boolean, default: false },
    bizPath: {
      type: String,
      required: false,
      default: 'sm',
    },
  });
  const [registerModal, { openModal }] = useModal();
  const previewUrl = ref('');
  const fileList1 = ref<any[]>([]);
  const getFileName = (path) => {
    if (path.lastIndexOf('\\') >= 0) {
      let reg = new RegExp('\\\\', 'g');
      path = path.replace(reg, '/');
    }
    return path.substring(path.lastIndexOf('/') + 1);
  };
  const trimFileName = (fileName: string) => {
    const index = fileName.lastIndexOf('_');
    const pointIndex = fileName.lastIndexOf('.');
    if (index !== -1) {
      return fileName.substring(0, index) + '.' + fileName.substring(pointIndex + 1);
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
            fileName: trimFileName(getFileName(item)),
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
    if (file instanceof Array && file.length) {
      file.forEach(async (item) => {
        let params = {};
        params = {
          file: item.file,
          data: { biz: props.bizPath },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            item.status = 'done';
            item.message = '';
            item.objectUrl = '';
            item.content = '';
            item.url = getFileAccessHttpUrl(res.message);
            item.uri = res.message;
            item.fileName = trimFileName(getFileName(res.message));
            const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
            emit('update:fileList', val.join(','));
          } else {
            showToast(res.message);
            item.status = 'failed';
            item.message = '上传失败';
          }
        });
      });
    } else {
      file.status = 'uploading';
      file.message = '上传中...';
      let params = {};
      params = {
        file: file.file,
        data: { biz: props.bizPath },
      };
      uploadFile(params, (res) => {
        if (res.success) {
          file.status = 'done';
          file.message = '';
          file.objectUrl = '';
          file.content = '';
          file.url = getFileAccessHttpUrl(res.message);
          file.uri = res.message;
          file.fileName = trimFileName(getFileName(res.message));
          const val = fileList1.value.filter((item) => item.uri).map((item) => item.uri);
          emit('update:fileList', val.join(','));
        } else {
          showToast(res.message);
          file.status = 'failed';
          file.message = '上传失败';
        }
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
    if (type.includes(file.type)) {
      return file;
    } else {
      showToast(`上传格式为${props.accept}！`);
      return false;
    }
  };
  // 预览
  const onPreview = (file) => {
    previewUrl.value = '';
    previewFile(file.uri).then((res) => {
      previewUrl.value = res;
      openModal(true);
    });
  };
  // 移入
  const uploadMouseover = (_e: any, index: number) => {
    fileList1.value[index].show = true;
  };
  // 移出
  const uploadMouseout = (_e: any, index: number) => {
    fileList1.value[index].show = false;
  };
  // 删除
  const onDel = (index: number) => {
    fileList1.value.splice(index, 1);
  };
</script>

<style lang="less" scoped>
  .underline {
    color: #02a7f0;
    text-decoration: underline;
    cursor: pointer;
  }
  .material-upload-div_block {
    display: flex;
    align-items: center;
    .break-word {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 90%;
    }
    .material-upload-div_del {
      color: red;
      padding-left: 5px;
    }
  }
  /deep/.jeecg-modal-content > .scroll-container {
    padding: 0;
  }
</style>
<style lang="less">
  .sm-modal_preview {
    .ant-modal {
      height: 100% !important;
      top: 0;
      margin: 0;
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
