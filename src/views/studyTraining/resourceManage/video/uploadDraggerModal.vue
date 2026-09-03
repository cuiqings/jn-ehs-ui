<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="800" :title="title" destroyOnClose @cancel="close">
    <a-upload-dragger name="file" multiple :showUploadList="false" :customRequest="customRequest" :beforeUpload="beforeUpload" :fileList="fileList">
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">{{ uploadText }}</p>
      <p class="ant-upload-hint"> {{ uploadHint }} </p>
    </a-upload-dragger>
    <a-table style="margin-top: 15px" :columns="columns" :data-source="fileList" :pagination="false" bordered>
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
  import { uploadId, preSignUrl, mergeFile } from './url/index';
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
    category: {
      type: String,
      default: '',
    },
  });
  const fileList: any = ref([]);
  const columns = [
    {
      title: '视频',
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
    const isAllowedType = file.type === 'video/mp4';
    if (!isAllowedType) {
      return message.error('上传格式错误，请上传.mp4格式的文件！');
    }
    if (file.size > 500 * 1024 * 1024) {
      message.error(`${file.name} 大小超过500MB！`);
      return false;
    }
    // const chunkSize = 5 * 1024 * 1024; // 每个分片大小为 5MB
    // const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks: any = [];
    // // 将文件切割成分片
    // for (let i = 0; i < totalChunks; i++) {
    //   const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
    //   chunks.push(chunk);
    // }
    // 将文件加入fileList并初始化进度
    fileList.value.push({
      uid: file.uid, // 唯一ID
      size: file.size,
      name: file.name,
      file, // 文件对象
      chunks,
      // totalChunks,
      currentChunk: 0, // 当前上传的分片索引
      percent: 0, // 初始上传进度
      status: 'uploading', // 上传状态: uploading 表示正在上传, success 表示上传成功, error 表示上传失败
    });
  };
  // 初始化分片上传，获取 uploadId
  const initMultipartUpload = async (suffix) => {
    const response = await uploadId({ fileType: suffix });
    return {
      uploadId: response.uploadId,
      fileName: response.filename,
    };
  };
  // 自定义上传
  const customRequest = (option) => {
    const { file } = option;
    upload(file);
  };
  const upload = async (file) => {
    // 创建一个视频元素来获取视频时长
    const videoElement = document.createElement('video');
    const url = URL.createObjectURL(file);
    videoElement.src = url;
    videoElement.addEventListener('loadedmetadata', async () => {
      const duration = parseInt(videoElement.duration); //时长为秒，取整
      const fileItem = fileList.value.find((item) => item.uid === file.uid);
      if (!fileItem) return;
      // 通过正则获取文件后缀
      const reg = /\.([a-zA-Z0-9]+)$/.exec(file.name);
      const suffix = reg ? reg[1] : '';
      if (suffix === 'mp4') {
        if (fileItem.chunks.length > 1) {
          // 初始化分片上传，获取 uploadId
          const { uploadId, fileName } = await initMultipartUpload(suffix);
          // 上传每个分片
          const promises = fileItem.chunks.map(async (chunk, index) => {
            try {
              const chunkData = await uploadChunk(chunk, index + 1, uploadId, fileName);
              // 更新上传进度
              fileItem.currentChunk += 1;
              fileItem.percent = Math.round((fileItem.currentChunk / fileItem.totalChunks) * 100);
              return chunkData;
            } catch (error) {
              fileItem.status = 'error'; // 标记上传失败
              return; // 终止上传
            }
          });
          // 等待所有分片上传完成
          await Promise.all(promises);
          // 完成分片上传，合并文件
          await completeMultipartUpload(uploadId, fileName, file.name, 'mp4', file.size, duration);
          fileItem.status = 'success'; // 标记上传成功
        } else {
          const formData = new FormData();
          formData.append('file', file); // 通过 FormData 传递文件
          formData.append('type', 'VIDEO');
          formData.append('category', props.category);
          formData.append('duration', String(duration));
          try {
            await axios
              .post(`${globSetting.uploadUrl}/edu/resource/upload`, formData, {
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
                  // 更新上传进度
                  fileItem.currentChunk += 1;
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
        }
      }
    });
  };
  // 上传单个分片
  const uploadChunk = async (chunk, partNumber, uploadId, fileName) => {
    // 获取分片上传的签名 URL
    const response = await preSignUrl({
      uploadId,
      partNumber,
      fileName,
    });
    const uploadUrl = response.url;
    // 使用签名 URL 上传分片到 Minio
    const res = await axios.put(uploadUrl, chunk, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // 返回 ETag，用于后续合并
    return {
      ETag: res.headers.etag,
      PartNumber: partNumber,
    };
  };
  // 完成分片上传，通知服务器合并文件
  const completeMultipartUpload = async (uploadId, path, fileName, type, size, duration) => {
    mergeFile({
      path,
      fileName,
      uploadId,
      fileType: type,
      size,
      duration,
      category: props.category,
    });
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
    const dec = sizestr.substr(len + 1, 2);
    if (dec == '00') {
      //当小数点后为00时 去掉小数部分
      return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
    }
    return sizestr;
  };
  const close = () => {
    fileList.value = [];
    closeModal();
    emit('success');
  };
</script>
