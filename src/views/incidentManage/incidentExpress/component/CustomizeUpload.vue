<template>
  <div :class="isType === 'pc' ? 'material-upload' : ''">
    <span v-if="lable !== ''"><span v-if="textRequire" style="color: red">*</span>{{ lable }}：</span>
    <div class="material-upload-div">
      <div
        v-for="(item, index) in fileList1"
        :class="type === 'add' ? 'material-upload-div_block' : 'material-upload-div_none'"
        :key="index"
        @mouseover="uploadMouseover($event, index)"
        @mouseout="uploadMouseout($event, index)"
        ><span :class="isType === 'pc' ? 'underline' : 'underline break-word'" @click="onPreview(item)">{{ item.nameExhibit }}</span
        ><DeleteOutlined class="material-upload-div_del" v-show="item.show && type === 'add'" @click="onDel(index)"
      /></div>
      <div class="underline" v-if="loading === 'uploading'">上传中...</div>
      <a-upload
        name="file"
        class="avatar-uploader"
        :headers="headers"
        :accept="accept"
        :max-count="maxCount"
        :multiple="multiple"
        :show-upload-list="false"
        :action="uploadUrl"
        :fileList="fileList"
        :before-upload="beforeUpload"
        @change="onFileChange"
      >
        <div class="underline" v-if="fileList.length !== maxCount && type === 'add' && loading !== 'uploading'">添加附件</div>
      </a-upload>
    </div>
  </div>
</template>
<script setup name="replenish-material" lang="ts">
  type fileListType = {
    uid: number | string;
    status: string;
    url: string;
    name: string;
    nameExhibit: string;
    show?: boolean;
    response?: any;
  };
  import { uploadUrl } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getToken } from '/@/utils/auth';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { ref, reactive, watch } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { previewFile } from '/@/api/common/api';
  const props = defineProps({
    lable: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'add',
    },
    textRequire: {
      type: Boolean,
      default: false,
    },
    value: propTypes.oneOfType([propTypes.string]),
    // 个数
    maxCount: {
      type: Number,
      default: 10,
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true,
    },
    accept: {
      type: String,
      default: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
    },
    fileSize: {
      type: Number,
      default: 300,
    },
    isType: {
      type: String,
      default: 'pc',
    },
  });
  const { createMessage } = useMessage();
  const headers = reactive({
    'X-Access-Token': getToken(),
  });
  const emit = defineEmits(['update:value']);
  const loading = ref('');
  const uidGenerator = () => {
    return '-' + parseInt(Math.random() * 10000 + 1, 10);
  };

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
  const fileList = ref<fileListType[]>([]);
  const fileList1 = ref<fileListType[]>([]);
  // 解析数据库存储的逗号分割
  const parsePathsValue = (paths) => {
    if (!paths || paths.length === 0) {
      fileList.value = [];
      fileList1.value = [];
      return;
    }
    let list: fileListType[] = [];
    for (const item of paths.split(',')) {
      let url = getFileAccessHttpUrl(item);
      list.push({
        uid: uidGenerator(),
        name: item,
        nameExhibit: trimFileName(getFileName(item)),
        status: 'done',
        url: url,
        show: false,
        response: {
          success: true,
          message: getFileName(item),
        },
      });
    }
    fileList.value = list;
    fileList1.value = list;
  };
  watch(
    () => props.value,
    (val) => {
      parsePathsValue(val);
    },
    { immediate: true }
  );
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
    handlePathChange();
  };
  // 预览
  const onPreview = (file) => {
    previewFile(file.name).then((res) => {
      window.open(res, '_blank');
    });
  };
  const beforeUpload = (file) => {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    const acceptArr = props.accept.length > 0 ? props.accept.split(',') : [];
    const accept = acceptArr.length > 0 ? acceptArr.includes(file.name.substring(file.name.lastIndexOf('.'))) : true;
    if (!accept) createMessage.error(`上传格式只支持${props.accept}!`);
    if (!isLt) {
      createMessage.error(`文件过大，请不要超过${props.fileSize}MB!`);
    }
    return isLt && accept;
  };
  const onFileChange = (info) => {
    fileList.value = info.fileList;
    loading.value = '';
    // if (info.fileList.every((item) => item.status === 'done')) {
    //   createMessage.success(`上传成功`);
    // }
    if (info.fileList.some((item) => item.status === 'uploading')) loading.value = 'uploading';
    if (info.fileList.every((item) => item.status === 'done')) {
      for (let i = 0; i < info.fileList.length; i++) {
        if (!info.fileList[i].response.success) {
          createMessage.error(`${info.fileList[i].name} 上传失败,${info.fileList[i].response?.message}`);
        }
      }
    }
    let arr: any[] = [];
    arr = info.fileList.filter((item) => item.status === 'done' && item?.response?.success);
    fileList1.value = arr.map((item) => {
      return {
        uid: item.uid,
        name: item.response.message,
        nameExhibit: trimFileName(item.name),
        status: 'done',
        url: getFileAccessHttpUrl(item.response.message),
        show: false,
        response: {
          success: true,
        },
      };
    });
    if (info.fileList.every((item) => item.status === 'done')) {
      handlePathChange();
    }
  };
  const handlePathChange = () => {
    let uploadFiles = fileList1.value;
    let path = '';
    if (!uploadFiles || uploadFiles.length == 0) {
      path = '';
    }
    let pathList: string[] = [];
    uploadFiles.forEach((item) => {
      if (item.status === 'done') {
        pathList.push(item.name);
      }
    });
    if (pathList.length > 0) {
      path = pathList.join(',');
    }
    emit('update:value', path);
  };
</script>
<style lang="less" scoped>
  .material-upload {
    display: flex;
    line-height: 35px;
    .material-upload-div {
      flex: 1;
      display: inline-block;
      .material-upload-div_block {
        display: inline-block;
        padding-right: 24px;
        &:hover {
          background-color: aliceblue;
          padding-right: 5px;
        }
        .material-upload-div_del {
          cursor: pointer;
          padding-left: 5px;
        }
      }
      .material-upload-div_none {
        display: inline-block;
        padding-right: 10px;
        &:hover {
          background-color: aliceblue;
          padding-right: 10px;
        }
      }
    }
  }
  .underline {
    color: #02a7f0;
    text-decoration: underline;
    cursor: pointer;
  }
  .break-word {
    word-wrap: break-word;
  }
</style>
