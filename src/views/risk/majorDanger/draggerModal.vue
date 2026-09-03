<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="800" :title="title" destroyOnClose @cancel="close">
    <a-upload-dragger name="file" multiple :showUploadList="false" :customRequest="customRequest" :beforeUpload="beforeUpload" :fileList="fileList">
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">{{ uploadText }}</p>
      <p class="ant-upload-hint"> {{ uploadHint }} </p>
    </a-upload-dragger>
    <a-table style="margin-top: 15px" :columns="columns" :data-source="fileList" :pagination="false" bordered v-if="isTable">
      <template #size="{ record }">
        <div>
          {{ getSize(record.size) }}
        </div>
      </template>
      <template #status="{ record }">
        <div>
          <a-tag v-if="record.status === 'error' || !record.status" color="#f50">上传失败</a-tag>
          <a-tag v-if="record.status === 'success'" color="#87d068">上传成功</a-tag>
        </div>
      </template>
      <template #percent="{ record }">
        <div>
          <Progress :percent="Math.floor(record.percent)" />
        </div>
      </template>
    </a-table>
    <template #footer>
      <div>
        <a-button @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { InboxOutlined } from '@ant-design/icons-vue';
  import { message, Progress } from 'ant-design-vue';
  import axios from 'axios';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const emit = defineEmits(['success']);
  const props = defineProps({
    uploadText: {
      type: String,
      default: '',
    },
    uploadHint: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '上传',
    },
    maxSize: {
      type: Number,
      default: 5,
    },
    fileSize: {
      type: Number,
      default: 500,
    },
    isTable: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
  });
  const fileList: any = ref([]);
  const columns = [
    {
      title: props.name,
      dataIndex: 'name',
      width: 250,
      ellipsis: true,
    },
    {
      title: '大小',
      dataIndex: 'size',
      align: 'center',
      width: 150,
      slots: { customRender: 'size' },
    },
    {
      title: '进度',
      dataIndex: 'percent',
      align: 'center',
      width: 200,
      slots: { customRender: 'percent' },
    },
    {
      title: '操作',
      dataIndex: 'status',
      align: 'center',
      slots: { customRender: 'status' },
    },
  ];
  const [registerModal, { closeModal }] = useModalInner(async () => {});
  const beforeUpload = async (file: any) => {
    const isAllowedType =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
      file.type === 'application/msword' || // .doc
      file.type === 'application/vnd.ms-powerpoint' || // .ppt
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // .pptx
    if (!isAllowedType) {
      return message.error('上传格式错误，请上传.pdf、.docx、.doc、.ppt、.pptx格式的文件！');
    }
    if (file.size > props.fileSize * 1024 * 1024) {
      message.error(`${file.name} 大小超过${props.fileSize}MB！`);
      return false;
    }
    // 将文件加入fileList并初始化进度
    fileList.value.push({
      uid: file.uid, // 唯一ID
      size: file.size,
      name: file.name,
      file, // 文件对象
      percent: 0, // 初始上传进度
      status: 'uploading', // 上传状态: uploading 表示正在上传, success 表示上传成功, error 表示上传失败
    });
  };
  // 自定义上传
  const customRequest = (option) => {
    const { file } = option;
    upload(file);
  };
  const upload = async (file) => {
    const fileItem = fileList.value.find((item) => item.uid === file.uid);
    if (!fileItem) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', props.category);
    try {
      await axios
        .post(`${globSetting.uploadUrl}/rk/skRkResource/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Access-Token': getToken(),
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total > 0) {
              let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (percentCompleted >= 100) {
                percentCompleted = 99;
              }
              fileItem.percent = percentCompleted;
            }
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            fileItem.percent = 100;
            fileItem.status = 'success'; // 标记上传成功
          } else {
            fileItem.status = 'error'; // 标记上传失败
            createMessage.error(res.data.message);
          }
        });
    } catch (error) {
      fileItem.status = 'error'; // 标记上传失败
      return; // 终止上传
    }
  };
  const getSize = (size: number) => {
    let data: any = 0;
    if (size < 0.1 * 1024) {
      //如果小于0.1KB转化成B
      data = size.toFixed(2) + 'B';
    } else if (size < 0.1 * 1024 * 1024) {
      //如果小于0.1MB转化成KB
      data = (size / 1024).toFixed(2) + 'KB';
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      //如果小于0.1GB转化成MB
      data = (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      //其他转化成GB
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    const sizestr = data + '';
    const len = sizestr.indexOf('.');
    const dec = sizestr.substring(len + 1, 2);
    if (dec == '00') {
      //当小数点后为00时 去掉小数部分
      return sizestr.substring(0, len) + sizestr.substring(len + 3, 2);
    }
    return sizestr;
  };
  const close = () => {
    fileList.value = [];
    closeModal();
    emit('success');
  };
</script>
